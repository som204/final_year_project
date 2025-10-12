import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from Models.user_models import User
from Models.department_models import Department
import jwt
from datetime import datetime, timedelta, timezone
import os
import dotenv
from Schemas.user_schema import UserResponse, LoginSchema
from Services.redis_service import RedisService
from fastapi import Response,Request
from sqlalchemy.orm import joinedload
from Services.email_service import send_email
from Models.institute_models import Institute
dotenv.load_dotenv()

class UserService:

    @staticmethod
    async def create_user_service(user_data: dict, db: AsyncSession) -> User:
        """Creates a new user in the database."""
        # Check if user already exists
        result = await db.execute(select(User).filter(
            (User.email == user_data['email']) | (User.username == user_data['username'])
        ))
        if result.scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email or username already exists")

        try:
            # Separate password and hash it before creating the User model instance
            plaintext_password = user_data.pop('password')
            new_user = User(**user_data)
            new_user.set_password(plaintext_password)

            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)

        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user due to a database error.")
        if(new_user.role != "STUDENT" and new_user.role != "VIEWER"):
            try:
            # Query to find the institute name from the institute id
                institute_name = None
                if new_user.institute_id:
                    select_institute = select(Institute).filter(Institute.id == new_user.institute_id)
                    result = await db.execute(select_institute)
                    institute = result.scalars().first()
                    if institute:
                        institute_name = institute.name
                print("Institute Name:", institute_name)
                welcome_context = {
                    "faculty_full_name": new_user.full_name,
                    "institute_name": institute_name,
                    "faculty_email": new_user.email,
                    "temporary_password": plaintext_password,
                    "login_url": "http://localhost:5173/login"
                }
                
                # --- 4. Run the blocking email function in a separate thread ---
                email_sent = await asyncio.to_thread(
                    send_email,
                    new_user.email,
                    "Welcome to the Platform!",
                    "welcome_faculty.html", # Assuming this is the template name
                    welcome_context
                )
                print("Email sent status:", email_sent)
                if not email_sent:
                    # The user was created, but the email failed. Log this for a retry later.
                    print(f"CRITICAL: Failed to send welcome email to {new_user.email}")

            except Exception as e:
                # Log the email sending error
                print(f"CRITICAL: An exception occurred while sending email to {new_user.email}: {e}")

        return new_user


    @staticmethod
    async def login_user_service(data: LoginSchema, db: AsyncSession) -> dict:
        """Logs in a user and returns a JWT, efficiently loading related data."""
        try:
            stmt = (
                select(User)
                .options(
                    joinedload(User.department)
                    .joinedload(Department.institute)
                )
                .filter(User.email == data.email)
            )
            result = await db.execute(stmt)
            user = result.scalars().first()

            if not user or not user.check_password(data.password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
            
            dept_name = user.department.name if user.department else None
            institute_name = user.department.institute.name if user.department and user.department.institute else None
            expire = datetime.now(timezone.utc) + timedelta(days=1)
            to_encode = {"sub": str(user.id), "role": user.role.value, "exp": expire}
            
            secret_key = os.getenv('SECRET_KEY')
            algorithm = os.getenv('ALGORITHM')
            if not secret_key or not algorithm:
                raise ValueError("Server configuration error: JWT secrets are not set.")
                
            token = jwt.encode(to_encode, secret_key, algorithm=algorithm)
            
            user.last_login = datetime.now(timezone.utc)
            await db.commit()
            # print(user)
            user_response = UserResponse.model_validate(user)
            user_response_dict = user_response.model_dump()
            user_response_dict["dept_name"] = dept_name
            user_response_dict["institute_name"] = institute_name

            return {"access_token": token, "user": user_response_dict}

        except SQLAlchemyError as e:
            print(e)
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error during login")
        except ValueError as e:
            print(e)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
            



    @staticmethod
    async def logout_user_service(response: Response, request: Request) -> dict:
        """Logs out a user by invalidating their token (if token blacklisting is implemented)."""
        try:
            token = request.cookies.get("token")
            if not token:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No token provided")
            client = RedisService.get_client()
            await RedisService.set_value(name=token, value="blacklisted", ex=86400)  # Blacklist for 1 day
            response.delete_cookie(key="token")
            return {"message": "Successfully logged out"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error during logout")  



    @staticmethod
    async def get_all_users_service(db: AsyncSession) -> list[UserResponse]:
        """Fetches all users from the database."""
        try:
            result = await db.execute(select(User).options(joinedload(User.institute)))
            users = result.scalars().all()
            result=[]
            for user in users:
                user_data = UserResponse.model_validate(user)
                user_dict = user_data.model_dump()
                user_dict["institute_name"] = user.institute.name if user.institute else None
                result.append(user_dict)
            return result
        except SQLAlchemyError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not fetch users due to a database error.")      

    @staticmethod
    async def get_user_by_institute_id(institute_id: int, db: AsyncSession) -> list[User]:
        """Fetches all users from the database by institute id."""
        try:
            result = await db.execute(select(User).filter(User.institute_id == institute_id))
            users = result.scalars().all()
            return list(users)
        except SQLAlchemyError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not fetch users due to a database error.")
        


    @staticmethod
    async def delete_user_service(user_id: int, db: AsyncSession) -> dict:
        """Deletes a user from the database."""
        try:
            result = await db.execute(select(User).filter(User.id == user_id))
            user = result.scalars().first()
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
            await db.delete(user)
            await db.commit()
            return {"message": "User deleted successfully"}
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete user due to a database error.")