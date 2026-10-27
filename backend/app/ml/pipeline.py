"""Two-stage inference: SegFormer-B0 localisation then Siamese damage classing.

This mirrors `ml/inference.py` (the ML team's deliverable) and reuses its model
definitions, with three additions the web application needs:

* softmax confidence per building, not just the argmax label;
* batched Stage 2 so a tile with hundreds of buildings stays responsive;
* the building mask is upsampled to the true image size rather than a
  hard-coded 1024x1024, so non-xBD-sized uploads stay aligned with their crops.

Damage codes follow the handoff: 1=no-damage, 2=minor, 3=major, 4=destroyed.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np
import torch
from shapely.geometry import Polygon, mapping

from app.ml.runtime import get_models, inference_lock

IMG_SIZE = 512
PATCH = 96
CROP_PAD = 8
BATCH = 64
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)

DAMAGE_NAMES = {1: "no-damage", 2: "minor", 3: "major", 4: "destroyed"}
DAMAGE_LABELS = {1: "No Damage", 2: "Minor Damage", 3: "Major Damage", 4: "Destroyed"}
DAMAGE_COLORS = {1: "#10b981", 2: "#eab308", 3: "#f97316", 4: "#ef4444"}


@dataclass
class BuildingPrediction:
    index: int
    polygon: Polygon
    contour: np.ndarray
    damage: int
    confidence: float
    probabilities: list[float]
    area_px: float
    centroid: tuple[float, float]

    @property
    def damage_name(self) -> str:
        return DAMAGE_NAMES[self.damage]


@dataclass
class PipelineResult:
    buildings: list[BuildingPrediction]
    image_width: int
    image_height: int
    post_image: np.ndarray = field(repr=False)

    def geojson(self) -> dict[str, object]:
        """Building-level FeatureCollection in pixel coordinates."""
        return {
            "type": "FeatureCollection",
            "properties": {
                "crs": "pixel",
                "imageWidth": self.image_width,
                "imageHeight": self.image_height,
                "note": "Coordinates are image pixels (x, y), not lon/lat.",
            },
            "features": [
                {
                    "type": "Feature",
                    "id": b.index,
                    "geometry": mapping(b.polygon),
                    "properties": {
                        "buildingIndex": b.index,
                        "damage": b.damage,
                        "damage_name": b.damage_name,
                        "damageLabel": DAMAGE_LABELS[b.damage],
                        "confidence": round(b.confidence, 4),
                        "areaPx": round(b.area_px, 1),
                        "color": DAMAGE_COLORS[b.damage],
                    },
                }
                for b in self.buildings
            ],
        }


def _norm_tensor(img_rgb: np.ndarray, size: int) -> np.ndarray:
    x = cv2.resize(img_rgb, (size, size)).astype(np.float32) / 255.0
    return ((x - MEAN) / STD).transpose(2, 0, 1)


def _read_rgb(path: Path) -> np.ndarray:
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Could not decode image: {path.name}")
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


def _crop(img: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    x, y, w, h = box
    patch = img[max(0, y - CROP_PAD) : y + h + CROP_PAD, max(0, x - CROP_PAD) : x + w + CROP_PAD]
    if patch.size == 0:
        patch = np.zeros((PATCH, PATCH, 3), np.uint8)
    return _norm_tensor(patch, PATCH)


def run_pipeline(pre_path: Path, post_path: Path, min_area: int = 40) -> PipelineResult:
    """Run localisation then damage classification on one pre/post pair."""
    seg, sia = get_models()
    device = next(sia.parameters()).device

    pre_rgb = _read_rgb(pre_path)
    post_rgb = _read_rgb(post_path)
    if pre_rgb.shape != post_rgb.shape:
        post_rgb = cv2.resize(post_rgb, (pre_rgb.shape[1], pre_rgb.shape[0]))

    height, width = pre_rgb.shape[:2]
    post_bgr = cv2.cvtColor(post_rgb, cv2.COLOR_RGB2BGR)

    with inference_lock():
        # Stage 1 - building mask from the pre-disaster image.
        inp = torch.from_numpy(_norm_tensor(pre_rgb, IMG_SIZE)).unsqueeze(0).float().to(device)
        with torch.no_grad():
            logits = seg(pixel_values=inp).logits
            up = torch.nn.functional.interpolate(
                logits, size=(height, width), mode="bilinear", align_corners=False
            )
            mask = (up.argmax(1)[0].cpu().numpy() == 1).astype(np.uint8)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        kept: list[tuple[np.ndarray, Polygon, float]] = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < min_area or len(contour) < 4:
                continue
            polygon = Polygon(contour.reshape(-1, 2))
            if not polygon.is_valid:
                continue
            kept.append((contour, polygon, area))

        buildings: list[BuildingPrediction] = []
        for start in range(0, len(kept), BATCH):
            chunk = kept[start : start + BATCH]
            boxes = [cv2.boundingRect(c) for c, _, _ in chunk]
            pre_batch = np.stack([_crop(pre_rgb, b) for b in boxes])
            post_batch = np.stack([_crop(post_rgb, b) for b in boxes])

            # Stage 2 - damage class per building from the aligned patch pair.
            with torch.no_grad():
                probs = torch.softmax(
                    sia(
                        torch.from_numpy(pre_batch).float().to(device),
                        torch.from_numpy(post_batch).float().to(device),
                    ),
                    dim=1,
                ).cpu().numpy()

            for offset, (contour, polygon, area) in enumerate(chunk):
                row = probs[offset]
                damage = int(row.argmax()) + 1
                cx, cy = polygon.centroid.x, polygon.centroid.y
                buildings.append(
                    BuildingPrediction(
                        index=len(buildings),
                        polygon=polygon,
                        contour=contour,
                        damage=damage,
                        confidence=float(row.max()),
                        probabilities=[float(v) for v in row],
                        area_px=float(area),
                        centroid=(float(cx), float(cy)),
                    )
                )

    return PipelineResult(
        buildings=buildings,
        image_width=width,
        image_height=height,
        post_image=post_bgr,
    )
