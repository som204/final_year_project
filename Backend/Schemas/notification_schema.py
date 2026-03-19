from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from Models.notification_models import NotificationPriority, NotificationCategory, TargetAudience


class NotificationCreateSchema(BaseModel):
    title: str
    message: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    category: NotificationCategory = NotificationCategory.GENERAL
    target_audience: TargetAudience = TargetAudience.INSTITUTE_ALL
    recipient_ids: Optional[List[int]] = None   # Required when target_audience = SPECIFIC_USERS
    institute_id: Optional[int] = None          # Required for SPECIFIC_INSTITUTE
    department_id: Optional[int] = None         # Required for INSTITUTE_DEPARTMENT
    is_pinned: bool = False
    expires_at: Optional[datetime] = None


class NotificationUpdateSchema(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    priority: Optional[NotificationPriority] = None
    category: Optional[NotificationCategory] = None
    target_audience: Optional[TargetAudience] = None
    recipient_ids: Optional[List[int]] = None
    institute_id: Optional[int] = None
    department_id: Optional[int] = None
    is_pinned: Optional[bool] = None
    expires_at: Optional[datetime] = None


class SenderSchema(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: str

    class Config:
        from_attributes = True


class NotificationResponseSchema(BaseModel):
    id: int
    title: str
    message: str
    priority: NotificationPriority
    category: NotificationCategory
    target_audience: TargetAudience
    is_pinned: bool
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    sender: Optional[SenderSchema] = None
    institute_id: Optional[int] = None
    department_id: Optional[int] = None
    is_read: Optional[bool] = False
    recipient_count: Optional[int] = 0

    class Config:
        from_attributes = True


class NotificationListResponseSchema(BaseModel):
    notifications: List[NotificationResponseSchema]
    total: int
    unread_count: int
