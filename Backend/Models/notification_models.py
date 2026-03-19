from enum import Enum
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone

from sqlalchemy import (
    String, Integer, ForeignKey, Text, Enum as SqlEnum,
    DateTime, Boolean, func, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .user_models import User
    from .institute_models import Institute
    from .department_models import Department

from Database.db import Base


# ========================
# Enums
# ========================
class NotificationPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class NotificationCategory(str, Enum):
    GENERAL = "GENERAL"
    ANNOUNCEMENT = "ANNOUNCEMENT"
    ACADEMIC = "ACADEMIC"
    EVENT = "EVENT"
    MAINTENANCE = "MAINTENANCE"


class TargetAudience(str, Enum):
    # Super Admin targets
    ALL_INSTITUTES = "ALL_INSTITUTES"            # Super admin → broadcast to all institutes
    SPECIFIC_INSTITUTE = "SPECIFIC_INSTITUTE"    # Super admin → one institute
    SUPER_ADMINS = "SUPER_ADMINS"                # Super admin → other super admins

    # Institute Admin targets
    INSTITUTE_ALL = "INSTITUTE_ALL"              # Admin → all users in their institute
    INSTITUTE_FACULTY = "INSTITUTE_FACULTY"      # Admin → all faculty in their institute
    INSTITUTE_DEPARTMENT = "INSTITUTE_DEPARTMENT" # Admin → specific department

    # Shared
    SPECIFIC_USERS = "SPECIFIC_USERS"            # Admin/Faculty → hand-picked users


# ========================
# Notification Model
# ========================
class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    priority: Mapped[NotificationPriority] = mapped_column(
        SqlEnum(NotificationPriority), nullable=False, default=NotificationPriority.MEDIUM
    )
    category: Mapped[NotificationCategory] = mapped_column(
        SqlEnum(NotificationCategory), nullable=False, default=NotificationCategory.GENERAL
    )
    target_audience: Mapped[TargetAudience] = mapped_column(
        SqlEnum(TargetAudience), nullable=False, default=TargetAudience.INSTITUTE_ALL
    )

    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    institute_id: Mapped[Optional[int]] = mapped_column(ForeignKey("institutes.id"), nullable=True)
    department_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    sender: Mapped["User"] = relationship(back_populates="sent_notifications", lazy="joined")
    institute: Mapped[Optional["Institute"]] = relationship(back_populates="notifications")
    department: Mapped[Optional["Department"]] = relationship(back_populates="notifications")
    recipients: Mapped[List["NotificationRecipient"]] = relationship(
        back_populates="notification", cascade="all, delete-orphan"
    )


# ========================
# Notification Recipient Model
# ========================
class NotificationRecipient(Base):
    __tablename__ = "notification_recipients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    notification_id: Mapped[int] = mapped_column(ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    notification: Mapped["Notification"] = relationship(back_populates="recipients")
    user: Mapped["User"] = relationship(back_populates="notification_receipts")

    __table_args__ = (
        UniqueConstraint("notification_id", "user_id", name="uq_notification_user"),
    )
