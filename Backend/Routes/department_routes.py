from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, status
from Database.db import get_db
from Services.department_service import DepartmentService
from Schemas.department_schema import DepartmentCreateSchema as DepartmentCreate, DepartmentResponseSchema

router = APIRouter(prefix="/department", tags=["departments"])

@router.get("/all", response_model=list[DepartmentResponseSchema])
async def get_departments(db: AsyncSession = Depends(get_db)):
    return await DepartmentService.get_all_departments(db)

@router.post("/create", response_model=DepartmentResponseSchema)
async def create_department(department: DepartmentCreate, db: AsyncSession = Depends(get_db)):
    return await DepartmentService.create_department(department.model_dump(), db)