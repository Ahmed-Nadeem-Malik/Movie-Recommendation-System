import { useOMDB } from "../hooks/useOMDB";
import type { Recommendation } from "../types";

interface Props {
    movie: Recommendation;
    index: number;
}

/**
 * MovieCard Component
 *
 * Displays individual movie recommendations with poster images from OMDB API.
 * Shows movie title, year, rating, similarity score, and IMDb link.
 */
export function MovieCard({ movie, index }: Props) {
    // Fetch poster image using movie's IMDb ID (tconst)
    const { poster, loading: posterLoading } = useOMDB(movie.tconst);

    // Generate IMDb URL from tconst
    const getIMDbLink = (tconst?: string) => {
        return tconst ? `https://www.imdb.com/title/${tconst}/` : null;
    };

    return (
        <div className="movie-card">
            {/* Poster section with ranking badge */}
            <div className="movie-poster">
                {posterLoading ? (
                    <div className="poster-loading">
                        <span className="movie-rank">#{index + 1}</span>
                    </div>
                ) : poster ? (
                    <div className="poster-container">
                        <img
                            src={poster}
                            alt={`${movie.primaryTitle} poster`}
                            className="poster-image"
                            onError={(e) => {
                                // Show placeholder if poster fails to load
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement!.innerHTML = `
                  <div class="poster-placeholder">
                    <span class="movie-rank">#${index + 1}</span>
                  </div>
                `;
                            }}
                        />
                        <span className="movie-rank">#{index + 1}</span>
                    </div>
                ) : (
                    <div className="poster-placeholder">
                        <span className="movie-rank">#{index + 1}</span>
                    </div>
                )}
            </div>

            {/* Movie information section */}
            <div className="movie-content">
                <div className="movie-header">
                    <h3 className="movie-title">{movie.primaryTitle}</h3>
                    {movie.startYear && (
                        <span className="movie-year">({movie.startYear})</span>
                    )}
                </div>

                {/* Rating and similarity score */}
                <div className="movie-rating-row">
                    {movie.averageRating && (
                        <div className="rating-container">
                            <span className="rating-star">★</span>
                            <span className="rating-value">
                                {movie.averageRating.toFixed(1)}
                            </span>
                        </div>
                    )}

                    {(movie.score || movie.similarity_score) && (
                        <div className="similarity-badge">
                            {(
                                (movie.score || movie.similarity_score || 0) *
                                100
                            ).toFixed(0)}
                            % match
                        </div>
                    )}
                </div>

                {/* Vote count */}
                {movie.numVotes && (
                    <div className="movie-votes">
                        {movie.numVotes.toLocaleString()} votes
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
                        View on IMDb →
                    </a>
                )}
            </div>
        </div>
    );
}
