from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from Models.institute_models import Institute
import os
from typing import List


class InstituteService:

    @staticmethod
    async def create_institute_service(institute_data: dict, db: AsyncSession) -> Institute:
        """Creates a new institute in the database."""
        # Check if institute already exists
        result = await db.execute(select(Institute).filter(
            (Institute.code == institute_data['code']) | (Institute.name == institute_data['name'])
        ))
        if result.scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Institute with this code or name already exists")

        try:
            new_institute = Institute(**institute_data)

            db.add(new_institute)
            await db.commit()
            await db.refresh(new_institute)
            
            return new_institute
            
        except SQLAlchemyError as e:
            # print(f"Error occurred: {e}")
            await db.rollback()
            # In production, you might want to log the actual error `e`
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create institute due to a database error.")

    @staticmethod
    async def get_all_institutes_service(db: AsyncSession) -> List[Institute]:
        """Fetches all institutes from the database."""
        try:
            result = await db.execute(select(Institute))
            institutes = list(result.scalars().all())
            return institutes
        except SQLAlchemyError as e:
            # In production, you might want to log the actual error `e`
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not fetch institutes due to a database error.")