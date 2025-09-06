# Movie Recommendation System

A full-stack web application that recommends movies from IMDb's Top 5000 dataset using content-based filtering with TF-IDF similarity scoring. Movie posters provided by [OMDB API](https://www.omdbapi.com/).

## 🚀 Live Demo

- **Frontend:** https://movie-recommendation-system-orpin.vercel.app/
- **Backend API:** https://movie-recommendation-backend.fly.dev/
- **API Documentation:** https://movie-recommendation-backend.fly.dev/docs

## 📋 Features

- **Smart Search:** Type movie titles with fuzzy matching and typo tolerance
- **Content-Based Recommendations:** Get similar movies using TF-IDF and cosine similarity
- **Movie Posters:** Real poster images from OMDB API with fallback placeholders
- **IMDb Integration:** Direct links to movie pages on IMDb
- **Real-time Results:** Debounced search with caching for optimal performance  
- **Responsive Design:** Works on desktop and mobile devices
- **Production Deployment:** Backend on Fly.io, Frontend on Vercel

## Project Structure

```
Movie-Recommendation-System/
├── backend/                    # FastAPI backend service
│   ├── main.py                # Application entry point
│   ├── api/
│   │   └── routes.py          # API endpoints for search and recommendations
│   ├── core/                  # Configuration and settings
│   └── utils/                 # Utility functions and recommender logic
├── frontend/
│   └── react-app/             # React TypeScript frontend
│       ├── src/
│       │   ├── App.tsx        # Main application component
│       │   ├── App.css        # Main application styles
│       │   ├── main.tsx       # React app entry point
│       │   ├── components/    # Reusable UI components
│       │   │   ├── MovieSearch.tsx      # Search input with dropdown
│       │   │   ├── MovieCard.tsx        # Individual movie cards
│       │   │   └── RecommendationGrid.tsx # Grid layout for movies
│       │   ├── hooks/         # Custom React hooks
│       │   │   ├── useAPI.ts           # Backend API integration
│       │   │   └── useOMDB.ts          # OMDB poster API integration
│       │   └── types.ts       # TypeScript type definitions
│       └── package.json       # Node.js dependencies
├── data/                      # IMDb dataset files and database models
│   ├── database.py            # PostgreSQL connection and setup
│   ├── models.py              # SQLAlchemy database models
│   ├── processing.py          # Data preprocessing scripts
│   ├── MovieDataSet.csv       # IMDb movie dataset
│   └── models/                # Pre-trained ML models (TF-IDF matrix, etc.)
├── notebooks/                 # Jupyter notebooks for data analysis
└── requirements.txt           # Python dependencies
```

## How It Works

### Backend Architecture

**Database Layer:**
- PostgreSQL/Supabase database storing IMDb Top 5000 movies
- Single movies table with all movie metadata
- Uses PostgreSQL trigram similarity for fuzzy text search

**API Layer (FastAPI):**
- `/search/` - Find movies by title using fuzzy matching
- `/recommend/` - Get similar movies using TF-IDF cosine similarity
- CORS enabled for frontend integration

**Recommendation Algorithm:**
1. Extract movie features (genres, directors, writers, principals)
2. Create TF-IDF vectors from combined text features
3. Calculate cosine similarity between movies
4. Return top-K most similar movies with similarity scores

### Frontend Architecture

**React Components:**
- `App.tsx` - Main application state and layout
- `MovieSearch.tsx` - Search input with typeahead dropdown
- `RecommendationGrid.tsx` - Grid display of recommended movies
- `MovieCard.tsx` - Individual movie cards with poster integration

**Custom Hooks:**
- `useAPI.ts` - Backend API calls with caching and error handling
- `useOMDB.ts` - OMDB API integration for movie posters

**Key Features:**
- Debounced search (1-second delay to prevent API spam)
- Request caching (5-minute TTL to reduce server load)
- Movie poster fetching with smart caching
- Loading states and error handling
- Responsive design with CSS Grid

## User Workflow

1. **Search Phase:**
   - User types movie title in search box
   - After 1-second delay, frontend calls `/search/` API
   - Dropdown shows matching movies with title, year, and rating
   
2. **Selection Phase:**
   - User clicks on a movie from dropdown
   - Frontend calls `/recommend/` API with selected movie title
   - Loading skeleton cards appear during API request
   
3. **Recommendation Phase:**
   - Backend finds movie in database using fuzzy matching
   - Calculates similarity scores against all other movies
   - Returns top 10 most similar movies
   - Frontend displays recommendation cards with:
     - Movie poster from OMDB API (with fallback placeholder)
     - Movie title, year, rating, vote count
     - Similarity match percentage
     - Link to IMDb page

