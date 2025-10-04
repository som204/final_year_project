from sqlalchemy import Table, Column, Integer, ForeignKey
from Models import Base

# This table now lives in its own file, breaking the circular import.
report_data_association = Table(
    'report_data_association',
    Base.metadata,
    Column('report_id', Integer, ForeignKey('reports.id'), primary_key=True),
    Column('data_uploaded_id', Integer, ForeignKey('data_uploaded.id'), primary_key=True)
)