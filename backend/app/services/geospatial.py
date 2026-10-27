"""Severity heatmap and priority zones derived from building-level predictions.

Follows the method in the paper: each building's severity (1-4) is added to a
coarse 32-pixel grid at its centroid, the grid is Gaussian-smoothed, upsampled
to image resolution and normalised to [0, 1]. Priority zones are the hot
regions, ranked by their concentration of major and destroyed buildings.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
from scipy.ndimage import gaussian_filter
from shapely.geometry import Point, Polygon

from app.ml.pipeline import BuildingPrediction

CELL = 32
SIGMA = 1.6
HOT_THRESHOLD = 0.55
MIN_ZONE_AREA_PX = 4 * CELL * CELL
MIN_ZONE_BUILDINGS = 3
CLOSE_KERNEL = 2 * CELL + 1

RANK_LABELS = ["Critical", "High", "Moderate", "Low"]


@dataclass
class PriorityZone:
    rank: int
    priority_rank: str
    polygon: Polygon
    severity_score: float
    building_count: int
    destroyed_count: int
    major_count: int
    minor_count: int
    no_damage_count: int


def severity_grid(
    buildings: list[BuildingPrediction], width: int, height: int
) -> np.ndarray:
    """Accumulate severity on the coarse grid and smooth it."""
    gw = max(1, width // CELL)
    gh = max(1, height // CELL)
    grid = np.zeros((gh, gw), np.float32)

    for building in buildings:
        cx, cy = building.centroid
        gx = min(gw - 1, max(0, int(cx // CELL)))
        gy = min(gh - 1, max(0, int(cy // CELL)))
        grid[gy, gx] += float(building.damage)

    return gaussian_filter(grid, sigma=SIGMA)


def severity_heatmap(
    buildings: list[BuildingPrediction], width: int, height: int
) -> np.ndarray:
    """Return the normalised [0, 1] severity surface at image resolution."""
    grid = severity_grid(buildings, width, height)
    peak = float(grid.max())
    if peak > 0:
        grid = grid / peak
    return cv2.resize(grid, (width, height), interpolation=cv2.INTER_CUBIC).clip(0.0, 1.0)


def render_heatmap_overlay(
    post_image_bgr: np.ndarray, heatmap: np.ndarray, alpha: float = 0.55
) -> np.ndarray:
    """Blend the severity surface over the post-disaster image (paper Fig. 8)."""
    coloured = cv2.applyColorMap((heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET)
    return cv2.addWeighted(coloured, alpha, post_image_bgr, 1.0 - alpha, 0.0)


def render_damage_overlay(
    post_image_bgr: np.ndarray, buildings: list[BuildingPrediction]
) -> np.ndarray:
    """Draw predicted footprints on the post image, coloured by damage class."""
    bgr = {1: (129, 185, 16), 2: (8, 179, 234), 3: (22, 119, 249), 4: (68, 68, 239)}
    canvas = post_image_bgr.copy()
    for building in buildings:
        cv2.drawContours(canvas, [building.contour], -1, bgr[building.damage], 2)
    return canvas


def priority_zones(
    buildings: list[BuildingPrediction],
    heatmap: np.ndarray,
    max_zones: int = 8,
) -> list[PriorityZone]:
    """Extract hot regions and rank them by major + destroyed concentration."""
    if not buildings:
        return []

    hot = (heatmap >= HOT_THRESHOLD).astype(np.uint8)
    # Close the mask so adjacent hot cells form one operational zone rather
    # than a scatter of single-building regions.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (CLOSE_KERNEL, CLOSE_KERNEL))
    hot = cv2.morphologyEx(hot, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(hot, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    points = [Point(*b.centroid) for b in buildings]

    candidates: list[PriorityZone] = []
    for contour in contours:
        if cv2.contourArea(contour) < MIN_ZONE_AREA_PX or len(contour) < 4:
            continue

        simplified = cv2.approxPolyDP(contour, epsilon=4.0, closed=True)
        if len(simplified) < 4:
            simplified = contour

        polygon = Polygon(simplified.reshape(-1, 2))
        if not polygon.is_valid:
            polygon = polygon.buffer(0)
        if polygon.is_empty or polygon.geom_type != "Polygon":
            continue

        contained = [b for b, pt in zip(buildings, points) if polygon.covers(pt)]
        if len(contained) < MIN_ZONE_BUILDINGS:
            continue

        counts = {level: 0 for level in (1, 2, 3, 4)}
        for building in contained:
            counts[building.damage] += 1

        candidates.append(
            PriorityZone(
                rank=0,
                priority_rank="",
                polygon=polygon,
                severity_score=round(
                    sum(b.damage for b in contained) / len(contained), 3
                ),
                building_count=len(contained),
                destroyed_count=counts[4],
                major_count=counts[3],
                minor_count=counts[2],
                no_damage_count=counts[1],
            )
        )

    # Rank by concentration of the two worst classes, then by overall severity.
    candidates.sort(
        key=lambda z: (z.destroyed_count + z.major_count, z.severity_score, z.building_count),
        reverse=True,
    )

    ranked = candidates[:max_zones]
    for position, zone in enumerate(ranked):
        zone.rank = position + 1
        zone.priority_rank = RANK_LABELS[min(position, len(RANK_LABELS) - 1)]
    return ranked
