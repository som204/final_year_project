from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DepartmentCreateSchema(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    institute_id: int
    is_approved: bool = False

class DepartmentResponseSchema(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    is_approved: bool
    created_at: datetime
    institute_id: int
    class Config:
        from_attributes = True