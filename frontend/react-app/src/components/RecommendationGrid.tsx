import type { Recommendation } from '../types';

// What this component needs from its parent
interface Props {
  recommendations: Recommendation[];  // List of movies to show
  loading: boolean;                   // Whether we're fetching recommendations
  error: string;                      // Error message (if any)
  onRetry: () => void;               // Function to call when user clicks "Try Again"
}

/**
 * Recommendation Grid Component
 * 
 * Shows a grid of movie recommendation cards. Handles 3 states:
 * 1. Loading - shows skeleton cards
 * 2. Error - shows error message with retry button  
 * 3. Success - shows movie cards with titles, ratings, and IMDb links
 */
export function RecommendationGrid({ recommendations, loading, error, onRetry }: Props) {
  // Show loading animation with fake movie cards
  if (loading) {
    return (
      <div className="recommendation-grid">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="movie-card skeleton">
            <div className="movie-info">
              <div className="skeleton-title"></div>
              <div className="skeleton-year"></div>
              <div className="skeleton-rating"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error message with retry button
  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={onRetry} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  // Show message when no movies selected yet
  if (recommendations.length === 0) {
    return (
      <div className="empty-state">
        <p>Search for a movie above to get recommendations!</p>
      </div>
    );
  }

  // Helper function to create IMDb URLs
  const getIMDbLink = (tconst?: string) => {
    return tconst ? `https://www.imdb.com/title/${tconst}/` : null;
  };

  return (
    <div className="recommendation-grid">
      {recommendations.map((movie, index) => (
        <div key={movie.id || index} className="movie-card">
          <div className="movie-info">
            <h3 className="movie-title">{movie.primaryTitle}</h3>
            
            <div className="movie-details">
              {movie.startYear && (
                <span className="movie-year">{movie.startYear}</span>
              )}
              
              {movie.averageRating && (
                <span className="movie-rating">
                  ★ {movie.averageRating.toFixed(1)}
                </span>
              )}
              
              {movie.numVotes && (
                <span className="movie-votes">
                  ({movie.numVotes.toLocaleString()} votes)
                </span>
              )}
            </div>

            {/* Recommendation score */}
            {(movie.score || movie.similarity_score) && (
              <div className="similarity-score">
                Match: {((movie.score || movie.similarity_score || 0) * 100).toFixed(0)}%
              </div>
            )}

            {/* IMDb link */}
            {movie.tconst && (
              <a 
                href={getIMDbLink(movie.tconst)!}
                target="_blank"
                rel="noopener noreferrer"
                className="imdb-link"
              >
                View on IMDb
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}