from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from Models.institute_models import Institute
import os
from typing import List
from Schemas.institute_schema import InstituteCreateSchema
from Models.user_models import User


class InstituteService:

    @staticmethod
    async def create_institute_service(institute_data: InstituteCreateSchema, db: AsyncSession) -> Institute:
        """Creates a new institute in the database."""
        # Check if institute already exists
        result = await db.execute(select(Institute).filter(
            (Institute.code == institute_data.code) | (Institute.name == institute_data.name)
        ))
        if result.scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Institute with this code or name already exists")

        try:
            new_institute = Institute(
                name=institute_data.name,
                code=institute_data.code,
                address=institute_data.address,
                contact_email=institute_data.contact_email,
                contact_phone=institute_data.contact_phone,
                is_approved=institute_data.is_approved,
            )
            db.add(new_institute)
            await db.commit()
            await db.refresh(new_institute)
            
            # Create admin user for the institute
            admin_user = User(
                full_name=institute_data.admin_name,
                email=institute_data.admin_email,
                phone=institute_data.admin_phone,
                institute_id=new_institute.id,
                role='ADMIN',
                username=f"{institute_data.code}_admin",
            )
            admin_user.set_password("admin123")

            db.add(admin_user)
            await db.commit()
            await db.refresh(admin_user)

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