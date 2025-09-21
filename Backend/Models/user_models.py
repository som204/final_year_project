from enum import Enum
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime,timezone

from sqlalchemy import (
    String, Integer, ForeignKey, Text, Enum as SqlEnum,
    DateTime, Boolean, func, case  # IMPROVED: Import func and case
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property

if TYPE_CHECKING:
    from .department_models import Department
    from .institute_models import Institute
    from .dataUpload_models import DataUploaded

import bcrypt

from Database.db import Base


# ========================
# Enum for Roles
# ========================
class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    FACULTY = "FACULTY"
    STUDENT = "STUDENT"
    VIEWER = "VIEWER"


# ========================
# User Model
# ========================
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(60), nullable=False)
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), nullable=False,default=lambda: datetime.now(timezone.utc)
)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    institute_id: Mapped[Optional[int]] = mapped_column(ForeignKey("institutes.id"), nullable=True)
    department_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id"), nullable=True)

    # relationships
    institute: Mapped[Optional["Institute"]] = relationship(back_populates="users")
    department: Mapped[Optional["Department"]] = relationship(back_populates="users")
    data_uploads: Mapped[List["DataUploaded"]] = relationship(back_populates="faculty")

    @hybrid_property
    def is_effectively_approved(self) -> bool:
        if self.role == UserRole.VIEWER:
            return True
        return self.is_approved

    def set_password(self, plaintext_password: str) -> None:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(plaintext_password.encode('utf-8'), salt)
        # IMPROVED: Storing a 60-char hash, no need for Text
        self.password_hash = hashed.decode('utf-8')

    def check_password(self, plaintext_password: str) -> bool:
        return bcrypt.checkpw(plaintext_password.encode('utf-8'), self.password_hash.encode('utf-8'))


# ========================
# Stakeholder Model
# ========================
class Stakeholder(Base):
    __tablename__ = "stakeholders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    organization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    institute_id: Mapped[int] = mapped_column(ForeignKey("institutes.id"), nullable=False)

    # relationships
    institute: Mapped["Institute"] = relationship(back_populates="stakeholders")