import asyncio
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError

from Models.project_models import Project
from Services.dataUpload_service import DataUploadService
from Models.dataUpload_models import DataUploaded
from fastapi import status
import os

class ProjectService:

    @staticmethod
    async def create_project(project_data: dict, db: AsyncSession) -> Project:
        """Creates a new project in the database."""
        try:
            new_project = Project(**project_data)
            db.add(new_project)
            await db.commit()
            await db.refresh(new_project)
            return new_project
        except SQLAlchemyError as e:
            await db.rollback()
            raise Exception("Could not create project due to a database error.") from e

    @staticmethod
    async def get_all_projects(db: AsyncSession) -> list[Project]:
        """Fetches all projects from the database."""
        result = await db.execute(select(Project))
        return list(result.scalars().all())

    @staticmethod
    async def get_projects_by_institute_id(institute_id: int, db: AsyncSession) -> list[Project]:
        """Fetches projects associated with a specific institute ID."""
        result = await db.execute(select(Project).filter(Project.institute_id == institute_id))
        return list(result.scalars().all())
    
    @staticmethod
    async def delete_project(project_id: int, db: AsyncSession) -> None:
        """Deletes a project and all its uploaded files from the database and filesystem."""
        try:
            # load project
            result = await db.execute(select(Project).filter(Project.id == project_id))
            project = result.scalars().first()
            if not project:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

            # load associated uploaded files
            result_files = await db.execute(select(DataUploaded).filter(DataUploaded.project_id == project_id))
            files = result_files.scalars().all()

            # remove files from filesystem and database
            for f in files:
                file_path = getattr(f, "file_path", None)
                try:
                    if file_path and os.path.exists(file_path):
                        os.remove(file_path)
                except OSError:
                    
                    pass
                await db.delete(f)

            # delete the project itself
            await db.delete(project)
            await db.commit()
            return None
        
        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while deleting project."
            ) from e
        except Exception as e:
            # catch-all for unexpected errors
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @staticmethod
    async def update_project(project_id: int, update_data: dict, db: AsyncSession) -> Project:
        """Updates fields of an existing project and returns the updated project."""
        try:
            result = await db.execute(select(Project).filter(Project.id == project_id))
            project = result.scalars().first()
            if not project:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

            # Filter out keys that shouldn't be updated and ensure attribute exists
            safe_updates = {
                k: v for k, v in update_data.items()
                if k != "id" and hasattr(project, k)
            }

            if not safe_updates:
                # Nothing to update; return current project
                return project

            for key, value in safe_updates.items():
                setattr(project, key, value)

            db.add(project)
            await db.commit()
            await db.refresh(project)
            return project

        except SQLAlchemyError as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while updating project."
            ) from e
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    