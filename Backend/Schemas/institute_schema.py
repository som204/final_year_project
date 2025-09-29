

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime


class InstituteCreateSchema(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    is_approved: bool = False
    admin_name: str
    admin_email: EmailStr
    admin_phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)



class InstituteResponseSchema(BaseModel):
    id: int
    name: str
    code: str
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    is_approved: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)