

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class InstituteCreateSchema(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    is_approved: bool = False


class InstituteResponseSchema(BaseModel):
    id: int
    name: str
    code: str
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    is_approved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True