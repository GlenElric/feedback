from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from .database import init_db

load_dotenv()

app = FastAPI(
    title="Feedback Collection Platform API",
    description="API for creating, distributing, and analyzing feedback forms",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Feedback Collection Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Import and include routers
from .routers import auth, forms, public, analytics
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(forms.router, prefix="/api/forms", tags=["Forms"])
app.include_router(public.router, prefix="/api/public", tags=["Public"])
app.include_router(analytics.router, prefix="/api/forms", tags=["Analytics"])

