# Movie Recommendation System

A full-stack web application that recommends movies from IMDb's Top 5000 dataset using content-based filtering with TF-IDF similarity scoring.

## Project Structure

```
Movie-Recommendation-System/
├── backend/                    # FastAPI backend service
│   ├── main.py                # Application entry point
│   ├── database.py            # PostgreSQL connection and setup
│   ├── models.py              # SQLAlchemy database models
│   ├── api/
│   │   └── routes.py          # API endpoints for search and recommendations
│   └── requirements.txt       # Python dependencies
├── frontend/
│   └── react-app/             # React TypeScript frontend
│       ├── src/
│       │   ├── App.tsx        # Main application component
│       │   ├── components/    # Reusable UI components
│       │   ├── hooks/         # Custom React hooks
│       │   └── types.ts       # TypeScript type definitions
│       └── package.json       # Node.js dependencies
├── data/                      # IMDb dataset files
└── notebooks/                 # Jupyter notebooks for data analysis
```

## How It Works

### Backend Architecture

**Database Layer:**
- PostgreSQL database storing IMDb Top 5000 movies
- Tables: movies (basic info), ratings (scores/votes), features (TF-IDF vectors)
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

**Key Features:**
- Debounced search (1-second delay to prevent API spam)
- Request caching (5-minute TTL to reduce server load)
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
- Python 3.9+
- FastAPI (web framework)
- SQLAlchemy (ORM)
- PostgreSQL (database)
- scikit-learn (TF-IDF vectorization)
- pandas (data processing)

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- CSS Grid (responsive layout)
- Fetch API with AbortController (HTTP requests)

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

# Set API endpoint (optional)
echo "VITE_API_BASE=http://localhost:8000/api/v1" > .env

# Start development server
npm run dev
```

### Database Setup
1. Install PostgreSQL and create database
2. Enable pg_trgm extension for trigram similarity
3. Load IMDb datasets into database tables
4. Generate TF-IDF vectors and similarity matrices

## API Endpoints

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
  "source_movie": "The Matrix",
  "recommendations": [
    {
      "primaryTitle": "The Matrix Reloaded",
      "startYear": 2003,
      "averageRating": 7.2,
      "numVotes": 573056,
      "tconst": "tt0234215",
      "score": 0.85
    }
  ],
  "count": 1
}
```

## Performance Considerations

**Backend Optimizations:**
- Database indexes on movie titles and ratings
- TF-IDF vectors pre-computed and stored
- Query result caching in memory
- Batch processing for similarity calculations

**Frontend Optimizations:**
- Request debouncing to reduce API calls
- Response caching with TTL
- Request cancellation to prevent memory leaks
- Lazy loading and skeleton screens

## Legal Notice

This project is for educational purposes only. Movie data comes from IMDb datasets available for non-commercial use. The application is not affiliated with IMDb and should not be used for commercial purposes.

## Dataset Attribution

Data courtesy of IMDb (https://www.imdb.com). Used in accordance with IMDb's terms of service for non-commercial educational use.