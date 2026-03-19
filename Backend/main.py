

from fastapi import FastAPI
from Routes.user_routes import router as user_router
from Routes.institute_routes import router as institute_router
from Routes.department_routes import router as department_router
from Routes.dataUpload_routes import router as dataupload_router
from Routes.project_routes import router as project_router
from Routes.report_routes import router as report_router
from Routes.notification_routes import router as notification_router
from Middleware.auth_middleware import AuthMiddleware
from fastapi.middleware.cors import CORSMiddleware


app=FastAPI()

origins = ["http://localhost:5173","https://localhost:5173","http://localhost:5173/"]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_middleware(AuthMiddleware)


app.include_router(user_router)
app.include_router(institute_router)
app.include_router(department_router)
app.include_router(dataupload_router)
app.include_router(project_router)
app.include_router(report_router)
app.include_router(notification_router)


@app.get("/")
def root():
    return {"message": "Hello FastAPI"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Annual Report Portal API is running"}