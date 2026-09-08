from pydantic import BaseModel


class AnalysisResult(BaseModel):
    id: str
    fileName: str
    originalImage: str
    status: str
    message: str
    modelType: str
    analysisType: str


class AnalyticsResponse(BaseModel):
    kpis: dict[str, str | float | int]
    damageDistribution: list[dict[str, str | float | int]]
    recentAnalyses: list[dict[str, str]]


class RiskZone(BaseModel):
    id: str
    name: str
    riskTier: str
    color: str
    badge: str
    affectedBuildings: int
    coordinates: str
    severity: str
    avgConfidence: str
    recommendedDispatch: str
