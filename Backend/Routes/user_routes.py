from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from Services.user_service import UserService
from Schemas.user_schema import LoginSchema, RegisterSchema,UserResponse
from Database.db import get_db

router = APIRouter(prefix="/user", tags=["user"])

@router.post("/login")
async def login(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    return await UserService.login_user_service(data.email, data.password, db)

@router.post("/register",response_model=RegisterSchema)
async def register(user_data: RegisterSchema, db: AsyncSession = Depends(get_db)):
    return await UserService.create_user_service(user_data.model_dump(), db)