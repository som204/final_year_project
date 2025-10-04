from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from Models.report_models import Report
from Models.project_models import Project
from Models.institute_models import Institute


class ReportService:
    @staticmethod
    async def create_report(report_data: dict, db: AsyncSession) -> Report:
        """Creates a new report in the database."""
        try:
            new_report = Report(**report_data)
            db.add(new_report)
            await db.commit()
            await db.refresh(new_report)
            return new_report
        except SQLAlchemyError as e:
            await db.rollback()
            raise Exception("Could not create report due to a database error.") from e

    @staticmethod
    async def get_all_reports(db: AsyncSession) -> list[Report]:
        """Fetches all reports from the database."""
        result = await db.execute(select(Report))
        return list(result.scalars().all())

    @staticmethod
    async def get_reports_by_project_id(project_id: int, db: AsyncSession) -> list[Report]:
        """Fetches reports associated with a specific project ID."""
        result = await db.execute(select(Report).filter(Report.project_id == project_id))
        return list(result.scalars().all())

    @staticmethod
    async def get_report_by_institute_id(institute_id: int, db: AsyncSession) -> list[Report]:
        """Fetches reports associated with a specific institute ID."""
        result = await db.execute(
            select(Report)
            .join(Project, Report.project_id == Project.id)
            .join(Institute, Project.institute_id == Institute.id)
            .filter(Institute.id == institute_id)
        )
        return list(result.scalars().all())