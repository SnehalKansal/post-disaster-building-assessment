from __future__ import annotations

from geoalchemy2 import Geometry
from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Building(Base):
    __tablename__ = "buildings"

    building_id: Mapped[str] = mapped_column(String, primary_key=True)
    disaster_id: Mapped[int] = mapped_column(ForeignKey("disasters.disaster_id"))
    geometry: Mapped[object] = mapped_column(Geometry("POLYGON", srid=4326))
    centroid: Mapped[object] = mapped_column(Geometry("POINT", srid=4326))
    damage_class: Mapped[str | None] = mapped_column(String, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    disaster: Mapped[Disaster] = relationship(back_populates="buildings")
