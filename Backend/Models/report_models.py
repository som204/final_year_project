from typing import TYPE_CHECKING, List
from datetime import datetime

from sqlalchemy import (
    String, Integer, ForeignKey, Text, DateTime, func, 
    Table, Column
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Models import Base

from Models.association_models import report_data_association
from datetime import timezone

if TYPE_CHECKING:
    from .user_models import User
    from .dataUpload_models import DataUploaded
    from .project_models import Project





class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), nullable=False,default=lambda: datetime.now(timezone.utc)
    )
    
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    

    
    projects: Mapped["Project"] = relationship(back_populates="reports")
    
    source_files: Mapped[List["DataUploaded"]] = relationship(
        secondary=report_data_association,
        back_populates="generated_reports"
    )