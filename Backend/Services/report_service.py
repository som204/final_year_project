from unittest import result
from fastapi import  HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from Models.comment_models import ReportComment
from Models.department_models import Department
from Models.report_models import Report
from Models.project_models import Project
from Models.institute_models import Institute
from Models.dataUpload_models import DataUploaded
from Models.user_models import User
from Schemas.report_schema import GenerateReportRequest
from Services.ai_service import generate_report
import os
import json
from datetime import datetime
from fastapi.responses import StreamingResponse
import subprocess
from pathlib import Path
from sqlalchemy.orm import selectinload
from Schemas.report_visibility_schema import ShareLevel


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
                    report_desc= report_request.report_desc,
                    report_template= report_request.report_template
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
        .options(
            selectinload(Report.comments)
            .selectinload(ReportComment.user)
            .load_only(
                User.id,
                User.full_name,
                User.department_id
            )
            .selectinload(User.department)
            .load_only(
                Department.id,
                Department.name
            )
        )
        .join(Project, Report.project_id == Project.id)
        .join(Institute, Project.institute_id == Institute.id)
        .filter(Institute.id == institute_id)
    )

        return list(result.scalars().unique().all())

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

    @staticmethod
    async def update_report(report_id: int, updated_data: dict, db: AsyncSession) -> Report:
        """Updates a report's metadata (not file content)"""
        try:
            report = await db.get(Report, report_id)
            if not report:
                raise Exception(f"Report with id {report_id} not found.")
            filename= report.file_path

            with open(filename, "w", encoding="utf-8") as f:
                f.write(json.dumps(updated_data, indent=4))
            
            
            return report
        except SQLAlchemyError as e:
            await db.rollback()
            raise Exception("Could not update report due to a database error.") from e
        

    @staticmethod
    async def add_report_comment(report_id: int, user_id: int, comment_text: str, db: AsyncSession) -> ReportComment:
        """Adds a comment to a report."""
        try:
            report = await db.get(Report, report_id)
            if not report:
                raise Exception(f"Report with id {report_id} not found.")
            
            new_comment = ReportComment(
                report_id=report_id,
                user_id=user_id,
                comment=comment_text
            )
            db.add(new_comment)
            await db.commit()
            await db.refresh(new_comment)
            return new_comment
        except SQLAlchemyError as e:
            print(e)
            await db.rollback()
            raise Exception("Could not add comment due to a database error.") from e

    @staticmethod
    async def share_report(report_id: int,share_level: ShareLevel,db: AsyncSession) -> Report:
        report = await db.get(Report, report_id)
        if not report:
            raise Exception("Report not found")
        report.share = share_level
        await db.commit()
        await db.refresh(report)
        return report
    
    @staticmethod
    async def send_report_template(template_id: int, db: AsyncSession) -> str:
        template_path = f"Templates/report_template_{template_id}.html"
        if not os.path.exists(template_path):
            raise Exception(f"Template with id {template_id} not found.")
        with open(template_path, "r", encoding="utf-8") as f:
            template_content = f.read()
        return template_content

    # @staticmethod
    # async def test_latex_compilation(report_id: int, db: AsyncSession) -> StreamingResponse:
    #     """Test LaTeX compilation with enhanced error handling and debugging"""
    #     temp_dir = None

    #     try:
    #         print("=" * 80)
    #         print("🧪 LATEX COMPILATION TEST STARTED")
    #         print("=" * 80)
            
    #         # Check pdflatex availability
    #         pdflatex_cmd = shutil.which("pdflatex")
    #         print(f"✓ pdflatex found at: {pdflatex_cmd}")
            
    #         # Fetch report from database
    #         print(f"\n📊 Fetching report ID: {report_id}")
    #         report = await db.get(Report, report_id)
    #         if not report:
    #             raise HTTPException(
    #                 status_code=status.HTTP_404_NOT_FOUND,
    #                 detail=f"Report with id {report_id} not found."
    #             )
            
    #         filename = report.file_path
    #         print(f"✓ Report file path: {filename}")
            
    #         # Load report data
    #         print(f"\n📄 Reading report JSON...")
    #         if not os.path.exists(filename):
    #             raise HTTPException(
    #                 status_code=status.HTTP_404_NOT_FOUND,
    #                 detail=f"Report file not found: {filename}"
    #             )
                
    #         with open(filename, "r", encoding="utf-8") as f:
    #             result = json.load(f)
            
    #         # Extract LaTeX content
    #         demo_latex_content = result.get("latex_report")
    #         if not demo_latex_content:
    #             raise HTTPException(
    #                 status_code=status.HTTP_400_BAD_REQUEST,
    #                 detail="No 'latex_report' field found in report JSON"
    #             )
            
    #         print(f"✓ LaTeX content length: {len(demo_latex_content):,} characters")

    #         # Create unique temporary directory
    #         timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    #         temp_dir = Path(f"latex_temp_{timestamp}")
    #         temp_dir.mkdir(parents=True, exist_ok=True)
    #         print(f"✓ Created temp directory: {temp_dir}")

    #         # File paths
    #         tex_file = temp_dir / "report.tex"
    #         pdf_file = temp_dir / "report.pdf"
    #         log_file = temp_dir / "report.log"

    #         # Write LaTeX content
    #         print(f"\n📝 Writing LaTeX file: {tex_file}")
    #         with open(tex_file, "w", encoding="utf-8") as f:
    #             f.write(demo_latex_content)
    #         print(f"✓ File size: {tex_file.stat().st_size:,} bytes")

    #         # Validate pdflatex
    #         if not pdflatex_cmd:
    #             raise HTTPException(
    #                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #                 detail="pdflatex not found. Please install MiKTeX or TeX Live."
    #             )

    #         print(f"\n🔨 STARTING PDF COMPILATION")
    #         print("-" * 80)

    #         # Compile LaTeX to PDF (run twice for references)
    #         for run_number in range(1, 3):
    #             print(f"\n▶ Compilation Run {run_number}/2")
                
    #             result = subprocess.run(
    #                 [
    #                     pdflatex_cmd,
    #                     "-interaction=nonstopmode",  # Don't stop on errors
    #                     "-halt-on-error",             # But do halt on critical errors
    #                     "-file-line-error",           # Better error messages
    #                     "report.tex"                  # Just filename, not path
    #                 ],
    #                 cwd=str(temp_dir),                # Set working directory
    #                 capture_output=True,
    #                 text=True,
    #                 timeout=90,                       # Increased timeout
    #                 encoding='utf-8',
    #                 errors='replace'                  # Handle encoding errors
    #             )

    #             # Print abbreviated output
    #             if result.stdout:
    #                 stdout_lines = result.stdout.split('\n')
    #                 print(f"  Output lines: {len(stdout_lines)}")
    #                 # Show last 10 lines for progress
    #                 for line in stdout_lines[-10:]:
    #                     if line.strip():
    #                         print(f"  {line[:100]}")  # Truncate long lines
                
    #             if result.stderr:
    #                 print(f"  STDERR: {result.stderr[:500]}")

    #             # Check for errors (only fatal on second run)
    #             if result.returncode != 0:
    #                 print(f"  ⚠ Return code: {result.returncode}")
                    
    #                 # Read log file for detailed errors
    #                 error_details = "LaTeX compilation failed."
    #                 if log_file.exists():
    #                     try:
    #                         with open(log_file, "r", encoding="utf-8", errors="ignore") as log:
    #                             log_content = log.read()
                                
    #                             # Extract key error lines
    #                             error_lines = []
    #                             for line in log_content.split("\n"):
    #                                 if any(keyword in line for keyword in ["!", "Error", "Fatal", "Missing"]):
    #                                     error_lines.append(line.strip())
    #                                     if len(error_lines) >= 10:  # Get up to 10 error lines
    #                                         break
                                
    #                             if error_lines:
    #                                 error_details = "\n".join(error_lines[:5])  # Show first 5
    #                                 print(f"\n  📋 Error Log Extract:")
    #                                 for err_line in error_lines[:10]:
    #                                     print(f"    {err_line}")
    #                     except Exception as log_error:
    #                         print(f"  ⚠ Could not read log: {log_error}")

    #                 # Only fail on second run
    #                 if run_number == 2:
    #                     print(f"\n❌ COMPILATION FAILED ON RUN 2")
                        
    #                     # Save log file for debugging
    #                     debug_log_path = temp_dir / "debug_full.log"
    #                     if log_file.exists():
    #                         shutil.copy(log_file, debug_log_path)
    #                         print(f"  💾 Full log saved to: {debug_log_path}")
                        
    #                     raise HTTPException(
    #                         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #                         detail=f"LaTeX compilation failed:\n{error_details}"
    #                     )
    #                 else:
    #                     print(f"  ⚠ Run 1 had errors, continuing to run 2...")
    #             else:
    #                 print(f"  ✓ Run {run_number} completed successfully")

    #         print("\n" + "=" * 80)
    #         print("📄 CHECKING OUTPUT")
    #         print("=" * 80)

    #         # Verify PDF was created
    #         if not pdf_file.exists():
    #             # List all files in temp directory
    #             print(f"❌ PDF not found. Directory contents:")
    #             for item in temp_dir.iterdir():
    #                 print(f"  - {item.name} ({item.stat().st_size:,} bytes)")
                
    #             raise HTTPException(
    #                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #                 detail="PDF generation failed - output file not found despite successful compilation."
    #             )

    #         # Get file size
    #         file_size = pdf_file.stat().st_size
    #         print(f"✓ PDF created: {pdf_file.name}")
    #         print(f"  Size: {file_size:,} bytes ({file_size/1024:.2f} KB)")

    #         # Verify PDF is not empty or corrupted
    #         if file_size < 1000:  # Less than 1KB is suspicious
    #             print(f"⚠ WARNING: PDF size is unusually small ({file_size} bytes)")
    #             raise HTTPException(
    #                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #                 detail=f"Generated PDF appears corrupted or empty ({file_size} bytes)"
    #             )

    #         # Read PDF into memory
    #         print(f"\n📤 Preparing response...")
    #         with open(pdf_file, "rb") as f:
    #             pdf_content = f.read()

    #         print(f"\n" + "=" * 80)
    #         print("✅ COMPILATION SUCCESSFUL!")
    #         print("=" * 80)
    #         print(f"  📊 Report ID: {report_id}")
    #         print(f"  📄 PDF Size: {len(pdf_content):,} bytes")
    #         print(f"  🕐 Timestamp: {timestamp}")
    #         print("=" * 80)

    #         # Return PDF as streaming response
    #         return StreamingResponse(
    #             iter([pdf_content]),
    #             media_type="application/pdf",
    #             headers={
    #                 "Content-Disposition": f"inline; filename=report_{report_id}_{timestamp}.pdf",
    #                 "Content-Length": str(len(pdf_content)),
    #                 "Cache-Control": "no-cache"
    #             }
    #         )

    #     except subprocess.TimeoutExpired:
    #         print("\n" + "=" * 80)
    #         print("❌ TIMEOUT ERROR")
    #         print("=" * 80)
    #         print("LaTeX compilation exceeded 90 seconds")
    #         raise HTTPException(
    #             status_code=status.HTTP_408_REQUEST_TIMEOUT,
    #             detail="LaTeX compilation timed out after 90 seconds. Document may be too complex."
    #         )
        
    #     except FileNotFoundError as e:
    #         print("\n" + "=" * 80)
    #         print("❌ FILE NOT FOUND ERROR")
    #         print("=" * 80)
    #         print(f"Missing file: {e}")
    #         raise HTTPException(
    #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=f"Required file not found: {str(e)}"
    #         )
        
    #     except HTTPException:
    #         # Re-raise HTTP exceptions as-is
    #         raise
        
    #     except Exception as e:
    #         print("\n" + "=" * 80)
    #         print("❌ UNEXPECTED ERROR")
    #         print("=" * 80)
    #         print(f"Error type: {type(e).__name__}")
    #         print(f"Error message: {str(e)}")
    #         import traceback
    #         traceback.print_exc()
            
    #         raise HTTPException(
    #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=f"Failed to generate PDF: {type(e).__name__}: {str(e)}"
    #         )
        
    #     finally:
    #         # Cleanup temporary directory (with retry)
    #         if temp_dir and temp_dir.exists():
    #             try:
    #                 # On Windows, sometimes files are locked, so retry
    #                 import time
    #                 for attempt in range(3):
    #                     try:
    #                         shutil.rmtree(temp_dir)
    #                         print(f"\n✓ Cleaned up temporary directory: {temp_dir}")
    #                         break
    #                     except PermissionError:
    #                         if attempt < 2:
    #                             print(f"  ⚠ Cleanup attempt {attempt + 1} failed, retrying...")
    #                             time.sleep(0.5)
    #                         else:
    #                             print(f"  ⚠ Could not cleanup {temp_dir} (files may be locked)")
    #             except Exception as cleanup_error:
    #                 print(f"⚠ Cleanup warning: {cleanup_error}")


   