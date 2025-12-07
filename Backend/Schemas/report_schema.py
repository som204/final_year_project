from pydantic import BaseModel
from typing import Optional, List, Union
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
    project_id: Union[int, str]
    source_file_ids: List[int]
    report_name: str
    report_desc: str