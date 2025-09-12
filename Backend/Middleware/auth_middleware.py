from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import jwt
import os
import dotenv
from Services.redis_service import RedisService

dotenv.load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM","HS256")

EXEMPT_PATHS = {"/user/login", "/user/register", "/docs","/openapi.json"}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in EXEMPT_PATHS:
            return await call_next(request)


        auth_header = request.headers.get("Authorization")
        cookie_token = request.cookies.get("token")

        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
        elif cookie_token:
            token = cookie_token

        if not token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing authentication token"}
            )

        # Check if token is blacklisted
        is_blacklisted = await RedisService.get_value(token)
        if is_blacklisted:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": "Token has been revoked"}
            )
        
        # Validate token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            request.state.user = payload  # attach user claims

        except jwt.ExpiredSignatureError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": "Token has expired"}
            )
        except jwt.InvalidTokenError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": "Invalid token"}
            )

        return await call_next(request)
