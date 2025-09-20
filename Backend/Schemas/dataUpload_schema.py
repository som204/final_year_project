from pydantic import BaseModel
from typing import Optional




class DataUploadBase(BaseModel):
    name: str
    description: Optional[str] = None
    file_path: str
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    institute_id: Optional[int] = None