from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/tiff"}
STATIC_ROOT = Path(__file__).resolve().parents[2] / "static"


async def store_upload(image: UploadFile) -> str:
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, and TIFF images are supported.",
        )

    suffix = Path(image.filename or "upload.jpg").suffix.lower() or ".jpg"
    upload_name = f"{uuid4().hex}{suffix}"
    upload_path = STATIC_ROOT / "uploads" / upload_name
    upload_path.parent.mkdir(parents=True, exist_ok=True)
    upload_path.write_bytes(await image.read())
    return f"/static/uploads/{upload_name}"


def build_analysis_result(
    file_name: str,
    image_url: str,
    model_type: str,
    analysis_type: str,
) -> dict[str, object]:
    analysis_id = f"DV-{uuid4().hex[:8].upper()}"
    return {
        "id": analysis_id,
        "fileName": file_name,
        "originalImage": image_url,
        "status": "received",
        "message": "Imagery has been stored. Geospatial processing and damage inference are not available yet.",
        "modelType": model_type,
        "analysisType": analysis_type,
    }


def get_analytics() -> dict[str, object]:
    return {
        "kpis": {
            "totalAnalyses": "0",
            "damageCasesDetected": "0",
            "criticalCases": "0",
            "averageConfidence": "0.0%",
        },
        "damageDistribution": [
            {"label": "No Damage", "count": 0, "percentage": 0.0, "color": "#10b981"},
            {"label": "Minor Damage", "count": 0, "percentage": 0.0, "color": "#eab308"},
            {"label": "Moderate Damage", "count": 0, "percentage": 0.0, "color": "#f97316"},
            {"label": "Severe Damage", "count": 0, "percentage": 0.0, "color": "#ef4444"},
            {"label": "Destroyed", "count": 0, "percentage": 0.0, "color": "#991b1b"},
        ],
        "recentAnalyses": [],
    }


def get_risk_zones() -> list[dict[str, object]]:
    return []
