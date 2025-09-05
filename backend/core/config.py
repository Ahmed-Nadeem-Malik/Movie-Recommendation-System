import os
from dotenv import load_dotenv

load_dotenv()

# Simple configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/db")
API_TITLE = "Movie Recommendation API"
API_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

