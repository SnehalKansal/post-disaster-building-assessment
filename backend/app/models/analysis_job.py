from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

QUEUED = "Queued"
PROCESSING = "Processing"
COMPLETED = "Completed"
FAILED = "Failed"


class AnalysisJob(Base):
    """Tracks one inference run through Queued/Processing/Completed/Failed."""

    __tablename__ = "analysis_jobs"

    job_id: Mapped[str] = mapped_column(String, primary_key=True)
    disaster_id: Mapped[int] = mapped_column(
        ForeignKey("disasters.disaster_id", ondelete="CASCADE")
    )
    status: Mapped[str] = mapped_column(String, default=QUEUED)
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    stage: Mapped[str] = mapped_column(String, default="Queued")
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    pre_image_path: Mapped[str] = mapped_column(String)
    post_image_path: Mapped[str] = mapped_column(String)
    overlay_path: Mapped[str | None] = mapped_column(String, nullable=True)
    heatmap_path: Mapped[str | None] = mapped_column(String, nullable=True)
    geojson_path: Mapped[str | None] = mapped_column(String, nullable=True)

    image_width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    building_count: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    device: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    disaster: Mapped[Disaster] = relationship(back_populates="analysis_jobs")
