from pydantic import BaseModel
from enum import Enum


# Define Enum first
class ShareLevel(str, Enum):
    PRIVATE = "private"
    SHARED = "shared"
    PUBLIC = "public"


# Use Enum in schema
class ReportVisibilitySchema(BaseModel):
    report_id: int
    share_level: ShareLevel