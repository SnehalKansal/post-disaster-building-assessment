"""Response models for the frontend API."""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class JobStatus(BaseModel):
    model_config = ConfigDict(extra="allow")

    jobId: str
    disasterId: int
    name: str
    status: str
    stage: str
    progress: float
    error: str | None = None
    buildingCount: int = 0
    device: str | None = None
    durationSeconds: float | None = None
    imageWidth: int | None = None
    imageHeight: int | None = None
    preImage: str | None = None
    postImage: str | None = None
    overlayImage: str | None = None
    heatmapImage: str | None = None
    geojsonUrl: str | None = None
    createdAt: str | None = None
    completedAt: str | None = None


class DamageBucket(BaseModel):
    code: int
    label: str
    count: int
    percentage: float
    color: str


class AssessmentSummary(BaseModel):
    totalBuildings: int
    damagedBuildings: int
    criticalBuildings: int
    averageConfidence: float
    damageDistribution: list[DamageBucket]


class RiskZone(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    disasterId: int
    name: str
    riskTier: str
    rank: int
    severityScore: float
    affectedBuildings: int
    destroyedCount: int
    majorDamageCount: int
    minorDamageCount: int
    noDamageCount: int
    centroidPixel: list[float]
    polygonPixel: list[list[float]]


class AssessmentDetail(BaseModel):
    job: JobStatus | None
    summary: AssessmentSummary
    zones: list[RiskZone]


class AnalyticsResponse(BaseModel):
    kpis: dict[str, str]
    damageDistribution: list[DamageBucket]
    recentAnalyses: list[dict[str, str]]


class ModelStatus(BaseModel):
    weightsPresent: bool
    loaded: bool
    device: str | None = None
    error: str | None = None
