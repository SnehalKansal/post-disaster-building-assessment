from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Disaster(Base):
    """One assessment run over a single pre/post image pair."""

    __tablename__ = "disasters"

    disaster_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)
    location: Mapped[str] = mapped_column(String, default="Unknown")
    date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    buildings: Mapped[list[Building]] = relationship(
        back_populates="disaster", cascade="all, delete-orphan"
    )
    priority_zones: Mapped[list[PriorityZone]] = relationship(
        back_populates="disaster", cascade="all, delete-orphan"
    )
    analysis_jobs: Mapped[list[AnalysisJob]] = relationship(
        back_populates="disaster", cascade="all, delete-orphan"
    )
