from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status

from app.schemas.frontend import AnalysisResult, AnalyticsResponse, RiskZone
from app.services.frontend_contract import (
    build_analysis_result,
    get_analytics,
    get_risk_zones,
    store_upload,
)


api_router = APIRouter()


@api_router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    request: Request,
    image: UploadFile | None = File(default=None),
    image_url: str | None = Form(default=None),
    selected_model: str = Form(default="resnet-50", alias="model_type"),
    analysis_type: str = Form(default="building-damage"),
) -> dict[str, object]:
    if image is None and image_url is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide an image file or image_url.",
        )

    if image is not None:
        asset_path = await store_upload(image)
        image_url = f"{str(request.base_url).rstrip('/')}{asset_path}"
        file_name = image.filename or "uploaded_image"
    else:
        file_name = image_url.rsplit("/", maxsplit=1)[-1]

    return build_analysis_result(file_name, image_url, selected_model, analysis_type)


@api_router.get("/analytics", response_model=AnalyticsResponse)
def analytics() -> dict[str, object]:
    return get_analytics()


@api_router.get("/map/zones", response_model=list[RiskZone])
def risk_zones() -> list[dict[str, object]]:
    return get_risk_zones()
