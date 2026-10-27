from __future__ import annotations

from geoalchemy2 import Geometry
from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class PriorityZone(Base):
    """A hot region ranked by its concentration of major/destroyed buildings."""

    __tablename__ = "priority_zones"

    zone_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    disaster_id: Mapped[int] = mapped_column(
        ForeignKey("disasters.disaster_id", ondelete="CASCADE"), index=True
    )

    geometry_pixel: Mapped[object] = mapped_column(Geometry("POLYGON", srid=0))
    geometry: Mapped[object | None] = mapped_column(
        Geometry("POLYGON", srid=4326), nullable=True
    )

    rank_order: Mapped[int] = mapped_column(Integer)
    priority_rank: Mapped[str] = mapped_column(String)
    severity_score: Mapped[float] = mapped_column(Float)
    building_count: Mapped[int] = mapped_column(Integer)
    destroyed_count: Mapped[int] = mapped_column(Integer)
    major_damage_count: Mapped[int] = mapped_column(Integer)
    minor_damage_count: Mapped[int] = mapped_column(Integer, default=0)
    no_damage_count: Mapped[int] = mapped_column(Integer, default=0)

    disaster: Mapped[Disaster] = relationship(back_populates="priority_zones")
