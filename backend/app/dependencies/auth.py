from typing import Optional, Dict, Any
from bson import ObjectId
from fastapi import Request, HTTPException, status, Depends
from app.config import settings
from app.utils.security import decode_access_token
from app.database.mongodb import get_users_col

async def get_current_user(request: Request) -> Dict[str, Any]:
    # 1. Try to read from HttpOnly cookie
    token = request.cookies.get(settings.COOKIE_NAME)

    # 2. If not found in cookie, try Authorization header: Bearer <token>
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decode and validate token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired or is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_object_id = ObjectId(user_id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification in session.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    users_col = get_users_col()
    user = users_col.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
