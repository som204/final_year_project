from fastapi import  HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from Models.report_models import Report
from Models.project_models import Project
from Models.institute_models import Institute
from Models.dataUpload_models import DataUploaded
from Schemas.report_schema import GenerateReportRequest
from Services.ai_service import generate_report
import os
import json
from datetime import datetime


class ReportService:
    @staticmethod
    async def create_report(report_request: GenerateReportRequest, db: AsyncSession) -> dict:
        """Creates a new report in the database."""
        try:
                stmt = select(
                DataUploaded.file_path,
                DataUploaded.institute_id,
                DataUploaded.project_id
            ).filter(DataUploaded.id.in_(report_request.source_file_ids))
                result = await db.execute(stmt)
                rows = result.all()

                if not rows or len(rows) != len(report_request.source_file_ids):
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Could not find all source files for the given IDs."
                    )

                file_paths = [row.file_path for row in rows]
                institute_id = rows[0].institute_id
                project_id = rows[0].project_id

            # 2. Invoke the AI agent with the list of retrieved file paths
                print(f"🚀 Invoking AI agent with {len(file_paths)} file(s)...")

                report_data = generate_report(
                    file_paths=file_paths,
                    institute_id=institute_id,
                    project_id=project_id,
                    user_role="admin",
                    report_year="2022-2023",
                    output_format="html",
                    language="en",
                    report_name = report_request.report_name,
                    report_desc= report_request.report_desc
                )

                if not report_data:
                    raise HTTPException(status_code=500, detail="AI agent failed to generate report data.")

                os.makedirs("generated_data", exist_ok=True)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"generated_data/report_{project_id}_{institute_id}_{timestamp}.json"
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(report_data, f, ensure_ascii=False, indent=2)
                print(f"-> 💾 Saved local copy: {filename}")

                new_report = Report(
                    file_name=report_request.report_name,
                    file_path=filename,
                    description= report_request.report_desc,
                    project_id=project_id
                )
                db.add(new_report)
                await db.commit()
                await db.refresh(new_report)
                return report_data
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

    @staticmethod
    async def delete_report(report_id: int, db: AsyncSession) -> bool:
        """Deletes a report by its ID. Returns True if deleted, raises if not found or on DB error."""
        try:
            report = await db.get(Report, report_id)
            if not report:
                raise Exception(f"Report with id {report_id} not found.")
            await db.delete(report)
            await db.commit()
            return True
        except SQLAlchemyError as e:
            await db.rollback()
            raise Exception("Could not delete report due to a database error.") from e
        
    @staticmethod
    async def get_report_by_id(report_id: int, db: AsyncSession) -> dict:
        """Fetches a report by its ID."""
        try:
            report = await db.get(Report, report_id)
            if not report:
                raise Exception(f"Report with id {report_id} not found.")
            
            filename= report.file_path
            print(f"-> 📄 Reading report file: {filename}")
            with open(filename, "r", encoding="utf-8") as f:
                result= json.load(f)
            # print(result)
            return result 
        except Exception as e:
            print(e)
            raise Exception("Could not fetch report due to an error.") from e