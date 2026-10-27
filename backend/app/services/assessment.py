"""Runs an assessment job end to end and persists the results.

Executed off the request thread so long inference never blocks the API, with
state transitions recorded on the analysis_jobs row.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from geoalchemy2.shape import from_shape
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.ml import runtime
from app.ml.pipeline import DAMAGE_LABELS, run_pipeline
from app.models.analysis_job import COMPLETED, FAILED, PROCESSING, AnalysisJob
from app.models.building import Building
from app.models.priority_zone import PriorityZone
from app.services import geospatial, storage

logger = logging.getLogger(__name__)


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _set(db: Session, job: AnalysisJob, *, stage: str, progress: float) -> None:
    job.stage = stage
    job.progress = progress
    db.commit()


def run_assessment(job_id: str) -> None:
    """Background entry point. Owns its own DB session."""
    db = SessionLocal()
    try:
        job = db.get(AnalysisJob, job_id)
        if job is None:
            logger.error("Job %s vanished before it could run", job_id)
            return

        job.status = PROCESSING
        job.started_at = _now()
        job.device = runtime.resolve_device()
        job.disaster.status = PROCESSING
        _set(db, job, stage="Loading models", progress=0.05)

        started = _now()
        _set(db, job, stage="Localizing buildings", progress=0.15)

        result = run_pipeline(
            Path(job.pre_image_path),
            Path(job.post_image_path),
            min_area=settings.min_building_area,
        )

        _set(db, job, stage="Classifying damage", progress=0.60)

        heatmap = geospatial.severity_heatmap(
            result.buildings, result.image_width, result.image_height
        )
        zones = geospatial.priority_zones(result.buildings, heatmap)

        _set(db, job, stage="Rendering outputs", progress=0.80)

        overlay_path = storage.write_artifact(
            geospatial.render_damage_overlay(result.post_image, result.buildings),
            storage.OVERLAY_DIR,
            f"{job_id}_damage.png",
        )
        heatmap_path = storage.write_artifact(
            geospatial.render_heatmap_overlay(result.post_image, heatmap),
            storage.HEATMAP_DIR,
            f"{job_id}_heatmap.png",
        )

        geojson = result.geojson()
        geojson_path = storage.GEOJSON_DIR / f"{job_id}.geojson"
        storage.ensure_dirs()
        geojson_path.write_text(json.dumps(geojson), encoding="utf-8")

        _set(db, job, stage="Saving results", progress=0.90)

        disaster_id = job.disaster_id
        db.query(Building).filter(Building.disaster_id == disaster_id).delete()
        db.query(PriorityZone).filter(PriorityZone.disaster_id == disaster_id).delete()

        db.add_all(
            Building(
                building_id=f"{disaster_id}-{b.index}",
                disaster_id=disaster_id,
                building_index=b.index,
                geometry_pixel=from_shape(b.polygon, srid=0),
                centroid_x=b.centroid[0],
                centroid_y=b.centroid[1],
                damage_code=b.damage,
                damage_class=DAMAGE_LABELS[b.damage],
                confidence=b.confidence,
                area_px=b.area_px,
            )
            for b in result.buildings
        )
        db.add_all(
            PriorityZone(
                disaster_id=disaster_id,
                geometry_pixel=from_shape(zone.polygon, srid=0),
                rank_order=zone.rank,
                priority_rank=zone.priority_rank,
                severity_score=zone.severity_score,
                building_count=zone.building_count,
                destroyed_count=zone.destroyed_count,
                major_damage_count=zone.major_count,
                minor_damage_count=zone.minor_count,
                no_damage_count=zone.no_damage_count,
            )
            for zone in zones
        )

        job.overlay_path = str(overlay_path)
        job.heatmap_path = str(heatmap_path)
        job.geojson_path = str(geojson_path)
        job.image_width = result.image_width
        job.image_height = result.image_height
        job.building_count = len(result.buildings)
        job.duration_seconds = (_now() - started).total_seconds()
        job.status = COMPLETED
        job.stage = "Completed"
        job.progress = 1.0
        job.completed_at = _now()
        job.disaster.status = COMPLETED
        db.commit()

        logger.info(
            "Job %s completed: %d buildings, %d zones, %.1fs",
            job_id,
            job.building_count,
            len(zones),
            job.duration_seconds,
        )

    except Exception as exc:  # noqa: BLE001 - recorded on the job for the client
        logger.exception("Job %s failed", job_id)
        db.rollback()
        job = db.get(AnalysisJob, job_id)
        if job is not None:
            job.status = FAILED
            job.stage = "Failed"
            job.error = f"{type(exc).__name__}: {exc}"
            job.completed_at = _now()
            if job.disaster is not None:
                job.disaster.status = FAILED
            db.commit()
    finally:
        db.close()
