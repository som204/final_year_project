from typing import List, Optional, TYPE_CHECKING
from datetime import datetime,timezone

from sqlalchemy import (
    String, Integer, ForeignKey, Text, DateTime, Boolean,
    func, UniqueConstraint  # IMPROVEMENT: Added func and UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Models import Base

if TYPE_CHECKING:
    from .user_models import User
    from .institute_models import Institute
    from .dataUpload_models import DataUploaded


# ========================
# Department Model
# ========================
class Department(Base):
    __tablename__ = "departments"
    
    __table_args__ = (
        UniqueConstraint('code', 'institute_id', name='_code_institute_uc'),
        UniqueConstraint('name', 'institute_id', name='_name_institute_uc'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    institute_id: Mapped[int] = mapped_column(ForeignKey("institutes.id"), nullable=False)

    # relationships
    institute: Mapped["Institute"] = relationship(back_populates="departments")
    users: Mapped[List["User"]] = relationship(back_populates="department")
    data_uploads: Mapped[List["DataUploaded"]] = relationship(back_populates="department")

    def __repr__(self) -> str:
        return f"Department(id={self.id}, name='{self.name}', code='{self.code}')"