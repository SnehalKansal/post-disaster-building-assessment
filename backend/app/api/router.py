"""REST surface for the assessment workflow."""
from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.ml import runtime
from app.models.analysis_job import QUEUED, AnalysisJob
from app.models.disaster import Disaster
from app.schemas.frontend import (
    AnalyticsResponse,
    AssessmentDetail,
    JobStatus,
    ModelStatus,
    RiskZone,
)
from app.services import reporting, storage
from app.services.assessment import run_assessment

api_router = APIRouter()


@api_router.get("/model/status", response_model=ModelStatus)
def model_status() -> dict[str, object]:
    """Report whether the trained weights are present and loaded."""
    return runtime.status()


@api_router.post("/analyze", response_model=JobStatus, status_code=status.HTTP_202_ACCEPTED)
async def analyze(
    background_tasks: BackgroundTasks,
    pre_image: UploadFile = File(..., description="Pre-disaster image"),
    post_image: UploadFile = File(..., description="Post-disaster image"),
    name: str = Form(default=""),
    location: str = Form(default="Unknown"),
    analysis_type: str = Form(default="building-damage"),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    """Accept a pre/post pair and queue the two-stage assessment."""
    if not runtime.weights_present():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model weights are not installed on the server.",
        )

    run_id = uuid4().hex[:12]
    pre_path = await storage.save_upload(pre_image, "pre", run_id)
    post_path = await storage.save_upload(post_image, "post", run_id)

    disaster = Disaster(
        name=name.strip() or (pre_image.filename or f"Assessment {run_id}"),
        type=analysis_type,
        location=location.strip() or "Unknown",
        status=QUEUED,
    )
    db.add(disaster)
    db.flush()

    job = AnalysisJob(
        job_id=run_id,
        disaster_id=disaster.disaster_id,
        status=QUEUED,
        stage="Queued",
        progress=0.0,
        pre_image_path=str(pre_path),
        post_image_path=str(post_path),
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    payload = reporting.job_payload(job)
    background_tasks.add_task(run_assessment, run_id)
    return payload


@api_router.get("/jobs/{job_id}", response_model=JobStatus)
def job_status(job_id: str, db: Session = Depends(get_db)) -> dict[str, object]:
    job = db.get(AnalysisJob, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown job.")
    return reporting.job_payload(job)


@api_router.get("/assessments", response_model=list[JobStatus])
def list_assessments(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    return reporting.list_assessments(db)


@api_router.get("/assessments/{disaster_id}", response_model=AssessmentDetail)
def assessment_detail(disaster_id: int, db: Session = Depends(get_db)) -> dict[str, object]:
    detail = reporting.assessment_detail(db, disaster_id)
    if detail is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unknown assessment."
        )
    return detail


@api_router.get("/assessments/{disaster_id}/geojson")
def assessment_geojson(disaster_id: int, db: Session = Depends(get_db)) -> JSONResponse:
    """Building-level GeoJSON in pixel coordinates."""
    payload = reporting.geojson_for(db, disaster_id)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No completed GeoJSON for this assessment.",
        )
    return JSONResponse(
        content=payload,
        headers={
            "Content-Disposition": f'attachment; filename="assessment-{disaster_id}.geojson"'
        },
    )


@api_router.get("/analytics", response_model=AnalyticsResponse)
def analytics(db: Session = Depends(get_db)) -> dict[str, object]:
    return reporting.analytics(db)


@api_router.get("/map/zones", response_model=list[RiskZone])
def risk_zones(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    return reporting.all_zones(db)
