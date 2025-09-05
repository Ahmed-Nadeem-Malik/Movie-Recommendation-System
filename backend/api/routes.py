from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import sys
import os
import re

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from data.database import SessionLocal
from data.models import Movie
from utils.recommender import recommend_by_title

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_title(title):
    """Clean up movie titles so 'The Matrix' matches 'matrix' searches."""
    title = title.lower().strip()
    # Drop 'The', 'A', 'An' from the beginning - they mess up searches
    title = re.sub(r'^(the|a|an)\s+', '', title)
    # Replace punctuation with spaces so "Spider-Man" becomes "spider man"
    title = re.sub(r'[^\w\s]', ' ', title)
    # Clean up any double spaces that got created
    title = re.sub(r'\s+', ' ', title).strip()
    return title


@router.get("/movies/", tags=["movies"])
def get_movies(
    skip: int = Query(0, ge=0, description="Number of movies to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of movies to return"),
    db: Session = Depends(get_db),
):
    """Get all movies with pagination."""
    movies = db.query(Movie).offset(skip).limit(limit).all()
    return {
        "movies": movies,
        "skip": skip,
        "limit": limit,
        "total": db.query(Movie).count(),
    }


@router.get("/movies/{movie_id}", tags=["movies"])
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    """Get a specific movie by ID."""
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@router.get("/movies/genre/{genre_name}", tags=["movies"])
def get_movies_by_genre(
    genre_name: str, limit: int = Query(50, ge=1, le=100), db: Session = Depends(get_db)
):
    """Get movies filtered by genre."""
    movies = (
        db.query(Movie).filter(Movie.genres.like(f"%{genre_name}%")).limit(limit).all()
    )
    return {"genre": genre_name, "movies": movies, "count": len(movies)}


@router.get("/search/", tags=["search"])
def search_movies(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    min_similarity: float = Query(
        0.30, ge=0.1, le=1.0, description="Minimum similarity score"
    ),
    db: Session = Depends(get_db),
):
    """Search movies with fuzzy matching. Handles typos and missing 'The' prefixes."""
    original_query = q.strip()
    normalized_query = normalize_title(original_query)

    sql = text(
        """
        WITH normalized_movies AS (
            SELECT 
                "ID" as id, "primaryTitle" as primarytitle, "startYear" as startyear, "averageRating" as averagerating,
                REGEXP_REPLACE(
                    REGEXP_REPLACE(LOWER("primaryTitle"), '^(the|a|an)\\s+', ''), 
                    '[^\\w\\s]', ' ', 'g'
                ) AS normalized_title
            FROM movies
        )
        SELECT
            id, primarytitle, startyear, averagerating,
            GREATEST(
                similarity(normalized_title, :normalized_q),
                similarity(LOWER(primarytitle), LOWER(:original_q))
            ) AS similarity_score
        FROM normalized_movies
        WHERE (
            normalized_title % :normalized_q 
            OR LOWER(primarytitle) % LOWER(:original_q)
        )
        AND GREATEST(
            similarity(normalized_title, :normalized_q),
            similarity(LOWER(primarytitle), LOWER(:original_q))
        ) >= :min_sim
        ORDER BY similarity_score DESC
        LIMIT :limit
    """
    )

    results = (
        db.execute(sql, {
            "original_q": original_query, 
            "normalized_q": normalized_query, 
            "limit": limit, 
            "min_sim": min_similarity
        })
        .mappings()
        .all()
    )

    return {"query": original_query, "results": results, "count": len(results)}


@router.get("/recommend/", tags=["recommendations"])
def get_recommendations(
    title: str = Query(
        ..., min_length=1, description="Movie title for recommendations"
    ),
    k: int = Query(10, ge=1, le=50, description="Number of recommendations"),
    min_rating: float = Query(None, ge=0, le=10, description="Minimum rating filter"),
    min_votes: int = Query(None, ge=0, description="Minimum votes filter"),
    year_from: int = Query(None, ge=1900, description="Minimum year filter"),
    year_to: int = Query(None, le=2030, description="Maximum year filter"),
    fuzzy: bool = Query(False, description="Enable fuzzy title matching"),
    db: Session = Depends(get_db),
):
    """Get movie recommendations with filtering. Can fall back to fuzzy search if exact title fails."""
    
    resolved_title = title
    
    # If fuzzy is enabled, try to fix typos when exact match fails
    if fuzzy:
        try:
            result = recommend_by_title(title, k)
            if "error" in result:
                # Movie not found - let's try finding something close
                search_sql = text(
                    """
                    SELECT primarytitle, similarity(LOWER(primarytitle), LOWER(:q)) as sim
                    FROM movies 
                    WHERE LOWER(primarytitle) % LOWER(:q)
                    ORDER BY sim DESC LIMIT 1
                    """
                )
                search_result = db.execute(search_sql, {"q": title}).fetchone()
                if search_result:
                    resolved_title = search_result[0]
                    result = recommend_by_title(resolved_title, k)
        except:
            # Something went wrong, just try the original title
            result = recommend_by_title(title, k)
    else:
        result = recommend_by_title(title, k)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    # Filter out movies that don't meet the criteria
    if "recommendations" in result:
        filtered = []
        for rec in result["recommendations"]:
            # Skip movies below rating threshold
            if min_rating and rec.get("averageRating", 0) < min_rating:
                continue
            # Skip movies with too few votes
            if min_votes and rec.get("numVotes", 0) < min_votes:
                continue
            # Skip old movies
            if year_from and rec.get("startYear", 0) < year_from:
                continue
            # Skip new movies
            if year_to and rec.get("startYear", 9999) > year_to:
                continue
            
            filtered.append(rec)
        
        # Take only k movies after filtering
        result["recommendations"] = filtered[:k]
    
    # Add metadata for frontend
    result["query_title"] = title
    if resolved_title != title:
        result["resolved_title"] = resolved_title
        
    return result

