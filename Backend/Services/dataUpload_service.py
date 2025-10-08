import os
import shutil
from typing import List
from uuid import uuid4

from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from Schemas.dataUpload_schema import DataUploadBase
from Models.dataUpload_models import DataUploaded
from Models.project_models import Project
from sqlalchemy.orm import joinedload

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
                    institute_id=upload_data.institute_id,
                    project_id=upload_data.project_id
                )
                new_uploads.append(db_upload)

            db.add_all(new_uploads)
            await db.commit()

            for upload in new_uploads:
                await db.refresh(upload)
            
            return new_uploads

        except SQLAlchemyError as e:
            print(e)
            await db.rollback()
            for file_info in saved_files_info:
                if os.path.exists(file_info["path"]):
                    os.remove(file_info["path"])
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=f"Database error: {e}"
            )
        
        

    @staticmethod
    async def getFiles_by_Userid(db: AsyncSession, user_id: int) -> List[DataUploadBase]:
        try:
            # 2. Your query is already efficient and correct, no changes needed here
            stmt = (
                select(DataUploaded)
                .options(joinedload(DataUploaded.project))
                .filter(DataUploaded.faculty_id == user_id)
            )
            result = await db.execute(stmt)
            uploads = result.scalars().all()

            # 3. Transform the SQLAlchemy objects into Pydantic response models
            response_data = []
            for upload in uploads:
                # Create the response object from the SQLAlchemy model
                upload_response = DataUploadBase.model_validate(upload)
                # Manually add the project name from the joined relationship
                if upload.project:
                    upload_response.project_name = upload.project.name
                response_data.append(upload_response)
            
            return response_data

        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {e}"
            )

    @staticmethod
    async def getFiles_by_Project_id(db:AsyncSession,project_id:int) -> List[DataUploadBase]:
        try:
            stmt= select(DataUploaded).options(joinedload(DataUploaded.department),joinedload(DataUploaded.faculty)).filter(DataUploaded.project_id==project_id)
            result=await db.execute(stmt)
            uploads=result.scalars().all()
            response_data = []
            for upload in uploads:
                upload_response = DataUploadBase.model_validate(upload)
                if upload.department:
                    upload_response.department_name=upload.department.name
                    
                if upload.faculty:
                    upload_response.faculty_name=upload.faculty.full_name
                    
                response_data.append(upload_response)

            return response_data
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {e}"
            )
                


    @staticmethod
    async def getFiles_by_institute_id(db:AsyncSession,institute_id:int) -> List[DataUploadBase]:
        try:
            stmt= select(DataUploaded).options(joinedload(DataUploaded.department),joinedload(DataUploaded.faculty),joinedload(DataUploaded.project)).filter(DataUploaded.institute_id==institute_id)
            result=await db.execute(stmt)
            uploads=result.scalars().all()
            response_data = []
            for upload in uploads:
                upload_response = DataUploadBase.model_validate(upload)
                if upload.department:
                    upload_response.department_name=upload.department.name
                    
                if upload.faculty:
                    upload_response.faculty_name=upload.faculty.full_name
                if upload.project:
                    upload_response.project_name=upload.project.name
                    
                response_data.append(upload_response)

            return response_data
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {e}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error: {e}"
            )
        
    @staticmethod
    async def delete_file(db:AsyncSession,file_id:int):
        try:
            stmt=select(DataUploaded).filter(DataUploaded.id==file_id)
            result=await db.execute(stmt)
            file=result.scalar_one_or_none()
            if not file:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="File not found")
            file_path=file.file_path
            await db.delete(file)
            await db.commit()
            if os.path.exists(file_path):
                os.remove(file_path)
            return {"detail":"File deleted successfully"}
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {e}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error: {e}"
            )