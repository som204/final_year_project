from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from Database.db import get_db
from Services.project_service import ProjectService
from Schemas.project_schema import ProjectBase

router = APIRouter(prefix="/projects", tags=["Projects"])
@router.get("/all")
async def get_all_projects(db: AsyncSession = Depends(get_db)):
    return await ProjectService.get_all_projects(db)


@router.get("/institute/{institute_id}")
async def get_projects_by_institute(institute_id: int, db: AsyncSession = Depends(get_db)):
    return await ProjectService.get_projects_by_institute_id(institute_id, db)

@router.post("/create")
async def create_project(project_data: ProjectBase, db: AsyncSession = Depends(get_db)):
    return await ProjectService.create_project(project_data.model_dump(), db)

@router.delete("/{project_id}")
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    return await ProjectService.delete_project(project_id, db)


@router.put("/{project_id}")
async def update_project(project_id: int, update_data: dict, db: AsyncSession = Depends(get_db)):
    return await ProjectService.update_project(project_id, update_data, db)