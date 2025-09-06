import type { Recommendation } from "../types";

interface Props {
    recommendations: Recommendation[];
    loading: boolean;
    error: string;
    onRetry: () => void;
}

/**
 * Displays movie recommendations in a responsive grid layout.
 * Handles loading, error, and empty states.
 */
export function RecommendationGrid({
    recommendations,
    loading,
    error,
    onRetry,
}: Props) {
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

    if (recommendations.length === 0) {
        return (
            <div className="empty-state">
                <p>Search for a movie above to get recommendations!</p>
            </div>
        );
    }

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
                                <span className="movie-year">
                                    {movie.startYear}
                                </span>
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

                        {(movie.score || movie.similarity_score) && (
                            <div className="similarity-score">
                                Match:{" "}
                                {(
                                    (movie.score ||
                                        movie.similarity_score ||
                                        0) * 100
                                ).toFixed(0)}
                                %
                            </div>
                        )}
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

