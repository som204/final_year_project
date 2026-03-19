from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from Database.db import get_db
from Services.notification_service import NotificationService
from Schemas.notification_schema import (
    NotificationCreateSchema,
    NotificationUpdateSchema,
    NotificationResponseSchema,
    NotificationListResponseSchema,
)

router = APIRouter(prefix="/notification", tags=["notifications"])


def _get_user_claims(request: Request) -> dict:
    """Extract user claims from the JWT payload attached by AuthMiddleware."""
    user = getattr(request.state, "user", None)
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


# ── Create ────────────────────────────────────────────────────────────
@router.post("/create", response_model=NotificationResponseSchema)
async def create_notification(
    data: NotificationCreateSchema,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    claims = _get_user_claims(request)
    return await NotificationService.create_notification(
        data=data,
        sender_id=int(claims["sub"]),
        sender_role=claims["role"],
        db=db,
    )


# ── List (with filters & pagination) ─────────────────────────────────
@router.get("/all", response_model=NotificationListResponseSchema)
async def get_notifications(
    request: Request,
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    claims = _get_user_claims(request)
    user_id = int(claims["sub"])

    # Fetch user profile for institute_id / department_id
    user = await NotificationService._get_user(user_id, db)

    return await NotificationService.get_notifications(
        user_id=user_id,
        user_role=claims["role"],
        user_institute_id=user.institute_id,
        user_department_id=user.department_id,
        category=category,
        priority=priority,
        is_read=is_read,
        page=page,
        limit=limit,
        db=db,
    )


# ── Unread Count ──────────────────────────────────────────────────────
@router.get("/unread-count")
async def get_unread_count(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    claims = _get_user_claims(request)
    user_id = int(claims["sub"])
    user = await NotificationService._get_user(user_id, db)

    return await NotificationService.get_unread_count(
        user_id=user_id,
        user_role=claims["role"],
        user_institute_id=user.institute_id,
        user_department_id=user.department_id,
        db=db,
    )


# ── Get Single ────────────────────────────────────────────────────────
@router.get("/{notification_id}", response_model=NotificationResponseSchema)
async def get_notification(
    notification_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    claims = _get_user_claims(request)
    return await NotificationService.get_notification_by_id(
        notification_id=notification_id,
        user_id=int(claims["sub"]),
        db=db,
    )


# ── Update ────────────────────────────────────────────────────────────
@router.put("/{notification_id}", response_model=NotificationResponseSchema)
async def update_notification(
    notification_id: int,
    data: NotificationUpdateSchema,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    claims = _get_user_claims(request)
    return await NotificationService.update_notification(
        notification_id=notification_id,
        data=data,
        sender_id=int(claims["sub"]),
        db=db,
    )


# ── Delete ────────────────────────────────────────────────────────────
@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    claims = _get_user_claims(request)
    return await NotificationService.delete_notification(
        notification_id=notification_id,
        user_id=int(claims["sub"]),
        user_role=claims["role"],
        db=db,
    )


# ── Mark as Read ──────────────────────────────────────────────────────
@router.patch("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    claims = _get_user_claims(request)
    return await NotificationService.mark_as_read(
        notification_id=notification_id,
        user_id=int(claims["sub"]),
        db=db,
    )


# ── Mark All as Read ─────────────────────────────────────────────────
@router.patch("/read-all")
async def mark_all_as_read(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    claims = _get_user_claims(request)
    return await NotificationService.mark_all_as_read(
        user_id=int(claims["sub"]),
        db=db,
    )
