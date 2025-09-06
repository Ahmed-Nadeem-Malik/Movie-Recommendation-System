import type { Recommendation } from "../types";
import { MovieCard } from "./MovieCard";

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

    return (
        <div className="recommendation-grid">
            {recommendations.map((movie, index) => (
                <MovieCard 
                    key={movie.id || index} 
                    movie={movie} 
                    index={index} 
                />
            ))}
        </div>
    );
}

