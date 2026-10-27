"""Read-side queries that turn persisted results into API payloads."""
from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ml.pipeline import DAMAGE_COLORS, DAMAGE_LABELS
from app.models.analysis_job import COMPLETED, AnalysisJob
from app.models.building import Building
from app.models.disaster import Disaster
from app.models.priority_zone import PriorityZone
from app.services.storage import static_url

DAMAGE_LEVELS = (1, 2, 3, 4)
DAMAGED_LEVELS = (2, 3, 4)
CRITICAL_LEVELS = (3, 4)


def _distribution(counts: dict[int, int]) -> list[dict[str, object]]:
    total = sum(counts.values())
    return [
        {
            "code": level,
            "label": DAMAGE_LABELS[level],
            "count": counts.get(level, 0),
            "percentage": round(100.0 * counts.get(level, 0) / total, 1) if total else 0.0,
            "color": DAMAGE_COLORS[level],
        }
        for level in DAMAGE_LEVELS
    ]


def _counts_for(db: Session, disaster_id: int) -> dict[int, int]:
    rows = db.execute(
        select(Building.damage_code, func.count())
        .where(Building.disaster_id == disaster_id)
        .group_by(Building.damage_code)
    ).all()
    return {int(code): int(count) for code, count in rows}


def job_payload(job: AnalysisJob) -> dict[str, object]:
    """Status envelope polled by the frontend while a job runs."""
    return {
        "jobId": job.job_id,
        "disasterId": job.disaster_id,
        "name": job.disaster.name if job.disaster else "",
        "status": job.status,
        "stage": job.stage,
        "progress": round(job.progress, 3),
        "error": job.error,
        "buildingCount": job.building_count,
        "device": job.device,
        "durationSeconds": job.duration_seconds,
        "imageWidth": job.image_width,
        "imageHeight": job.image_height,
        "preImage": static_url(Path(job.pre_image_path)) if job.pre_image_path else None,
        "postImage": static_url(Path(job.post_image_path)) if job.post_image_path else None,
        "overlayImage": static_url(Path(job.overlay_path)) if job.overlay_path else None,
        "heatmapImage": static_url(Path(job.heatmap_path)) if job.heatmap_path else None,
        "geojsonUrl": f"/api/v1/assessments/{job.disaster_id}/geojson"
        if job.geojson_path
        else None,
        "createdAt": job.created_at.isoformat() if job.created_at else None,
        "completedAt": job.completed_at.isoformat() if job.completed_at else None,
    }


def zone_payload(zone: PriorityZone, db: Session) -> dict[str, object]:
    from geoalchemy2.shape import to_shape

    polygon = to_shape(zone.geometry_pixel)
    coords = [[float(x), float(y)] for x, y in polygon.exterior.coords]
    centroid = polygon.centroid
    return {
        "id": str(zone.zone_id),
        "disasterId": zone.disaster_id,
        "name": f"Zone {zone.rank_order}",
        "riskTier": zone.priority_rank,
        "rank": zone.rank_order,
        "severityScore": round(zone.severity_score, 2),
        "affectedBuildings": zone.building_count,
        "destroyedCount": zone.destroyed_count,
        "majorDamageCount": zone.major_damage_count,
        "minorDamageCount": zone.minor_damage_count,
        "noDamageCount": zone.no_damage_count,
        "centroidPixel": [round(centroid.x, 1), round(centroid.y, 1)],
        "polygonPixel": coords,
    }


def assessment_detail(db: Session, disaster_id: int) -> dict[str, object] | None:
    disaster = db.get(Disaster, disaster_id)
    if disaster is None:
        return None

    job = db.execute(
        select(AnalysisJob)
        .where(AnalysisJob.disaster_id == disaster_id)
        .order_by(AnalysisJob.created_at.desc())
    ).scalars().first()

    counts = _counts_for(db, disaster_id)
    total = sum(counts.values())
    avg_confidence = db.execute(
        select(func.avg(Building.confidence)).where(Building.disaster_id == disaster_id)
    ).scalar()

    zones = db.execute(
        select(PriorityZone)
        .where(PriorityZone.disaster_id == disaster_id)
        .order_by(PriorityZone.rank_order)
    ).scalars().all()

    return {
        "job": job_payload(job) if job else None,
        "summary": {
            "totalBuildings": total,
            "damagedBuildings": sum(counts.get(c, 0) for c in DAMAGED_LEVELS),
            "criticalBuildings": sum(counts.get(c, 0) for c in CRITICAL_LEVELS),
            "averageConfidence": round(float(avg_confidence), 4) if avg_confidence else 0.0,
            "damageDistribution": _distribution(counts),
        },
        "zones": [zone_payload(z, db) for z in zones],
    }


def geojson_for(db: Session, disaster_id: int) -> dict[str, object] | None:
    job = db.execute(
        select(AnalysisJob)
        .where(AnalysisJob.disaster_id == disaster_id, AnalysisJob.status == COMPLETED)
        .order_by(AnalysisJob.completed_at.desc())
    ).scalars().first()
    if job is None or not job.geojson_path:
        return None
    path = Path(job.geojson_path)
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def analytics(db: Session) -> dict[str, object]:
    """Aggregate KPIs across every completed assessment."""
    completed = db.execute(
        select(func.count()).select_from(AnalysisJob).where(AnalysisJob.status == COMPLETED)
    ).scalar() or 0

    rows = db.execute(
        select(Building.damage_code, func.count()).group_by(Building.damage_code)
    ).all()
    counts = {int(code): int(count) for code, count in rows}
    total = sum(counts.values())

    avg_confidence = db.execute(select(func.avg(Building.confidence))).scalar()

    recent = db.execute(
        select(AnalysisJob).order_by(AnalysisJob.created_at.desc()).limit(8)
    ).scalars().all()

    return {
        "kpis": {
            "totalAnalyses": str(completed),
            "totalBuildings": str(total),
            "damageCasesDetected": str(sum(counts.get(c, 0) for c in DAMAGED_LEVELS)),
            "criticalCases": str(sum(counts.get(c, 0) for c in CRITICAL_LEVELS)),
            "averageConfidence": f"{float(avg_confidence) * 100:.1f}%" if avg_confidence else "—",
        },
        "damageDistribution": _distribution(counts),
        "recentAnalyses": [
            {
                "id": job.job_id,
                "disasterId": str(job.disaster_id),
                "name": job.disaster.name if job.disaster else "",
                "status": job.status,
                "buildings": str(job.building_count),
                "createdAt": job.created_at.isoformat() if job.created_at else "",
            }
            for job in recent
        ],
    }


def all_zones(db: Session) -> list[dict[str, object]]:
    zones = db.execute(
        select(PriorityZone).order_by(
            PriorityZone.disaster_id.desc(), PriorityZone.rank_order
        )
    ).scalars().all()
    return [zone_payload(z, db) for z in zones]


def list_assessments(db: Session) -> list[dict[str, object]]:
    jobs = db.execute(
        select(AnalysisJob).order_by(AnalysisJob.created_at.desc())
    ).scalars().all()
    return [job_payload(job) for job in jobs]
