from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from Database.db import get_db
from Services.report_service import ReportService
from Schemas.report_schema import ReportBase

router = APIRouter(prefix="/reports", tags=["Reports"])
@router.get("/all")
async def get_all_reports(db: AsyncSession = Depends(get_db)):
    return await ReportService.get_all_reports(db)
@router.get("/project/{project_id}")
async def get_reports_by_project(project_id: int, db: AsyncSession = Depends(get_db)):
    return await ReportService.get_reports_by_project_id(project_id, db)

@router.post("/create")
async def create_report(report_data: ReportBase, db: AsyncSession = Depends(get_db)):
    return await ReportService.create_report(report_data.model_dump(), db)