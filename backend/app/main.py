from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router


app = FastAPI(title="Post-Disaster Building Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_root = Path(__file__).resolve().parents[1] / "static"
app.mount("/static", StaticFiles(directory=static_root), name="static")
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health_check() -> dict[str, str]:
    """Report that the application is running."""
    return {"status": "ok"}
