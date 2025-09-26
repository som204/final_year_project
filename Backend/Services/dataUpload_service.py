import os
import shutil
from typing import List
from uuid import uuid4

from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from Schemas.dataUpload_schema import DataUploadBase
from Models.dataUpload_models import DataUploaded

from sqlalchemy.future import select

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class DataUploadService:

    @staticmethod
    async def create_uploads(db: AsyncSession, upload_data: DataUploadBase, files: List[UploadFile]) -> List[DataUploaded]:
        new_uploads = []
        saved_files_info = []

        for file in files:
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
            unique_filename = f"{uuid4()}{file_extension}"
            file_location = os.path.join(UPLOAD_DIR, unique_filename)
            
            try:
                with open(file_location, "wb") as f:
                    shutil.copyfileobj(file.file, f)
                saved_files_info.append({
                    "path": file_location,
                    "original_name": file.filename
                })
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Could not save file: {file.filename}. Error: {e}"
                )
        
        try:
            for file_info in saved_files_info:
                db_upload = DataUploaded(
                    name=file_info["original_name"],
                    description=upload_data.description,
                    file_path=file_info["path"],
                    faculty_id=upload_data.faculty_id,
                    department_id=upload_data.department_id,
                    institute_id=upload_data.institute_id
                )
                new_uploads.append(db_upload)

            db.add_all(new_uploads)
            await db.commit()

            for upload in new_uploads:
                await db.refresh(upload)
            
            return new_uploads

        except SQLAlchemyError as e:
            await db.rollback()
            for file_info in saved_files_info:
                if os.path.exists(file_info["path"]):
                    os.remove(file_info["path"])
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=f"Database error: {e}"
            )
        

    @staticmethod
    async def getFiles_by_Userid(db: AsyncSession, user_id: int) -> List[DataUploaded]:
        try:
            result = await db.execute(select(DataUploaded).filter(DataUploaded.faculty_id == user_id))
            return list(result.scalars().all())
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {e}"
            )