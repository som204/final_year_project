from fastapi import FastAPI
from Routes.user_routes import router as user_router
from Routes.institute_routes import router as institute_router
from Routes.department_routes import router as department_router
from Middleware.auth_middleware import AuthMiddleware
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)


app.add_middleware(AuthMiddleware)


app.include_router(user_router)
app.include_router(institute_router)
app.include_router(department_router)


@app.get("/")
def root():
    return {"message": "Hello FastAPI!"}