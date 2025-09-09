from enum import Enum
from typing import List, Optional,TYPE_CHECKING
from datetime import datetime

from sqlalchemy import (
    String, Integer, ForeignKey, Text, Enum as SqlEnum,
    DateTime, Boolean
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from Models import Base
if TYPE_CHECKING:
    from .user_models import User, Stakeholder
    from .department_models import Department



# ========================
# Institute Model
# ========================


class Institute(Base):
    __tablename__ = "institutes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    address: Mapped[Optional[str]] = mapped_column(String(255))
    contact_email: Mapped[Optional[str]] = mapped_column(String(255))
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20))
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)  # Approved by Super Admin
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now())

    # relationships
    departments: Mapped[List["Department"]] = relationship(back_populates="institute")
    users: Mapped[List["User"]] = relationship(back_populates="institute")
    stakeholders: Mapped[List["Stakeholder"]] = relationship(back_populates="institute")

    def __repr__(self):
        return f"Institute(id={self.id}, name='{self.name}', code='{self.code}', address='{self.address}', contact_email='{self.contact_email}', contact_phone='{self.contact_phone}', is_approved={self.is_approved}, created_at='{self.created_at.isoformat() if self.created_at else None}')"
