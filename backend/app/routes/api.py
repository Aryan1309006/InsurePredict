from fastapi import APIRouter, HTTPException
from app.schemas.prediction import (
    PredictionInput,
    WhatIfResponse,
)
from app.services.model_service import ModelService
from app.routes.auth import router as auth_router
from app.routes.prediction import router as prediction_router

router = APIRouter(prefix="/api")

# Mount authentication routes (/api/auth/...)
router.include_router(auth_router)

# Mount prediction and history routes (/api/predict, /api/predictions, /api/predictions/stats, etc.)
router.include_router(prediction_router)


@router.get("/health", tags=["System"])
def health_check():
    return {"status": "ok"}


@router.get("/model-info", tags=["Insurance Prediction"])
def get_model_info():
    try:
        service = ModelService.get_instance()
        return service.get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model info: {str(e)}")


@router.post("/what-if", response_model=WhatIfResponse, tags=["Insurance Prediction"])
def calculate_what_if(payload: PredictionInput):
    try:
        service = ModelService.get_instance()
        return service.what_if_simulations(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
