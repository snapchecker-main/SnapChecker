from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import templates, roster, scans
from app.routes import classrooms
from app.auth.router import router as auth_router
from app.routes import storage
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.security.limiter import limiter
from app.config import settings

app = FastAPI(title="SnapCheck API v2.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(templates.router, prefix="/api")
app.include_router(roster.router, prefix="/api")
app.include_router(scans.router)
app.include_router(classrooms.router)
app.include_router(auth_router, prefix="/api")
app.include_router(storage.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "SnapCheck v2.0 Backend is running!"
    }