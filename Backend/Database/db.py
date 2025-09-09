# Backend/Database/db.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://postgres:som@localhost:5432/finalyearproject"

engine = create_async_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
    bind=engine,  # type: ignore
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()