## Data Pipeline

### Dataset Processing
1. Download IMDb datasets (title.basics, title.ratings, etc.)
2. Filter to Top 5000 movies by rating and vote count
3. Clean and normalize movie titles for better matching
4. Extract features: genres, directors, writers, principal cast
5. Generate TF-IDF vectors from combined text features
6. Store in PostgreSQL with proper indexing

### Search Implementation
- Primary search uses PostgreSQL trigram similarity
- Text normalization removes articles (the, a, an) and punctuation
- Fuzzy fallback for typos and variations
- Configurable similarity thresholds

## Technical Stack

**Backend:**
- Python 3.11+
- FastAPI (web framework)
- SQLAlchemy (ORM)
- PostgreSQL/Supabase (database)
- scikit-learn (TF-IDF vectorization)
- pandas, numpy, scipy (data processing)
- Deployed on Fly.io

**Frontend:**
- React 19 with TypeScript
- Vite (build tool)
- CSS Grid (responsive layout)
- Fetch API with AbortController (HTTP requests)
- OMDB API integration for movie posters
- Deployed on Vercel

## Setup Instructions

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost/moviedb"

# Run database migrations
python database.py

# Start API server
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend/react-app
npm install

# Set environment variables
echo "VITE_API_BASE=http://localhost:8000/api/v1" > .env
echo "VITE_OMDB_API_KEY=your_omdb_api_key" >> .env

# Get OMDB API key from: https://www.omdbapi.com/apikey.aspx

# Start development server
npm run dev
```

### Docker Deployment
```bash
# Deploy full application with docker-compose
docker-compose up --build

# Or deploy backend only 
cd backend
docker build -t movie-backend .
docker run -p 8000:8000 -e DATABASE_URL="your_db_url" movie-backend
```

### Database Setup
1. Install PostgreSQL and create database
2. Enable pg_trgm extension for trigram similarity
3. Load IMDb datasets into database tables
4. Generate TF-IDF vectors and similarity matrices

## API Endpoints

### GET /api/v1/movies/
Get paginated list of all movies.

**Parameters:**
- `skip` (int): Number of movies to skip (default: 0)
- `limit` (int): Number of movies to return (default: 10, max: 100)

### GET /api/v1/movies/{movie_id}
Get specific movie by ID.

### GET /api/v1/movies/genre/{genre_name}
Get movies filtered by genre.

**Parameters:**
- `limit` (int): Maximum results to return (default: 50, max: 100)

### GET /api/v1/search/
Search for movies by title with fuzzy matching.

**Parameters:**
- `q` (string): Search query (minimum 2 characters)
- `limit` (int): Maximum results to return (default: 10)

**Response:**
```json
{
  "query": "matrix",
  "results": [
    {
      "id": 15,
      "primarytitle": "The Matrix",
      "startyear": 1999,
      "averagerating": 8.7,
      "similarity_score": 1.0
    }
  ],
  "count": 1
}
```

### GET /api/v1/recommend/
Get movie recommendations based on content similarity.

**Parameters:**
- `title` (string): Movie title to find recommendations for
- `k` (int): Number of recommendations (default: 10)
- `fuzzy` (bool): Enable fuzzy title matching (default: true)

**Response:**
```json
{
  "title": "The Matrix",
  "query_title": "The Matrix",
  "recommendations": [
    {
      "ID": 2113,
      "primaryTitle": "The Matrix Reloaded",
      "startYear": 2003,
      "averageRating": 7.2,
      "numVotes": 657445,
      "tconst": "tt0234215",
      "score": 1.0000000000000002
    }
  ]
}
```

## Performance Considerations

**Backend Optimizations:**
- Database indexes on movie titles and ratings
- TF-IDF vectors pre-computed and loaded in memory
- Cosine similarity calculated using NumPy operations
- Efficient matrix operations for recommendation generation

**Frontend Optimizations:**
- Request debouncing to reduce API calls
- Response caching with TTL
- OMDB poster caching to minimize API requests
- Request cancellation to prevent memory leaks
- Lazy loading and skeleton screens

## Legal Notice

This project is for educational purposes only. Movie data comes from IMDb datasets available for non-commercial use. The application is not affiliated with IMDb and should not be used for commercial purposes.

## Dataset Attribution

- **Movie Data:** Courtesy of IMDb (https://www.imdb.com). Used in accordance with IMDb's terms of service for non-commercial educational use.
- **Movie Posters:** Provided by The Open Movie Database (OMDB) API (https://www.omdbapi.com/). Used under their terms of service.