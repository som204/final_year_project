from Services.institute_service import InstituteService
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from Database.db import get_db
from Schemas.institute_schema import InstituteCreateSchema as InstituteCreate, InstituteResponseSchema as InstituteResponse


router = APIRouter(prefix="/institute", tags=["institute"])
@router.post("/create", response_model=InstituteResponse)
async def create_institute(institute_data: InstituteCreate, db: AsyncSession = Depends(get_db)):
    print("Received institute data:", institute_data)
    return await InstituteService.create_institute_service(institute_data, db)

@router.get("/all", response_model=list[InstituteResponse])
async def get_all_institutes(db: AsyncSession = Depends(get_db)):
    return await InstituteService.get_all_institutes_service(db)