from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError,IntegrityError
from fastapi import HTTPException, status
from Database import db
from Models.institute_models import Institute
from typing import List
from Schemas.institute_schema import InstituteCreateSchema,InstituteResponseSchema
from Models.user_models import User
from Models.department_models import Department
from Services.email_service import send_email
import asyncio
from functools import reduce
from operator import or_


class InstituteService:
    @staticmethod
    async def create_institute_service(institute_data: InstituteCreateSchema, db: AsyncSession) -> Institute:
        """
        Creates a new institute and its admin user, then sends a welcome email.
        The database transaction is decoupled from the email sending.
        """
        # --- 1. Perform checks BEFORE the transaction (this is good) ---
        existing_institute_stmt = select(Institute).filter(
            (Institute.code == institute_data.code) | (Institute.name == institute_data.name)
        )
        if (await db.execute(existing_institute_stmt)).scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Institute with this code or name already exists")
        
        existing_user_stmt = select(User).filter(User.email == institute_data.admin_email)
        if (await db.execute(existing_user_stmt)).scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An admin with this email already exists")

        new_institute = None
        try:
            # --- 2. The database transaction now ONLY handles database operations ---
            async with db.begin_nested():  # main transaction
                new_institute = Institute(
                    name=institute_data.name,
                    code=institute_data.code,
                    address=institute_data.address,
                    contact_email=institute_data.contact_email,
                    contact_phone=institute_data.contact_phone,
                    is_approved=institute_data.is_approved
                )
                db.add(new_institute)
                await db.flush()  # gives new_institute.id

                new_department = Department(
                    name="Administration",
                    code="ADMIN",
                    institute_id=new_institute.id,
                    description="Default admin department"
                )
                db.add(new_department)
                await db.flush()  # gives new_department.id

                admin_user = User(
                    full_name=institute_data.admin_name,
                    email=institute_data.admin_email,
                    phone=institute_data.admin_phone,
                    institute_id=new_institute.id,
                    department_id=new_department.id,
                    role='ADMIN',
                    username=f"{institute_data.code}_admin"
                )
                admin_user.set_password("admin123")
                db.add(admin_user)

            # The transaction commits here. The institute and user are now safely in the DB.
            await db.commit()
            await db.refresh(new_institute)

        except IntegrityError as e: 
            print("Integrity Error:", e)
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this username or email may already exist.")
        except SQLAlchemyError as e:
            print("SQLAlchemy Error:", e)
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create institute due to a database error.")
        
        
        # --- 3. Send the email AFTER the transaction is successfully committed ---
        try:
            welcome_context = {
                "admin_full_name": institute_data.admin_name,
                "institute_name": institute_data.name,
                "admin_email": institute_data.admin_email,
                "temporary_password": "admin123", # ⚠️ Security Warning
                "login_url": "http://localhost:5173/login"
            }
            
            # --- 4. Run the blocking email function in a separate thread ---
            email_sent = await asyncio.to_thread(
                send_email,
                institute_data.admin_email,
                "Welcome to the Platform!",
                "welcome_institute.html", # Assuming this is the template name
                welcome_context
            )

            if not email_sent:
                # The user was created, but the email failed. Log this for a retry later.
                print(f"CRITICAL: Failed to send welcome email to {institute_data.admin_email}")

        except Exception as e:
            # Log the email sending error
            print(f"CRITICAL: An exception occurred while sending email to {institute_data.admin_email}: {e}")

        # --- 5. Always return the created institute, regardless of email status ---
        print("Hello", new_institute)
        return new_institute

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
        
    @staticmethod
    async def update_institute_service(institute_id: int, institute_data: dict, db: AsyncSession) -> Institute:
        """
        Updates an existing institute. 
        Expects 'institute_data' to be a dictionary (e.g., schema.model_dump(exclude_unset=True)).
        """
        try:
            # 1. Fetch current institute
            stmt = select(Institute).filter(Institute.id == institute_id)
            result = await db.execute(stmt)
            institute = result.scalars().first()
            if not institute:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institute not found")

            # 2. Pre-transaction uniqueness checks (Institute Code & Name)
            # We only check if these specific fields are being updated
            new_code = institute_data.get("code")
            new_name = institute_data.get("name")

            or_parts = []
            if new_code is not None and new_code != institute.code:
                or_parts.append(Institute.code == new_code)
            if new_name is not None and new_name != institute.name:
                or_parts.append(Institute.name == new_name)

            if or_parts:
                # Check if ANY other institute (not the current one) has this name or code
                conflict_filter = (Institute.id != institute_id) & reduce(or_, or_parts)
                conflict_stmt = select(Institute).filter(conflict_filter)
                if (await db.execute(conflict_stmt)).scalars().first():
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT, # 409 is better for duplicates
                        detail="Another institute with this code or name already exists"
                    )

            # 3. Apply updates dynamically
            # This replaces the long list of 'if' statements
            allowed_fields = {"name", "code", "address", "contact_email", "contact_phone", "is_approved"}
            
            for key, value in institute_data.items():
                if key in allowed_fields and hasattr(institute, key):
                    setattr(institute, key, value)

            # 4. Commit and Refresh
            await db.commit()
            await db.refresh(institute)
            return institute

        except HTTPException:
            # Re-raise HTTP exceptions so they aren't caught by the generic block below
            raise 
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Update failed due to database integrity constraints.")
        except SQLAlchemyError as e:
            await db.rollback()
            # Log 'e' here in production
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update institute due to a database error.")
        

    