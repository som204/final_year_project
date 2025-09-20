import asyncio
from Database.db import Base, engine


from Models.user_models import User
from Models.institute_models import Institute
from Models.department_models import Department
from Models.dataUpload_models import DataUploaded


async def create_all_tables():
    print("Attempting to create tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Table creation process finished.")

if __name__ == "__main__":
    asyncio.run(create_all_tables())