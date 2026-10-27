"""Loads the trained models once per process and hands them to workers.

The model objects are created lazily on first use and then reused, as the ML
handoff requires. A lock serialises inference because the two networks are
shared mutable state and jobs may overlap in the background executor.
"""
from __future__ import annotations

import logging
import sys
import threading
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

# The vendored ML deliverable lives outside the backend package.
_ML_DIR = Path(__file__).resolve().parents[3] / "ml"
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

_lock = threading.Lock()
_models: tuple[object, object] | None = None
_load_error: str | None = None


class ModelsUnavailable(RuntimeError):
    """Raised when the trained weights cannot be loaded."""


def weights_present() -> bool:
    """Report whether both checkpoints exist on disk."""
    return settings.segformer_path.is_dir() and settings.siamese_path.is_file()


def resolve_device() -> str:
    if settings.inference_device:
        return settings.inference_device
    import torch

    return "cuda" if torch.cuda.is_available() else "cpu"


def get_models() -> tuple[object, object]:
    """Return the (segformer, siamese) pair, loading them on first call."""
    global _models, _load_error

    if _models is not None:
        return _models

    with _lock:
        if _models is not None:
            return _models
        if _load_error is not None:
            raise ModelsUnavailable(_load_error)

        if not weights_present():
            _load_error = (
                f"Model weights not found. Expected {settings.segformer_path} "
                f"and {settings.siamese_path}."
            )
            raise ModelsUnavailable(_load_error)

        try:
            from inference import load_models

            device = resolve_device()
            logger.info("Loading damage-assessment models on %s", device)
            _models = load_models(
                str(settings.segformer_path),
                str(settings.siamese_path),
                device=device,
            )
            logger.info("Models ready")
        except ModelsUnavailable:
            raise
        except Exception as exc:  # noqa: BLE001 - surfaced to the caller as status
            _load_error = f"{type(exc).__name__}: {exc}"
            logger.exception("Model loading failed")
            raise ModelsUnavailable(_load_error) from exc

    return _models


def inference_lock() -> threading.Lock:
    """Serialise access to the shared model objects."""
    return _lock


def status() -> dict[str, object]:
    """Describe model availability for the health endpoint."""
    return {
        "weightsPresent": weights_present(),
        "loaded": _models is not None,
        "device": resolve_device() if weights_present() else None,
        "error": _load_error,
    }
