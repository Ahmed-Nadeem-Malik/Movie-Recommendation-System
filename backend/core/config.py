"""
Application configuration settings.
Loads environment variables and defines application constants.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/db")

# API metadata
API_TITLE = "Movie Recommendation API"
API_VERSION = "1.0.0"

# Development settings
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

