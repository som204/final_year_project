import asyncio
from Database.db import Base, engine

# IMPORTANT: This section is crucial.
# These imports register your models with SQLAlchemy's metadata.
from Models.user_models import User
from Models.institute_models import Institute
from Models.department_models import Department
# ... add all other model files here ...

async def create_all_tables():
    print("Attempting to create tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Table creation process finished.")

if __name__ == "__main__":
    asyncio.run(create_all_tables())