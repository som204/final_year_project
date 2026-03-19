from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from sqlalchemy import func, delete, and_, or_
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime, timezone

from Models.notification_models import (
    Notification, NotificationRecipient,
    NotificationPriority, NotificationCategory, TargetAudience
)
from Models.user_models import User, UserRole
from Schemas.notification_schema import (
    NotificationCreateSchema, NotificationUpdateSchema,
    NotificationResponseSchema, NotificationListResponseSchema, SenderSchema
)


# ── Allowed target audiences per role ─────────────────────────────────
SUPER_ADMIN_TARGETS = {
    TargetAudience.ALL_INSTITUTES,
    TargetAudience.SPECIFIC_INSTITUTE,
    TargetAudience.SUPER_ADMINS,
}
ADMIN_TARGETS = {
    TargetAudience.INSTITUTE_ALL,
    TargetAudience.INSTITUTE_FACULTY,
    TargetAudience.INSTITUTE_DEPARTMENT,
    TargetAudience.SPECIFIC_USERS,
}
FACULTY_TARGETS = {
    TargetAudience.SPECIFIC_USERS,
    TargetAudience.INSTITUTE_DEPARTMENT,
}


class NotificationService:

    # ══════════════════════════════════════════════════════════════════
    # HELPER — look up sender profile (institute_id, department_id)
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def _get_user(user_id: int, db: AsyncSession) -> User:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    # ══════════════════════════════════════════════════════════════════
    # HELPER — build a response schema from a (Notification, is_read) row
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    def _build_response(notif: Notification, read_status: bool) -> NotificationResponseSchema:
        sender_schema = None
        if notif.sender:
            sender_schema = SenderSchema(
                id=notif.sender.id,
                username=notif.sender.username,
                full_name=notif.sender.full_name,
                role=notif.sender.role.value,
            )
        return NotificationResponseSchema(
            id=notif.id,
            title=notif.title,
            message=notif.message,
            priority=notif.priority,
            category=notif.category,
            target_audience=notif.target_audience,
            is_pinned=notif.is_pinned,
            expires_at=notif.expires_at,
            created_at=notif.created_at,
            updated_at=notif.updated_at,
            sender=sender_schema,
            institute_id=notif.institute_id,
            department_id=notif.department_id,
            is_read=bool(read_status),
        )

    # ══════════════════════════════════════════════════════════════════
    # CREATE
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def create_notification(
        data: NotificationCreateSchema, sender_id: int, sender_role: str, db: AsyncSession
    ) -> NotificationResponseSchema:
        """
        Enforce:
          SUPER_ADMIN → ALL_INSTITUTES, SPECIFIC_INSTITUTE, SUPER_ADMINS
          ADMIN       → INSTITUTE_ALL, INSTITUTE_FACULTY, INSTITUTE_DEPARTMENT, SPECIFIC_USERS
          FACULTY     → SPECIFIC_USERS
          Others      → 403
        """
        role = sender_role
        target = data.target_audience

        # ── Role-level gate ──
        if role == UserRole.SUPER_ADMIN.value:
            allowed = SUPER_ADMIN_TARGETS
        elif role == UserRole.ADMIN.value:
            allowed = ADMIN_TARGETS
        elif role == UserRole.FACULTY.value:
            allowed = FACULTY_TARGETS
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to send notifications",
            )

        if target not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your role ({role}) cannot use target_audience '{target.value}'",
            )

        # ── Target-specific validations ──
        if target == TargetAudience.SPECIFIC_INSTITUTE and not data.institute_id:
            raise HTTPException(400, "institute_id is required for SPECIFIC_INSTITUTE")
        if target == TargetAudience.INSTITUTE_DEPARTMENT and not data.department_id:
            raise HTTPException(400, "department_id is required for INSTITUTE_DEPARTMENT")
        if target == TargetAudience.SPECIFIC_USERS and not data.recipient_ids:
            raise HTTPException(400, "recipient_ids is required for SPECIFIC_USERS")

        try:
            sender = await NotificationService._get_user(sender_id, db)

            # Auto-set institute_id for ADMIN / FACULTY from their profile
            institute_id = data.institute_id
            if role in {UserRole.ADMIN.value, UserRole.FACULTY.value}:
                institute_id = sender.institute_id

            # Auto-set department_id for FACULTY from their profile
            department_id = data.department_id
            if role == UserRole.FACULTY.value:
                department_id = sender.department_id

            notification = Notification(
                title=data.title,
                message=data.message,
                priority=data.priority,
                category=data.category,
                target_audience=target,
                is_pinned=data.is_pinned,
                expires_at=data.expires_at,
                sender_id=sender_id,
                institute_id=institute_id,
                department_id=department_id,
            )
            db.add(notification)
            await db.flush()

            # Create explicit recipient rows for SPECIFIC_USERS
            recipient_count = 0
            if target == TargetAudience.SPECIFIC_USERS and data.recipient_ids:
                for uid in set(data.recipient_ids):
                    db.add(NotificationRecipient(
                        notification_id=notification.id,
                        user_id=uid,
                        is_read=False,
                    ))
                    recipient_count += 1

            await db.commit()
            await db.refresh(notification)

            return NotificationService._build_response(notification, False)

        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Error creating notification: {e}")
            raise HTTPException(500, "Could not create notification")

    # ══════════════════════════════════════════════════════════════════
    # LIST  (role-based receive filtering + pagination)
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def get_notifications(
        user_id: int,
        user_role: str,
        user_institute_id: Optional[int],
        user_department_id: Optional[int],
        category: Optional[str] = None,
        priority: Optional[str] = None,
        is_read: Optional[bool] = None,
        page: int = 1,
        limit: int = 20,
        db: AsyncSession = None,
    ) -> NotificationListResponseSchema:
        """
        Receive rules:
          SUPER_ADMIN → only SUPER_ADMINS + ALL_INSTITUTES (from other super admins)
          ADMIN       → ALL_INSTITUTES + SPECIFIC_INSTITUTE(own) + INSTITUTE_* (own)
                        + SPECIFIC_USERS (if recipient)
          FACULTY     → ALL_INSTITUTES + SPECIFIC_INSTITUTE(own) + INSTITUTE_ALL(own)
                        + INSTITUTE_FACULTY(own) + INSTITUTE_DEPARTMENT(own dept)
                        + SPECIFIC_USERS (if recipient)
          STUDENT     → ALL_INSTITUTES + SPECIFIC_INSTITUTE(own) + INSTITUTE_ALL(own)
                        + INSTITUTE_DEPARTMENT(own dept) + SPECIFIC_USERS (if recipient)
          VIEWER      → ALL_INSTITUTES + SPECIFIC_INSTITUTE(own) + INSTITUTE_ALL(own)
                        + SPECIFIC_USERS (if recipient)
        """
        try:
            now = datetime.now(timezone.utc)

            # Not expired
            base_conditions = [
                or_(Notification.expires_at.is_(None), Notification.expires_at > now)
            ]

            # Subquery: notification ids where user is an explicit recipient
            recipient_subq = (
                select(NotificationRecipient.notification_id)
                .where(NotificationRecipient.user_id == user_id)
            )

            # ── Build audience conditions per role ──
            if user_role == UserRole.SUPER_ADMIN.value:
                audience = or_(
                    Notification.target_audience == TargetAudience.SUPER_ADMINS,
                    Notification.target_audience == TargetAudience.ALL_INSTITUTES,
                )

            elif user_role == UserRole.ADMIN.value:
                audience = or_(
                    Notification.target_audience == TargetAudience.ALL_INSTITUTES,
                    and_(
                        Notification.target_audience == TargetAudience.SPECIFIC_INSTITUTE,
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience.in_([
                            TargetAudience.INSTITUTE_ALL,
                            TargetAudience.INSTITUTE_FACULTY,
                            TargetAudience.INSTITUTE_DEPARTMENT,
                        ]),
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.SPECIFIC_USERS,
                        Notification.id.in_(recipient_subq),
                    ),
                )

            elif user_role == UserRole.FACULTY.value:
                audience = or_(
                    Notification.target_audience == TargetAudience.ALL_INSTITUTES,
                    and_(
                        Notification.target_audience == TargetAudience.SPECIFIC_INSTITUTE,
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.INSTITUTE_ALL,
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.INSTITUTE_FACULTY,
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.INSTITUTE_DEPARTMENT,
                        Notification.institute_id == user_institute_id,
                        Notification.department_id == user_department_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.SPECIFIC_USERS,
                        Notification.id.in_(recipient_subq),
                    ),
                )

            elif user_role == UserRole.STUDENT.value:
                audience = or_(
                    Notification.target_audience == TargetAudience.ALL_INSTITUTES,
                    and_(
                        Notification.target_audience == TargetAudience.SPECIFIC_INSTITUTE,
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.INSTITUTE_ALL,
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.INSTITUTE_DEPARTMENT,
                        Notification.institute_id == user_institute_id,
                        Notification.department_id == user_department_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.SPECIFIC_USERS,
                        Notification.id.in_(recipient_subq),
                    ),
                )

            else:  # VIEWER or any other
                audience = or_(
                    Notification.target_audience == TargetAudience.ALL_INSTITUTES,
                    and_(
                        Notification.target_audience == TargetAudience.SPECIFIC_INSTITUTE,
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.INSTITUTE_ALL,
                        Notification.institute_id == user_institute_id,
                    ),
                    and_(
                        Notification.target_audience == TargetAudience.SPECIFIC_USERS,
                        Notification.id.in_(recipient_subq),
                    ),
                )

            base_conditions.append(audience)

            # Optional filters
            if category:
                base_conditions.append(Notification.category == category)
            if priority:
                base_conditions.append(Notification.priority == priority)

            # ── Main query with left join for read status ──
            stmt = (
                select(
                    Notification,
                    func.coalesce(NotificationRecipient.is_read, False).label("is_read"),
                )
                .outerjoin(
                    NotificationRecipient,
                    and_(
                        NotificationRecipient.notification_id == Notification.id,
                        NotificationRecipient.user_id == user_id,
                    ),
                )
                .options(joinedload(Notification.sender))
                .where(*base_conditions)
            )

            # Read-status filter
            if is_read is True:
                stmt = stmt.where(NotificationRecipient.is_read == True)
            elif is_read is False:
                stmt = stmt.where(
                    or_(NotificationRecipient.is_read == False, NotificationRecipient.is_read.is_(None))
                )

            # Order: pinned first, then newest
            stmt = stmt.order_by(Notification.is_pinned.desc(), Notification.created_at.desc())

            # Count
            count_stmt = select(func.count()).select_from(stmt.subquery())
            total = (await db.execute(count_stmt)).scalar() or 0

            # Paginate
            offset = (page - 1) * limit
            stmt = stmt.offset(offset).limit(limit)

            result = await db.execute(stmt)
            rows = result.unique().all()

            notifications = [
                NotificationService._build_response(row[0], row[1])
                for row in rows
            ]
            unread_count = sum(1 for n in notifications if not n.is_read)

            return NotificationListResponseSchema(
                notifications=notifications,
                total=total,
                unread_count=unread_count,
            )

        except SQLAlchemyError as e:
            print(f"Error fetching notifications: {e}")
            raise HTTPException(500, "Could not fetch notifications")

    # ══════════════════════════════════════════════════════════════════
    # GET BY ID
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def get_notification_by_id(
        notification_id: int, user_id: int, db: AsyncSession
    ) -> NotificationResponseSchema:
        try:
            stmt = (
                select(
                    Notification,
                    func.coalesce(NotificationRecipient.is_read, False).label("is_read"),
                )
                .outerjoin(
                    NotificationRecipient,
                    and_(
                        NotificationRecipient.notification_id == Notification.id,
                        NotificationRecipient.user_id == user_id,
                    ),
                )
                .options(joinedload(Notification.sender))
                .where(Notification.id == notification_id)
            )
            result = await db.execute(stmt)
            row = result.unique().first()
            if not row:
                raise HTTPException(404, "Notification not found")

            return NotificationService._build_response(row[0], row[1])

        except SQLAlchemyError as e:
            print(f"Error fetching notification: {e}")
            raise HTTPException(500, "Could not fetch notification")

    # ══════════════════════════════════════════════════════════════════
    # MARK AS READ
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def mark_as_read(notification_id: int, user_id: int, db: AsyncSession) -> dict:
        try:
            notif = await db.get(Notification, notification_id)
            if not notif:
                raise HTTPException(404, "Notification not found")

            stmt = select(NotificationRecipient).where(
                NotificationRecipient.notification_id == notification_id,
                NotificationRecipient.user_id == user_id,
            )
            result = await db.execute(stmt)
            recipient = result.scalars().first()

            now = datetime.now(timezone.utc)
            if recipient:
                recipient.is_read = True
                recipient.read_at = now
            else:
                db.add(NotificationRecipient(
                    notification_id=notification_id,
                    user_id=user_id,
                    is_read=True,
                    read_at=now,
                ))

            await db.commit()
            return {"detail": "Notification marked as read"}
        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Error marking as read: {e}")
            raise HTTPException(500, "Could not mark notification as read")

    # ══════════════════════════════════════════════════════════════════
    # MARK ALL AS READ
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def mark_all_as_read(user_id: int, db: AsyncSession) -> dict:
        try:
            already_read_subq = (
                select(NotificationRecipient.notification_id)
                .where(
                    NotificationRecipient.user_id == user_id,
                    NotificationRecipient.is_read == True,
                )
            )
            unread_stmt = select(Notification.id).where(Notification.id.notin_(already_read_subq))
            result = await db.execute(unread_stmt)
            unread_ids = result.scalars().all()

            now = datetime.now(timezone.utc)
            for nid in unread_ids:
                existing = await db.execute(
                    select(NotificationRecipient).where(
                        NotificationRecipient.notification_id == nid,
                        NotificationRecipient.user_id == user_id,
                    )
                )
                rec = existing.scalars().first()
                if rec:
                    rec.is_read = True
                    rec.read_at = now
                else:
                    db.add(NotificationRecipient(
                        notification_id=nid, user_id=user_id,
                        is_read=True, read_at=now,
                    ))

            await db.commit()
            return {"detail": f"Marked {len(unread_ids)} notifications as read"}
        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Error marking all as read: {e}")
            raise HTTPException(500, "Could not mark all notifications as read")

    # ══════════════════════════════════════════════════════════════════
    # UPDATE
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def update_notification(
        notification_id: int, data: NotificationUpdateSchema, sender_id: int, db: AsyncSession
    ) -> NotificationResponseSchema:
        try:
            notif = await db.get(Notification, notification_id)
            if not notif:
                raise HTTPException(404, "Notification not found")
            if notif.sender_id != sender_id:
                raise HTTPException(403, "Only the sender can update this notification")

            update_data = data.model_dump(exclude_unset=True)
            recipient_ids = update_data.pop("recipient_ids", None)

            for key, value in update_data.items():
                if hasattr(notif, key):
                    setattr(notif, key, value)

            if recipient_ids is not None and notif.target_audience == TargetAudience.SPECIFIC_USERS:
                await db.execute(
                    delete(NotificationRecipient).where(
                        NotificationRecipient.notification_id == notification_id
                    )
                )
                for uid in set(recipient_ids):
                    db.add(NotificationRecipient(
                        notification_id=notification_id, user_id=uid, is_read=False,
                    ))

            await db.commit()
            await db.refresh(notif)
            return await NotificationService.get_notification_by_id(notification_id, sender_id, db)

        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Error updating notification: {e}")
            raise HTTPException(500, "Could not update notification")

    # ══════════════════════════════════════════════════════════════════
    # DELETE
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def delete_notification(
        notification_id: int, user_id: int, user_role: str, db: AsyncSession
    ) -> dict:
        try:
            notif = await db.get(Notification, notification_id)
            if not notif:
                raise HTTPException(404, "Notification not found")

            if notif.sender_id != user_id and user_role not in {
                UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value
            }:
                raise HTTPException(403, "You do not have permission to delete this notification")

            await db.execute(
                delete(NotificationRecipient).where(
                    NotificationRecipient.notification_id == notification_id
                )
            )
            await db.delete(notif)
            await db.commit()
            return {"detail": "Notification deleted successfully"}
        except SQLAlchemyError as e:
            await db.rollback()
            print(f"Error deleting notification: {e}")
            raise HTTPException(500, "Could not delete notification")

    # ══════════════════════════════════════════════════════════════════
    # UNREAD COUNT (role-aware)
    # ══════════════════════════════════════════════════════════════════
    @staticmethod
    async def get_unread_count(
        user_id: int, user_role: str,
        user_institute_id: Optional[int], user_department_id: Optional[int],
        db: AsyncSession,
    ) -> dict:
        """Uses the same audience logic as get_notifications but only counts."""
        try:
            # Re-use get_notifications with limit=0-style approach for accuracy
            result = await NotificationService.get_notifications(
                user_id=user_id,
                user_role=user_role,
                user_institute_id=user_institute_id,
                user_department_id=user_department_id,
                is_read=False,
                page=1,
                limit=10000,  # large enough to count all
                db=db,
            )
            return {"unread_count": result.total}
        except Exception as e:
            print(f"Error getting unread count: {e}")
            raise HTTPException(500, "Could not get unread count")
