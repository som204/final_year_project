from enum import Enum
from typing import List, Optional,TYPE_CHECKING
from datetime import datetime

from sqlalchemy import (
    String, Integer, ForeignKey, Text, Enum as SqlEnum,
    DateTime, Boolean
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property

if TYPE_CHECKING:
    from .department_models import Department
    from .institute_models import Institute

import bcrypt


# ========================
# Base Class
# ========================
class Base(DeclarativeBase):
    pass


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
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), nullable=False)

    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)  # auto-True if VIEWER
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now())
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)

    institute_id: Mapped[Optional[int]] = mapped_column(ForeignKey("institutes.id"))
    department_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id"))

    # relationships
    institute: Mapped[Optional["Institute"]] = relationship(back_populates="users")
    department: Mapped[Optional["Department"]] = relationship(back_populates="users")

    # Hybrid property: VIEWERs are always approved
    @hybrid_property
    def is_effectively_approved(self) -> bool:
        if self.role == UserRole.VIEWER:
            return True
        return self.is_approved

    def __repr__(self): 
        return f"User(id={self.id}, username='{self.username}', email='{self.email}', role='{self.role}', full_name='{self.full_name}', phone='{self.phone}', is_approved={self.is_approved}, created_at='{self.created_at.isoformat() if self.created_at else None}', last_login='{self.last_login.isoformat() if self.last_login else None}', institute_id={self.institute_id}, department_id={self.department_id})"

    def set_password(self, plaintext_password: str) -> None:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(plaintext_password.encode('utf-8'), salt)
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
    role: Mapped[Optional[str]] = mapped_column(String(100))  # e.g., "Board Member", "Trustee"
    email: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    organization: Mapped[Optional[str]] = mapped_column(String(255))  # e.g., "XYZ Foundation"
    notes: Mapped[Optional[str]] = mapped_column(Text)  # Extra details or contributions
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)  # Approved by Admin
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    institute_id: Mapped[int] = mapped_column(ForeignKey("institutes.id"), nullable=False)

    # relationships
    institute: Mapped["Institute"] = relationship(back_populates="stakeholders")

    def __repr__(self):
        return f"Stakeholder(id={self.id}, name='{self.name}', role='{self.role}', email='{self.email}', phone='{self.phone}', organization='{self.organization}', notes='{self.notes}', is_approved={self.is_approved}, created_at='{self.created_at.isoformat() if self.created_at else None}', institute_id={self.institute_id})"



