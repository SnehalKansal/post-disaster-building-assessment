"""Filesystem handling for uploaded imagery and generated artifacts."""
from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import cv2
import numpy as np
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/tiff",
    "image/x-tiff",
}
ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
MAX_UPLOAD_BYTES = 64 * 1024 * 1024

UPLOAD_DIR = settings.static_root / "uploads"
HEATMAP_DIR = settings.static_root / "heatmaps"
OVERLAY_DIR = settings.static_root / "overlays"
GEOJSON_DIR = settings.static_root / "geojson"


def ensure_dirs() -> None:
    for directory in (UPLOAD_DIR, HEATMAP_DIR, OVERLAY_DIR, GEOJSON_DIR):
        directory.mkdir(parents=True, exist_ok=True)


async def save_upload(image: UploadFile, role: str, run_id: str) -> Path:
    """Validate and persist one uploaded image; returns the stored path."""
    suffix = Path(image.filename or "").suffix.lower()
    if image.content_type not in ALLOWED_CONTENT_TYPES and suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"{role} image must be JPEG, PNG, or TIFF.",
        )

    payload = await image.read()
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{role} image is empty.",
        )
    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{role} image exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
        )

    ensure_dirs()
    target = UPLOAD_DIR / f"{run_id}_{role}{suffix or '.png'}"
    target.write_bytes(payload)

    # Reject anything OpenCV cannot decode now, rather than failing inside the job.
    if cv2.imread(str(target), cv2.IMREAD_COLOR) is None:
        target.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{role} image could not be decoded as an image.",
        )
    return target


def write_artifact(image_bgr: np.ndarray, directory: Path, name: str) -> Path:
    ensure_dirs()
    target = directory / name
    if not cv2.imwrite(str(target), image_bgr):
        raise RuntimeError(f"Failed to write artifact {target}")
    return target


def static_url(path: Path | None) -> str | None:
    """Map an on-disk artifact to its /static URL."""
    if path is None:
        return None
    try:
        relative = Path(path).resolve().relative_to(settings.static_root.resolve())
    except ValueError:
        return None
    return "/static/" + relative.as_posix()
