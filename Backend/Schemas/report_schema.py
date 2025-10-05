from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ReportBase(BaseModel):
    file_name: str
    file_path: str
    description: str
    project_id: int
    



class GenerateReportRequest(BaseModel):
    """
    Defines the request body for triggering a new report generation.
    """
    source_file_ids: List[int]