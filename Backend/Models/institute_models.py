from enum import Enum
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime

from sqlalchemy import (
    String, Integer, ForeignKey, Text, Enum as SqlEnum,
    DateTime, Boolean, func  # IMPROVED: Added func import
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from Models import Base

if TYPE_CHECKING:
    from .user_models import User, Stakeholder
    from .department_models import Department
    from .dataUpload_models import DataUploaded

# ========================
# Institute Model
# ========================

class Institute(Base):
    __tablename__ = "institutes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    
    # IMPROVED: Added explicit nullable=True for clarity
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # FIXED: Use server_default and a timezone-aware DateTime
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )

    # Relationships are correct
    departments: Mapped[List["Department"]] = relationship(back_populates="institute")
    users: Mapped[List["User"]] = relationship(back_populates="institute")
    stakeholders: Mapped[List["Stakeholder"]] = relationship(back_populates="institute")
    data_uploads: Mapped[List["DataUploaded"]] = relationship(back_populates="institute")