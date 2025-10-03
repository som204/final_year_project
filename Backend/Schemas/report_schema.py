from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportBase(BaseModel):
    file_name: str
    file_path: str
    description: str
    project_id: int
    