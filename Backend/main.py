from fastapi import FastAPI
from Routes.user_routes import router as user_router

app=FastAPI()

@app.get("/")
def root():
    return {"message": "Hello FastAPI!"}

app.include_router(user_router)