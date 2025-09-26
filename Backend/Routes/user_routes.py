from fastapi import APIRouter, Depends, Request,Response
from sqlalchemy.ext.asyncio import AsyncSession
from Services.user_service import UserService
from Schemas.user_schema import LoginSchema, RegisterSchema, UserResponse
from Database.db import get_db

router = APIRouter(prefix="/user", tags=["user"])

@router.post("/login")
async def login(data: LoginSchema, response: Response, db: AsyncSession = Depends(get_db)):
    print(data)
    result= await UserService.login_user_service(data, db)
    response.set_cookie(
        key="token",
        value=result["access_token"],
        httponly=True,   
        secure=False,     
        samesite="lax",
        max_age=86400 )
    return result


@router.post("/register", response_model=UserResponse)
async def register(user_data: RegisterSchema, db: AsyncSession = Depends(get_db)):
    return await UserService.create_user_service(user_data.model_dump(), db)

@router.get("/logout")
async def logout(response: Response, request: Request):
    return await UserService.logout_user_service(response=response, request=request)


@router.get("/all", response_model=list[UserResponse])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    return await UserService.get_all_users_service(db)