from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from Models.user_models import User
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

load_dotenv()


class UserService:

    @staticmethod
    async def login_user_service(email: str, password: str, db: AsyncSession) -> dict:
        if not email or not password:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password are required")

        try:
            result = await db.execute(select(User).filter(User.email == email))
            user = result.scalars().first()

            if not user or not user.check_password(password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

            expire = datetime.now(timezone.utc) + timedelta(days=1)
            to_encode = {"sub": str(user.id), "role": user.role.value, "exp": expire}
            
            secret_key = os.getenv('SECRET_KEY')
            algorithm = os.getenv('ALGORITHM')
            if not secret_key or not algorithm:
                raise ValueError("Server configuration error: SECRET_KEY and ALGORITHM must be set")
                
            token = jwt.encode(to_encode, secret_key, algorithm=algorithm)
            
            user.last_login = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(user)
            
            return {"access_token": token, "token_type": "bearer", "user": user}
        
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error during login")
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    @staticmethod
    async def create_user_service(user_data: dict, db: AsyncSession) -> User:
        result = await db.execute(select(User).filter((User.email == user_data['email']) | (User.username == user_data['username'])))
        if result.scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email or username already exists")

        try:
            plaintext_password = user_data.pop('password')
            new_user = User(**user_data)
            new_user.set_password(plaintext_password)

            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            return new_user
            
        except SQLAlchemyError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user")