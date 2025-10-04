import enum
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime, timezone

from sqlalchemy import (
    String, Integer, ForeignKey, Text, DateTime,
    Enum, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Models import Base

if TYPE_CHECKING:
    from .institute_models import Institute
    from .report_models import Report
    from .dataUpload_models import DataUploaded

# Define an Enum for the project status for better data integrity
class ProjectStatus(enum.Enum):
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    ON_HOLD = "ON_HOLD"
    CANCELLED = "CANCELLED"

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus), 
        nullable=False, 
        default=ProjectStatus.ONGOING
    )
    
    created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), nullable=False,default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
    institute_id: Mapped[int] = mapped_column(ForeignKey("institutes.id"), index=True)
    institute: Mapped["Institute"] = relationship(back_populates="projects")
    reports: Mapped[List["Report"]] = relationship(
        back_populates="projects",
        cascade="all, delete-orphan"
    )
    data_uploads: Mapped[List["DataUploaded"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan"
    )

