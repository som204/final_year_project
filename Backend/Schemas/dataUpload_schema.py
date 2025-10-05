from pydantic import BaseModel
from typing import Optional
from datetime import datetime




class DataUploadBase(BaseModel):
    id : Optional[int] = None
    name: str
    description: Optional[str] = None
    file_path: str
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    institute_id: Optional[int] = None
    project_id: int
    project_name: Optional[str] = None
    faculty_name: Optional[str]=None
    department_name : Optional[str]=None
    upload_time: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }