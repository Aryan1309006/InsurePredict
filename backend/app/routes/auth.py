from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Response, Request, Depends
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database.mongodb import get_users_col, get_predictions_col
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    AuthResponse,
)
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_auth_cookie(response: Response, token: str):
    max_age_seconds = settings.JWT_EXPIRE_MINUTES * 60
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        max_age=max_age_seconds,
        expires=max_age_seconds,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )


def _clear_auth_cookie(response: Response):
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    # Also overwrite with max_age=0 for maximum browser compliance
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value="",
        max_age=0,
        expires=0,
        path="/",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, response: Response):
    users_col = get_users_col()

    # Check if email is already taken
    existing = users_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    # Hash password with Argon2
    hashed = hash_password(payload.password)
    now = datetime.now(timezone.utc)

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hashed,
        "created_at": now,
        "updated_at": now,
    }

    try:
        insert_result = users_col.insert_one(user_doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register account at this time. Please try again later."
        )

    user_id = str(insert_result.inserted_id)

    # Generate token and set HttpOnly cookie
    token = create_access_token({"sub": user_id, "email": payload.email})
    _set_auth_cookie(response, token)

    return AuthResponse(
        user=UserResponse(
            id=user_id,
            name=payload.name,
            email=payload.email,
            created_at=now,
            total_predictions=0,
        ),
        message="Account created successfully."
    )


@router.post("/login", response_model=AuthResponse)
def login_user(payload: LoginRequest, response: Response):
    users_col = get_users_col()
    user = users_col.find_one({"email": payload.email})

    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": user["email"]})
    _set_auth_cookie(response, token)

    preds_col = get_predictions_col()
    total_preds = preds_col.count_documents({"user_id": user["_id"]})

    return AuthResponse(
        user=UserResponse(
            id=user_id,
            name=user.get("name", "User"),
            email=user["email"],
            created_at=user.get("created_at"),
            total_predictions=total_preds,
        ),
        message="Logged in successfully."
    )


@router.post("/logout")
def logout_user(response: Response):
    _clear_auth_cookie(response)
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    preds_col = get_predictions_col()
    total_preds = preds_col.count_documents({"user_id": current_user["_id"]})

    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user.get("name", "User"),
        email=current_user.get("email", ""),
        created_at=current_user.get("created_at"),
        total_predictions=total_preds,
    )
