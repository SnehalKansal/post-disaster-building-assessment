from datetime import date
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
    analysis_id = f"DV-{date.today():%Y}-{uuid4().hex[:4].upper()}"
    return {
        "id": analysis_id,
        "name": file_name,
        "fileName": file_name,
        "disasterType": "Post-Disaster Structural Reconnaissance",
        "location": "Pending geospatial registration",
        "date": date.today().isoformat(),
        "fileSize": "Pending measurement",
        "dimensions": "Pending image inspection",
        "sensorType": "Uploaded imagery",
        "originalImage": image_url,
        "overlayImage": image_url,
        "damageLevel": "SEVERE_DAMAGE",
        "confidenceScore": 96.8,
        "analysisTime": "Integration response",
        "probabilities": {
            "noDamage": 1.2,
            "minorDamage": 4.5,
            "moderateDamage": 18.4,
            "severeDamage": 71.1,
            "destroyed": 4.8,
        },
        "aiExplanation": (
            f"The {model_type} integration adapter received a {analysis_type} request. "
            "This result will be replaced by the configured ML inference pipeline."
        ),
        "detectedIndicators": [
            {
                "text": "Integration response; ML indicators are not available yet",
                "positive": False,
                "severity": "low",
            }
        ],
        "recommendations": [
            {
                "priority": "MEDIUM",
                "text": "Perform a qualified on-site structural inspection before occupancy.",
                "category": "Inspection",
            }
        ],
        "heatmapData": [],
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
