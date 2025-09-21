from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from Models.user_models import User
import jwt
from datetime import datetime, timedelta, timezone
import os
import dotenv
from Schemas.user_schema import UserResponse, LoginSchema
from Services.redis_service import RedisService
from fastapi import Response,Request
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
            
            return new_user
            
        except SQLAlchemyError as e:
            await db.rollback()
            # In production, you might want to log the actual error `e`
            print("Hello", e)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user due to a database error.")

    @staticmethod
    async def login_user_service(data: LoginSchema, db: AsyncSession) -> dict:
        """Logs in a user and returns a JWT token."""
        try:
            result = await db.execute(select(User).filter(User.email == data.email))
            user = result.scalars().first()

            if not user or not user.check_password(data.password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

            # Create JWT token
            expire = datetime.now(timezone.utc) + timedelta(days=1)
            to_encode = {"sub": str(user.id), "role": user.role.value, "exp": expire}
            
            secret_key = os.getenv('SECRET_KEY')
            algorithm = os.getenv('ALGORITHM')
            
            if not secret_key or not algorithm:
                raise ValueError("Server configuration error: JWT secrets are not set.")
                
            token = jwt.encode(to_encode, secret_key, algorithm=algorithm)
            
            # Update last_login timestamp
            user.last_login = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(user)

            return {"access_token": token, "token_type": "bearer", "user": UserResponse.model_validate(user)}

        except SQLAlchemyError as e:
            print("Database error:", e)
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error during login")
        except ValueError as e:
            # Catches the JWT secret configuration error
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        



    @staticmethod
    async def logout_user_service(response: Response, request: Request) -> dict:
        """Logs out a user by invalidating their token (if token blacklisting is implemented)."""
        try:
            token = request.cookies.get("token")
            if not token:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No token provided")
            
            # Here you would typically add the token to a blacklist
            # For simplicity, we'll just delete the cookie
            client= RedisService.get_client()
            await RedisService.set_value(name=token, value="blacklisted", ex=86400)  # Blacklist for 1 day
            response.delete_cookie(key="token")
            return {"message": "Successfully logged out"}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error during logout")

        