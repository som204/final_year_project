from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends,UploadFile,File,Form
from Database.db import get_db
from typing import List
import os
from Schemas.dataUpload_schema import DataUploadBase
from Services.dataUpload_service import DataUploadService

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.post("/", response_model=List[DataUploadBase])
async def create_new_uploads(description: str = Form(...),faculty_id: int = Form(...),department_id: int = Form(...),institute_id: int = Form(...),files: List[UploadFile] = File(...),project_id: int = Form(...), db: AsyncSession = Depends(get_db)):
    upload_data = DataUploadBase(
        name="placeholder",
        description=description,
        faculty_id=faculty_id,
        department_id=department_id,
        institute_id=institute_id,
        file_path="placeholder",
        project_id=project_id
    )

    return await DataUploadService.create_uploads(
        db=db,
        upload_data=upload_data,
        files=files
    )


@router.get("/{user_id}", response_model=List[DataUploadBase])
async def get_uploads_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    return await DataUploadService.getFiles_by_Userid(db=db, user_id=user_id)

@router.get("/projects/{project_id}",response_model=List[DataUploadBase])
async def get_uploads_by_Projectid(project_id:int ,db: AsyncSession = Depends(get_db)):
    return await DataUploadService.getFiles_by_Project_id(db,project_id)


@router.get("/institute/{institute_id}",response_model=List[DataUploadBase])
async def get_uploads_by_Instituteid(institute_id:int ,db: AsyncSession = Depends(get_db)):
    return await DataUploadService.getFiles_by_institute_id(db,institute_id)
   

@router.delete("/{upload_id}", status_code=204)
async def delete_upload(upload_id: int, db: AsyncSession = Depends(get_db)):
    await DataUploadService.delete_file(db=db, file_id=upload_id)
    return {"detail": "Upload deleted successfully"}