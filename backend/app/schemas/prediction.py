from typing import Literal, Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator



class PredictionInput(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age of the primary beneficiary (18-100)")
    sex: Literal["male", "female"] = Field(..., description="Gender (male or female)")
    bmi: float = Field(..., ge=10.0, le=60.0, description="Body Mass Index (10.0 - 60.0)")
    children: int = Field(..., ge=0, le=10, description="Number of children/dependents covered (0-10)")
    smoker: Literal["yes", "no"] = Field(..., description="Smoking status (yes or no)")
    region: Literal["northeast", "northwest", "southeast", "southwest"] = Field(
        ..., description="Residential region in the US"
    )

    @field_validator("sex", mode="before")
    @classmethod
    def normalize_sex(cls, v: str) -> str:
        if isinstance(v, str):
            v_clean = v.strip().lower()
            if v_clean in ["male", "female"]:
                return v_clean
        return v

    @field_validator("smoker", mode="before")
    @classmethod
    def normalize_smoker(cls, v: str) -> str:
        if isinstance(v, str):
            v_clean = v.strip().lower()
            if v_clean in ["yes", "no"]:
                return v_clean
        return v

    @field_validator("region", mode="before")
    @classmethod
    def normalize_region(cls, v: str) -> str:
        if isinstance(v, str):
            v_clean = v.strip().lower()
            if v_clean in ["northeast", "northwest", "southeast", "southwest"]:
                return v_clean
        return v


class FactorDetail(BaseModel):
    value: Any
    display: str
    impact_level: str
    feature_importance_pct: float


class PredictionResponse(BaseModel):
    predicted_cost: float
    monthly_cost: float
    confidence_label: str = "Model Estimate"
    model_algorithm: str
    factors: Dict[str, FactorDetail]
    disclaimer: str = (
        "This tool provides an estimated insurance cost for educational/demo purposes. "
        "Actual insurance premiums may vary based on additional factors and insurer-specific underwriting."
    )


class WhatIfScenario(BaseModel):
    id: str
    title: str
    description: str
    modified_field: str
    original_value: Any
    simulated_value: Any
    simulated_cost: float
    difference: float
    percent_change: float


class WhatIfResponse(BaseModel):
    base_cost: float
    scenarios: List[WhatIfScenario]


class PredictionRecordResponse(BaseModel):
    id: str
    age: int
    sex: str
    bmi: float
    children: int
    smoker: str
    region: str
    predicted_cost: float
    monthly_cost: float
    confidence_label: str = "Model Estimate"
    model_algorithm: Optional[str] = "Random Forest Regressor"
    created_at: datetime
    timestamp: Optional[int] = None
    factors: Optional[Dict[str, FactorDetail]] = None


class PredictionHistoryListResponse(BaseModel):
    predictions: List[PredictionRecordResponse]
    total: int


class DashboardStatsResponse(BaseModel):
    total_predictions: int
    average_cost: float
    latest_cost: float
    latest_prediction: Optional[PredictionRecordResponse] = None

