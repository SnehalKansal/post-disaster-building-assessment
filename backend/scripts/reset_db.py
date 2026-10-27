"""Drop and recreate all application tables, and clear generated artifacts.

Useful after a schema change or to clear test runs:
    python scripts/reset_db.py --with-artifacts
"""
import argparse
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import models  # noqa: F401  - registers the tables on Base
from app.core.config import settings
from app.db.session import Base, engine


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--with-artifacts",
        action="store_true",
        help="also delete uploaded imagery and generated overlays/heatmaps/GeoJSON",
    )
    args = parser.parse_args()

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database tables dropped and recreated.")

    if args.with_artifacts:
        for name in ("uploads", "heatmaps", "overlays", "geojson"):
            directory = settings.static_root / name
            if not directory.is_dir():
                continue
            for entry in directory.iterdir():
                if entry.name == ".gitkeep":
                    continue
                shutil.rmtree(entry) if entry.is_dir() else entry.unlink()
            print(f"Cleared {directory}")


if __name__ == "__main__":
    main()
