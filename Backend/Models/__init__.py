# Backend/Models/__init__.py

# Import the Base from one of your model files (or a central base file)
from .user_models import Base

# Import all the model classes so SQLAlchemy's registry knows about them
from .institute_models import Institute
from .department_models import Department
from .user_models import User, Stakeholder
from .dataUpload_models import DataUploaded
from .project_models import Project
from .report_models import Report
from .association_models import report_data_association


# You can also define what gets imported when someone does "from Models import *"
__all__ = ["Base", "Institute", "Department", "User", "Stakeholder", "Project", "Report", "DataUploaded", "report_data_association"]