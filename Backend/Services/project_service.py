import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError

from Models.project_models import Project

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
    

    