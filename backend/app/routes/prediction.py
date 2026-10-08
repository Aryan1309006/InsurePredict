from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.prediction import (
    PredictionInput,
    PredictionResponse,
    WhatIfResponse,
    PredictionRecordResponse,
    PredictionHistoryListResponse,
    DashboardStatsResponse,
)
from app.services.model_service import ModelService
from app.dependencies.auth import get_current_user
from app.database.mongodb import get_predictions_col

router = APIRouter(tags=["Predictions"])


@router.post("/predict", response_model=PredictionResponse)
def predict_insurance_cost(
    payload: PredictionInput, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generate an insurance cost prediction and store the result
    under the authenticated user's account in MongoDB.
    """
    try:
        service = ModelService.get_instance()
        result = service.predict(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    # Store prediction in MongoDB associated with current user
    try:
        preds_col = get_predictions_col()
        now = datetime.now(timezone.utc)
        factors_dict = {}
        for k, v in result.factors.items():
            factors_dict[k] = v.model_dump() if hasattr(v, "model_dump") else dict(v)

        doc = {
            "user_id": current_user["_id"],
            "inputs": {
                "age": payload.age,
                "sex": payload.sex,
                "bmi": payload.bmi,
                "children": payload.children,
                "smoker": payload.smoker,
                "region": payload.region,
            },
            "predicted_cost": result.predicted_cost,
            "monthly_cost": result.monthly_cost,
            "confidence_label": result.confidence_label,
            "factors": factors_dict,
            "created_at": now,
        }
        preds_col.insert_one(doc)
    except Exception as e:
        # If DB write fails, log it but don't fail the prediction return
        pass

    return result


@router.get("/predictions", response_model=PredictionHistoryListResponse)
def get_user_prediction_history(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieve all predictions belonging to the currently authenticated user.
    Never returns another user's records.
    """
    try:
        preds_col = get_predictions_col()
        cursor = preds_col.find({"user_id": current_user["_id"]}).sort("created_at", -1)
        
        predictions_list: List[PredictionRecordResponse] = []
        for doc in cursor:
            inputs = doc.get("inputs", {})
            created_at = doc.get("created_at")
            timestamp = int(created_at.timestamp() * 1000) if isinstance(created_at, datetime) else None

            record = PredictionRecordResponse(
                id=str(doc["_id"]),
                age=inputs.get("age", 0),
                sex=inputs.get("sex", "").capitalize(),
                bmi=inputs.get("bmi", 0.0),
                children=inputs.get("children", 0),
                smoker=inputs.get("smoker", "").capitalize(),
                region=inputs.get("region", "").capitalize(),
                predicted_cost=doc.get("predicted_cost", 0.0),
                monthly_cost=doc.get("monthly_cost", 0.0),
                confidence_label=doc.get("confidence_label", "Model Estimate"),
                created_at=created_at or datetime.now(timezone.utc),
                timestamp=timestamp,
                factors=doc.get("factors"),
            )
            predictions_list.append(record)

        return PredictionHistoryListResponse(
            predictions=predictions_list,
            total=len(predictions_list)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail="Failed to retrieve prediction history."
        )


@router.get("/predictions/stats", response_model=DashboardStatsResponse)
def get_user_dashboard_stats(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Compute user-specific dashboard statistics directly from MongoDB.
    """
    try:
        preds_col = get_predictions_col()
        cursor = preds_col.find({"user_id": current_user["_id"]}).sort("created_at", -1)
        docs = list(cursor)

        total = len(docs)
        if total == 0:
            return DashboardStatsResponse(
                total_predictions=0,
                average_cost=0.0,
                latest_cost=0.0,
                latest_prediction=None
            )

        costs = [d.get("predicted_cost", 0.0) for d in docs]
        avg_cost = round(sum(costs) / total, 2)
        latest_doc = docs[0]
        latest_cost = round(latest_doc.get("predicted_cost", 0.0), 2)
        
        latest_inputs = latest_doc.get("inputs", {})
        created_at = latest_doc.get("created_at")
        timestamp = int(created_at.timestamp() * 1000) if isinstance(created_at, datetime) else None

        latest_record = PredictionRecordResponse(
            id=str(latest_doc["_id"]),
            age=latest_inputs.get("age", 0),
            sex=latest_inputs.get("sex", "").capitalize(),
            bmi=latest_inputs.get("bmi", 0.0),
            children=latest_inputs.get("children", 0),
            smoker=latest_inputs.get("smoker", "").capitalize(),
            region=latest_inputs.get("region", "").capitalize(),
            predicted_cost=latest_doc.get("predicted_cost", 0.0),
            monthly_cost=latest_doc.get("monthly_cost", 0.0),
            confidence_label=latest_doc.get("confidence_label", "Model Estimate"),
            created_at=created_at or datetime.now(timezone.utc),
            timestamp=timestamp,
            factors=latest_doc.get("factors"),
        )

        return DashboardStatsResponse(
            total_predictions=total,
            average_cost=avg_cost,
            latest_cost=latest_cost,
            latest_prediction=latest_record
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail="Failed to compute dashboard metrics."
        )


@router.delete("/predictions/{prediction_id}")
def delete_prediction_record(
    prediction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete a specific prediction belonging to the authenticated user.
    Prevents unauthorized deletion of another user's prediction records.
    """
    try:
        obj_id = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prediction ID format."
        )

    preds_col = get_predictions_col()
    result = preds_col.delete_one({"_id": obj_id, "user_id": current_user["_id"]})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found or unauthorized to delete."
        )

    return {"message": "Prediction deleted successfully."}


@router.delete("/predictions")
def clear_user_predictions(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Delete all prediction history belonging strictly to the authenticated user.
    """
    preds_col = get_predictions_col()
    result = preds_col.delete_many({"user_id": current_user["_id"]})
    return {
        "message": "All predictions cleared successfully.",
        "deleted_count": result.deleted_count
    }
