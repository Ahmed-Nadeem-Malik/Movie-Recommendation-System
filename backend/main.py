"""
FastAPI Movie Recommendation System

Main application entry point that sets up the web server, database,
and API routes for the movie recommendation service.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import API_TITLE, API_VERSION, DEBUG
from api.routes import router
from data.database import Base, engine

# Create FastAPI application with metadata
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description="A movie recommendation system using content-based filtering"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:5173", 
        "http://localhost:5174",
        # Production deployments
        "https://movie-recommendation-system-p41ucrff4.vercel.app",
        "https://movie-recommendation-system-orpin.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes with version prefix
app.include_router(router, prefix="/api/v1")

# Initialize database tables
Base.metadata.create_all(bind=engine)

@app.get("/", tags=["health"])
def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": API_TITLE,
        "version": API_VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=DEBUG)
