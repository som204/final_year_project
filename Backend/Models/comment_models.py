from typing import TYPE_CHECKING
from datetime import datetime, timezone

from sqlalchemy import String, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from Database.db import Base

if TYPE_CHECKING:
    from .user_models import User
    from .report_models import Report


class ReportComment(Base):
    __tablename__ = "report_comments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    comment: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Foreign Keys
    report_id: Mapped[int] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Relationships
    report: Mapped["Report"] = relationship(
        back_populates="comments"
    )

    user: Mapped["User"] = relationship(
        back_populates="report_comments"
    )