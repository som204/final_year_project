from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends,Request, HTTPException, status
from Database.db import get_db
from Services.report_service import ReportService
from Schemas.report_schema import ReportBase, GenerateReportRequest
from Services.ai_service import generate_report
from Models.dataUpload_models import DataUploaded
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

# @router.post("/create")
# async def create_report(report_data: ReportBase, db: AsyncSession = Depends(get_db)):
#     return await ReportService.create_report(report_data.model_dump(), db)


@router.post("/create")
async def generate_test_report(
    request: Request,
    report_request: GenerateReportRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    TESTING ENDPOINT: Receives a list of uploaded file IDs, runs the AI agent,
    and returns the generated HTML report.
    """
    # 1. Fetch file paths from the database using the provided IDs
    stmt = select(
        DataUploaded.file_path,
        DataUploaded.institute_id,
        DataUploaded.project_id
    ).filter(DataUploaded.id.in_(report_request.source_file_ids))
    result = await db.execute(stmt)
    rows = result.all()

    if not rows or len(rows) != len(report_request.source_file_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Could not find all source files for the given IDs."
        )

    file_paths = [row.file_path for row in rows]
    institute_id = rows[0].institute_id
    project_id = rows[0].project_id
    
    # 2. Invoke the AI agent with the list of retrieved file paths
    print(f"🚀 Invoking AI agent with {len(file_paths)} file(s)...")
    
    # initial_state: GraphState = {"file_paths": list(file_paths), "institute_id": institute_id, "project_id": project_id}
    # final_state = app_graph.invoke(initial_state)
    # report_data = final_state.get("final_report_data")

    report_data = generate_report(
        file_paths=file_paths,
        institute_id=institute_id,
        project_id=project_id,
        user_role="admin",
        report_year="2022-2023",
        output_format="html",
        language="en"
        )
    
    if not report_data:
        raise HTTPException(status_code=500, detail="AI agent failed to generate report data.")

    # 3. Store the generated report in a local file

    

    # Optionally, you can still store the file path in the database if needed
    return report_data

@router.get("/institute/{institute_id}")
async def get_reports_by_institute(institute_id: int, db: AsyncSession = Depends(get_db)):
    return await ReportService.get_report_by_institute_id(institute_id, db)