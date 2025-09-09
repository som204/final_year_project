import asyncio
from Models import Base
from Database.db import engine


async def create_tables():
    """
    Asynchronously creates all database tables.
    """
    print("Starting to create tables...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")

# Run the async function
if __name__ == "__main__":
    asyncio.run(create_tables())