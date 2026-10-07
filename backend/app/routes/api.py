from fastapi import APIRouter, HTTPException
from app.schemas.prediction import (
    PredictionInput,
    PredictionResponse,
    WhatIfResponse,
)
from app.services.model_service import ModelService

router = APIRouter(prefix="/api", tags=["Insurance Prediction"])


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/model-info")
def get_model_info():
    try:
        service = ModelService.get_instance()
        return service.get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model info: {str(e)}")


@router.post("/predict", response_model=PredictionResponse)
def predict_insurance_cost(payload: PredictionInput):
    try:
        service = ModelService.get_instance()
        return service.predict(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/what-if", response_model=WhatIfResponse)
def calculate_what_if(payload: PredictionInput):
    try:
        service = ModelService.get_instance()
        return service.what_if_simulations(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
