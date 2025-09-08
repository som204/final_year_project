from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from Models.user_models import Base  # Make sure this import path is correct

DATABASE_URL = "postgresql://postgres:som@localhost:5432/finalyearproject"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)


