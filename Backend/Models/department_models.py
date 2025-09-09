from enum import Enum
from typing import List, Optional,TYPE_CHECKING
from datetime import datetime

from sqlalchemy import (
    String, Integer, ForeignKey, Text, Enum as SqlEnum,
    DateTime, Boolean
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property
from Models import Base
if TYPE_CHECKING:
    from .user_models import User
    from .institute_models import Institute




# ========================
# Department Model
# ========================
class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)  # Approved by Admin
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now())

    institute_id: Mapped[int] = mapped_column(ForeignKey("institutes.id"), nullable=False)

    # relationships
    institute: Mapped["Institute"] = relationship(back_populates="departments")
    users: Mapped[List["User"]] = relationship(back_populates="department")

    def __repr__(self) -> str:
        return f"Department(id={self.id}, name='{self.name}', code='{self.code}', description='{self.description}', is_approved={self.is_approved}, created_at='{self.created_at.isoformat() if self.created_at else None}', institute_id={self.institute_id})"
