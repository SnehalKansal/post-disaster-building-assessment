import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.ml import runtime
from app.services import storage

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    storage.ensure_dirs()
    if runtime.weights_present():
        try:
            runtime.get_models()
        except Exception:  # noqa: BLE001 - surfaced via /api/v1/model/status
            logger.exception("Model preload failed; /analyze will report the error")
    else:
        logger.warning(
            "Model weights missing at %s - inference endpoints will return 503",
            settings.model_dir,
        )
    yield


app = FastAPI(title="Post-Disaster Building Assessment API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.static_root.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.static_root), name="static")
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health_check() -> dict[str, object]:
    """Report that the application is running and whether models are ready."""
    return {"status": "ok", "models": runtime.status()}
