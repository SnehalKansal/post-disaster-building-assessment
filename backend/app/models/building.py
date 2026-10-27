from __future__ import annotations

from geoalchemy2 import Geometry
from sqlalchemy import Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Building(Base):
    """A predicted building footprint and its damage class.

    The pipeline emits polygons in image pixel space, so those are stored with
    SRID 0 (undefined CRS). The lon/lat columns stay NULL until GeoTIFF
    geo-referencing is applied, rather than being filled with pixel values that
    would read as valid WGS 84 coordinates.
    """

    __tablename__ = "buildings"

    building_id: Mapped[str] = mapped_column(String, primary_key=True)
    disaster_id: Mapped[int] = mapped_column(
        ForeignKey("disasters.disaster_id", ondelete="CASCADE"), index=True
    )
    building_index: Mapped[int] = mapped_column(Integer)

    geometry_pixel: Mapped[object] = mapped_column(Geometry("POLYGON", srid=0))
    centroid_x: Mapped[float] = mapped_column(Float)
    centroid_y: Mapped[float] = mapped_column(Float)

    geometry: Mapped[object | None] = mapped_column(
        Geometry("POLYGON", srid=4326), nullable=True
    )
    centroid: Mapped[object | None] = mapped_column(
        Geometry("POINT", srid=4326), nullable=True
    )

    damage_code: Mapped[int] = mapped_column(Integer)
    damage_class: Mapped[str] = mapped_column(String)
    confidence: Mapped[float] = mapped_column(Float)
    area_px: Mapped[float] = mapped_column(Float)

    disaster: Mapped[Disaster] = relationship(back_populates="buildings")


Index("ix_buildings_disaster_damage", Building.disaster_id, Building.damage_code)
