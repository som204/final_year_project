from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from Models.department_models import Department
from typing import List

class DepartmentService:
    @staticmethod
    async def get_all_departments(db: AsyncSession) -> List[Department]:
        try:
            result = await db.execute(select(Department))
            departments = result.scalars().all()
            return list(departments)
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