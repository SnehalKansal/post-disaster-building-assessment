from pydantic import BaseModel


class Indicator(BaseModel):
    text: str
    positive: bool
    severity: str


class Recommendation(BaseModel):
    priority: str
    text: str
    category: str


class HeatmapRegion(BaseModel):
    x: int
    y: int
    width: int
    height: int
    intensity: str
    label: str


class AnalysisResult(BaseModel):
    id: str
    name: str
    fileName: str
    disasterType: str
    location: str
    date: str
    fileSize: str
    dimensions: str
    sensorType: str
    originalImage: str
    overlayImage: str
    damageLevel: str
    confidenceScore: float
    analysisTime: str
    probabilities: dict[str, float]
    aiExplanation: str
    detectedIndicators: list[Indicator]
    recommendations: list[Recommendation]
    heatmapData: list[HeatmapRegion]


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
