import { useState, useCallback } from "react";
import { MovieSearch } from "./components/MovieSearch";
import { RecommendationGrid } from "./components/RecommendationGrid";
import { useAPI } from "./hooks/useAPI";
import type { Movie, Recommendation } from "./types";
import "./App.css";

/**
 * Main application component that orchestrates movie search and recommendations.
 * Manages the core user flow: search → select → get recommendations.
 */
function App() {
    const [query, setQuery] = useState("");
    const [selectedTitle, setSelectedTitle] = useState("");
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { searchMovies, getRecommendations } = useAPI();

    /**
     * Handles movie selection from search results.
     * Fetches recommendations and updates UI state accordingly.
     */
    const handleMovieSelect = useCallback(
        async (movie: Movie) => {
            setSelectedTitle(movie.primarytitle);
            setSearchResults([]);
            setQuery("");
            setLoading(true);
            setError("");

            try {
                const result = await getRecommendations(movie.primarytitle, 10);

                if (
                    result.recommendations &&
                    result.recommendations.length > 0
                ) {
                    setRecommendations(result.recommendations);
                } else {
                    setError("No recommendations found for this movie");
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(
                        err.message.includes("404")
                            ? "Movie not found. Please try searching again."
                            : "Unable to load recommendations. Please try again.",
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [getRecommendations],
    );

    /**
     * Handles search input changes with debouncing.
     * Called after user stops typing for 1 second.
     */
    const handleSearchChange = useCallback(
        async (searchQuery: string) => {
            if (searchQuery.length >= 2) {
                try {
                    const results = await searchMovies(searchQuery, 10);
                    setSearchResults(results.results || []);
                } catch (err) {
                    console.error("Search failed:", err);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
            }
        },
        [searchMovies],
    );

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎬 Top 5000 Movie Recommender</h1>
                <p>Find your next favorite movie from IMDb's best collection</p>
                <small
                    style={{
                        color: "#888",
                        fontSize: "0.8rem",
                        marginTop: "1rem",
                        display: "block",
                        lineHeight: "1.4",
                    }}
                >
                    Educational use only • Not for commercial use
                    <br />
                    Data from IMDb datasets • Posters from OMDB API • Not
                    affiliated with IMDb
                    <br />
                    Made by Ahmed Nadeem Malik
                </small>
            </header>

            <main className="app-main">
                <section className="search-section">
                    <MovieSearch
                        query={query}
                        searchResults={searchResults}
                        onQueryChange={handleSearchChange}
                        onMovieSelect={handleMovieSelect}
                    />
                </section>

                <section className="results-section">
                    {selectedTitle && <h2>Movies like "{selectedTitle}"</h2>}

                    <RecommendationGrid
                        recommendations={recommendations}
                        loading={loading}
                        error={error}
                        onRetry={() =>
                            selectedTitle &&
                            handleMovieSelect({
                                id: -1,
                                primarytitle: selectedTitle,
                            })
                        }
                    />
                </section>
            </main>
        </div>
    );
}

export default App;
