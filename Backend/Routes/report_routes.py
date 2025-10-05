from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends,Request, HTTPException, status
from Database.db import get_db
from Services.report_service import ReportService
from Schemas.report_schema import ReportBase, GenerateReportRequest
from Services.ai_service import app_graph, GraphState
from Models.dataUpload_models import DataUploaded
from sqlalchemy.future import select

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
    stmt = select(DataUploaded.file_path).filter(DataUploaded.id.in_(report_request.source_file_ids))
    result = await db.execute(stmt)
    file_paths = result.scalars().all()

    if not file_paths or len(file_paths) != len(report_request.source_file_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Could not find all source files for the given IDs."
        )

    # 2. Invoke the AI agent with the list of retrieved file paths
    print(f"🚀 Invoking AI agent with {len(file_paths)} file(s)...")
    initial_state: GraphState = {"file_paths": list(file_paths)}
    final_state = app_graph.invoke(initial_state)
    report_data = final_state.get("final_report_data")
    
    if not report_data:
        raise HTTPException(status_code=500, detail="AI agent failed to generate report data.")

    return report_data

@router.get("/institute/{institute_id}")
async def get_reports_by_institute(institute_id: int, db: AsyncSession = Depends(get_db)):
    return await ReportService.get_report_by_institute_id(institute_id, db)