from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
import logging
from Database.db import get_db
from Services.report_service import ReportService
from Schemas.report_schema import ReportBase, GenerateReportRequest
from Services.ai_service import generate_report
from Models.dataUpload_models import DataUploaded

logger = logging.getLogger(__name__)
from sqlalchemy.future import select
import os
from datetime import datetime



router = APIRouter(prefix="/reports", tags=["Reports"])
@router.get("/all")
async def get_all_reports(db: AsyncSession = Depends(get_db)):
    return await ReportService.get_all_reports(db)
@router.get("/project/{project_id}")
async def get_reports_by_project(project_id: int, db: AsyncSession = Depends(get_db)):
    return await ReportService.get_reports_by_project_id(project_id, db)

@router.post("/create")
async def create_report(report_data: GenerateReportRequest, db: AsyncSession = Depends(get_db)):
    return await ReportService.create_report(report_data, db)


# @router.post("/create")
# async def generate_test_report(
#     request: Request,
#     report_request: GenerateReportRequest,
#     db: AsyncSession = Depends(get_db)
# ):
#     """
#     TESTING ENDPOINT: Receives a list of uploaded file IDs, runs the AI agent,
#     and returns the generated HTML report.
#     """
#     # 1. Fetch file paths from the database using the provided IDs
#     try:
#         stmt = select(
#             DataUploaded.file_path,
#             DataUploaded.institute_id,
#             DataUploaded.project_id
#         ).filter(DataUploaded.id.in_(report_request.source_file_ids))
#         result = await db.execute(stmt)
#         rows = result.all()

#         if not rows or len(rows) != len(report_request.source_file_ids):
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Could not find all source files for the given IDs."
#             )

#         file_paths = [row.file_path for row in rows]
#         institute_id = rows[0].institute_id
#         project_id = rows[0].project_id

#         # 2. Invoke the AI agent with the list of retrieved file paths
#         print(f"🚀 Invoking AI agent with {len(file_paths)} file(s)...")

#         report_data = generate_report(
#             file_paths=file_paths,
#             institute_id=institute_id,
#             project_id=project_id,
#             user_role="admin",
#             report_year="2022-2023",
#             output_format="html",
#             language="en",
#             report_name = report_request.report_name,
#             report_desc= report_request.report_desc
#         )

#         if not report_data:
#             raise HTTPException(status_code=500, detail="AI agent failed to generate report data.")

#         # 3. Store the generated report in a local file
#         print(report_data)
#         return report_data

#     except HTTPException as e:
#         # Re-raise HTTPExceptions so FastAPI can handle the proper status code/details
#         print(e)
#         raise
#     except Exception as e:
#         print(f"Error generating test report: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error while generating report.")

@router.get("/institute/{institute_id}")
async def get_reports_by_institute(institute_id: int, db: AsyncSession = Depends(get_db)):
    return await ReportService.get_report_by_institute_id(institute_id, db)

@router.delete("/delete/{report_id}")
async def delete_report(report_id: int, db: AsyncSession = Depends(get_db)):
    return await ReportService.delete_report(report_id, db)

@router.get("/{report_id}")
async def get_report_by_id(report_id: int, db: AsyncSession = Depends(get_db)):
    return await ReportService.get_report_by_id(report_id, db)

