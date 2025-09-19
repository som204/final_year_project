# db.py or models.py
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import (
    String, Integer, ForeignKey, Text,
    DateTime, Boolean, func
)
from typing import Optional, List
from Database.db import Base
from datetime import datetime

# You will need to import your other models
from .user_models import User
from .institute_models import Institute
from .department_models import Department

class DataUploaded(Base):
    __tablename__ = "data_uploaded"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    upload_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    file_path: Mapped[str] = mapped_column(String(255), nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # --- Foreign Keys for Relationships ---
    faculty_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("departments.id"), nullable=False)
    institute_id: Mapped[int] = mapped_column(Integer, ForeignKey("institutes.id"), nullable=False)
    
    # --- Relationships ---
    # These allow you to access the full objects, e.g., my_upload.faculty.full_name
    faculty: Mapped["User"] = relationship(back_populates="data_uploads")
    department: Mapped["Department"] = relationship(back_populates="data_uploads")
    institute: Mapped["Institute"] = relationship(back_populates="data_uploads")