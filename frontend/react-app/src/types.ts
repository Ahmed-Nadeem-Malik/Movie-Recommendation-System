/**
 * TypeScript type definitions for the movie recommendation system.
 * Defines the data structures used throughout the application.
 */

/**
 * Movie interface for search results from the backend API.
 * Used in search dropdown and movie selection.
 */
export interface Movie {
    id: number;
    primarytitle: string; // Movie title
    startyear?: number; // Release year
    averagerating?: number; // IMDb rating (0-10)
    similarity_score?: number; // Search relevance score
}

/**
 * Recommendation interface for movie recommendation results.
 * Contains detailed movie information including IMDb data.
 */
export interface Recommendation {
    id?: number;
    primaryTitle: string; // Movie title
    startYear?: number; // Release year
    averageRating?: number; // IMDb rating (0-10)
    numVotes?: number; // Number of IMDb votes
    tconst?: string; // IMDb ID for poster fetching
    score?: number; // Content similarity score (0-1)
    similarity_score?: number; // Alternative similarity score
}
