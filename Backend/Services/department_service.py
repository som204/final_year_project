from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from Models.department_models import Department
from typing import List
from sqlalchemy.orm import joinedload
from Schemas.department_schema import DepartmentResponseSchema

class DepartmentService:
    @staticmethod
    async def get_all_departments(db: AsyncSession) -> List[DepartmentResponseSchema]:
        try:
            result = await db.execute(select(Department).options(joinedload(Department.institute)))
            departments = result.scalars().all()
            result=[]
            for department in departments:
                department_data = DepartmentResponseSchema.model_validate(department)
                department_dict = department_data.model_dump()
                department_dict["institute_name"] = department.institute.name if department.institute else None
                result.append(department_dict)
            return result
        except SQLAlchemyError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    @staticmethod
    async def create_department(department_data: dict, db: AsyncSession) -> Department:
        try:
            new_department = Department(**department_data)
            db.add(new_department)
            await db.commit()
            await db.refresh(new_department)
            return new_department
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    @staticmethod
    async def get_department_by_institute_id(institute_id: int, db: AsyncSession) -> List[Department]:
        try:
            result = await db.execute(select(Department).where(Department.institute_id == institute_id))
            departments = result.scalars().all()
            return list(departments)
        except SQLAlchemyError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))