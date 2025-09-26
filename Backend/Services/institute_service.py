from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError,IntegrityError
from fastapi import HTTPException, status
from Models.institute_models import Institute
import os
from typing import List
from Schemas.institute_schema import InstituteCreateSchema
from Models.user_models import User


class InstituteService:

    @staticmethod
    async def create_institute_service(institute_data: InstituteCreateSchema, db: AsyncSession) -> Institute:
        """
        Creates a new institute and its admin user within a single atomic transaction.
        """
        # --- 1. Perform checks BEFORE the transaction to fail fast ---
        existing_institute_stmt = select(Institute).filter(
            (Institute.code == institute_data.code) | (Institute.name == institute_data.name)
        )
        if (await db.execute(existing_institute_stmt)).scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Institute with this code or name already exists")
        
        existing_user_stmt = select(User).filter(User.email == institute_data.admin_email)
        if (await db.execute(existing_user_stmt)).scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An admin with this email already exists")

        try:
            
            async with db.begin_nested():
                # Create the institute
                new_institute = Institute(
                    name=institute_data.name,
                    code=institute_data.code,
                    address=institute_data.address,
                    contact_email=institute_data.contact_email,
                    contact_phone=institute_data.contact_phone,
                    is_approved=institute_data.is_approved,
                )
                db.add(new_institute)
                await db.flush()

                
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

            
            
            await db.refresh(new_institute)
            return new_institute
                
        except IntegrityError: 
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this username or email may already exist.")
        except SQLAlchemyError:
            await db.rollback()
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