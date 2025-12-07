from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from Models.department_models import Department
from typing import List
from sqlalchemy.orm import joinedload
from Schemas.department_schema import DepartmentResponseSchema
from sqlalchemy import delete
from Models.dataUpload_models import DataUploaded
from Models.user_models import User

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
        

    @staticmethod
    async def delete_department(department_id: int, db: AsyncSession) -> dict:

        try:
            result = await db.execute(select(Department).where(Department.id == department_id))
            department = result.scalars().first()
            if not department:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

            # remove users tied to this department first
            await db.execute(delete(User).where(User.department_id == department_id))
            # remove data uploads tied to this department
            await db.execute(delete(DataUploaded).where(DataUploaded.department_id == department_id))
            # remove the department
            await db.execute(delete(Department).where(Department.id == department_id))

            await db.commit()
            return {"detail": "Department and related users deleted successfully"}
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    @staticmethod
    async def update_department(department_id: int, department_data: dict, db: AsyncSession) -> Department:
        try:
            result = await db.execute(select(Department).where(Department.id == department_id))
            department = result.scalars().first()
            if not department:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

            for key, value in department_data.items():
                if key == "id":
                    continue
                if hasattr(department, key):
                    setattr(department, key, value)

            db.add(department)
            await db.commit()
            await db.refresh(department)
            return department
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
