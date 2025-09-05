import { useState, useCallback } from "react";
import { MovieSearch } from "./components/MovieSearch";
import { RecommendationGrid } from "./components/RecommendationGrid";
import { useAPI } from "./hooks/useAPI";
import type { Movie, Recommendation } from "./types";
import "./App.css";

/**
 * Main App Component
 *
 * This is the heart of our movie recommendation app. It handles:
 * - Movie searching (with typeahead dropdown)
 * - Getting recommendations when user selects a movie
 * - Showing loading states and error messages
 *
 * Flow: User types → sees search results → clicks movie → gets recommendations
 */
function App() {
    // What the user is typing in the search box
    const [query, setQuery] = useState("");

    // The movie the user selected (to show recommendations for)
    const [selectedTitle, setSelectedTitle] = useState("");

    // List of movies from search (shown in dropdown)
    const [searchResults, setSearchResults] = useState<Movie[]>([]);

    // List of recommended movies (shown as cards)
    const [recommendations, setRecommendations] = useState<Recommendation[]>(
        [],
    );

    // Whether we're currently loading recommendations
    const [loading, setLoading] = useState(false);

    // Any error message to show user
    const [error, setError] = useState("");

    // Our API helper (handles caching and HTTP requests)
    const { searchMovies, getRecommendations } = useAPI();

    /**
     * What happens when user clicks a movie from search results
     *
     * Steps:
     * 1. Remember which movie they picked
     * 2. Clear the search dropdown
     * 3. Show loading spinner
     * 4. Ask API for similar movies
     * 5. Show the recommendations or error message
     */
    const handleMovieSelect = useCallback(
        async (movie: Movie) => {
            // Remember which movie user picked
            setSelectedTitle(movie.primarytitle);

            // Clean up the search area
            setSearchResults([]);
            setQuery("");

            // Show loading state
            setLoading(true);
            setError("");

            try {
                // Ask our API for movies similar to this one
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
                // Something went wrong - show user a helpful message
                if (err instanceof Error) {
                    setError(
                        err.message.includes("404")
                            ? "Movie not found. Please try searching again."
                            : "Unable to load recommendations. Please try again.",
                    );
                }
            } finally {
                // Always hide loading spinner when done
                setLoading(false);
            }
        },
        [getRecommendations],
    );

    /**
     * What happens when user types in the search box
     *
     * This gets called after the user stops typing for 1 second.
     * If they typed at least 2 characters, we search for movies.
     */
    const handleSearchChange = useCallback(
        async (searchQuery: string) => {
            if (searchQuery.length >= 2) {
                try {
                    // Ask API to find movies matching what user typed
                    const results = await searchMovies(searchQuery, 10);
                    setSearchResults(results.results || []);
                } catch (err) {
                    console.error("Search failed:", err);
                    setSearchResults([]); // Clear results if search fails
                }
            } else {
                // User typed less than 2 characters, clear results
                setSearchResults([]);
            }
        },
        [searchMovies],
    );

    // The actual webpage that users see
    return (
        <div className="app">
            {/* Top header with app title */}
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
                    Data from IMDb datasets • Not affiliated with IMDb
                </small>
            </header>

            <main className="app-main">
                {/* Search box where user types movie names */}
                <section className="search-section">
                    <MovieSearch
                        query={query}
                        searchResults={searchResults}
                        onQueryChange={handleSearchChange}
                        onMovieSelect={handleMovieSelect}
                    />
                </section>

                {/* Movie recommendations (only shows after user picks a movie) */}
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
