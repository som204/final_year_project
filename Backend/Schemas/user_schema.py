from pydantic import BaseModel, EmailStr
from typing import Optional
from Models.user_models import UserRole
from datetime import datetime

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str   # plain password (will be hashed before saving)
    role: UserRole  # must match Enum
    full_name: Optional[str] = None
    phone: Optional[str] = None
    institute_id: Optional[int] = None
    department_id: Optional[int] = None

    model_config = {
        "from_attributes": True
    }

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: UserRole
    full_name: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    institute_id: Optional[int] = None
    department_id: Optional[int] = None

    model_config = {
        "from_attributes": True
    }