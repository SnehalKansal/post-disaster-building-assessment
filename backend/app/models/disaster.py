from __future__ import annotations

from datetime import date

from sqlalchemy import Date, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Disaster(Base):
    __tablename__ = "disasters"

    disaster_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)
    location: Mapped[str] = mapped_column(String)
    date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String, default="pending")

    buildings: Mapped[list[Building]] = relationship(back_populates="disaster")
    priority_zones: Mapped[list[PriorityZone]] = relationship(back_populates="disaster")
    analysis_jobs: Mapped[list[AnalysisJob]] = relationship(back_populates="disaster")
