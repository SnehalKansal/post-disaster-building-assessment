from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent


class Settings(BaseSettings):
    database_url: str

    # Filesystem locations for model weights and generated artifacts.
    model_dir: Path = PROJECT_ROOT / "ml" / "models"
    static_root: Path = BACKEND_ROOT / "static"

    # "cpu", "cuda", or empty to auto-detect.
    inference_device: str = ""

    # Contours smaller than this many pixels are discarded as segmentation noise.
    min_building_area: int = 40

    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=(),
    )

    @property
    def segformer_path(self) -> Path:
        return self.model_dir / "segformer_localization_best"

    @property
    def siamese_path(self) -> Path:
        return self.model_dir / "siamese_damage_best.pth"


settings = Settings()
