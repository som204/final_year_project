
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum, Boolean
from sqlalchemy.orm import relationship,DeclarativeBase , Mapped, mapped_column

class Base(DeclarativeBase):
    pass



