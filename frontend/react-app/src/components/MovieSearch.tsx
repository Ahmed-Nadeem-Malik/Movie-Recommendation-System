import { useState, useEffect } from "react";
import type { Movie } from "../types";

interface Props {
    query: string;
    searchResults: Movie[];
    onQueryChange: (query: string) => void;
    onMovieSelect: (movie: Movie) => void;
}

/**
 * Search component with typeahead functionality.
 * Debounces input and displays matching movie results in a dropdown.
 */
export function MovieSearch({
    query,
    searchResults,
    onQueryChange,
    onMovieSelect,
}: Props) {
    const [inputValue, setInputValue] = useState(query);
    const [showDropdown, setShowDropdown] = useState(false);
    const [lastSearched, setLastSearched] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search input to prevent excessive API calls
    useEffect(() => {
        if (inputValue !== lastSearched && inputValue.length >= 2) {
            setIsSearching(true);

            const timer = setTimeout(() => {
                onQueryChange(inputValue);
                setLastSearched(inputValue);
                setIsSearching(false);
            }, 1000);

            return () => {
                clearTimeout(timer);
                setIsSearching(false);
            };
        } else if (inputValue.length < 2 && lastSearched) {
            onQueryChange("");
            setLastSearched("");
            setIsSearching(false);
        }
    }, [inputValue, lastSearched, onQueryChange]);

    // Show dropdown when results are available
    useEffect(() => {
        setShowDropdown(searchResults.length > 0 && inputValue.length >= 2);
    }, [searchResults, inputValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleMovieClick = (movie: Movie) => {
        setInputValue("");
        setShowDropdown(false);
        onMovieSelect(movie);
    };

    return (
        <div className="movie-search">
            <div className="search-input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Search for a movie..."
                    className="search-input"
                />
                {isSearching && (
                    <div className="search-loading">Searching...</div>
                )}

                {showDropdown && (
                    <div className="search-dropdown">
                        {searchResults.map((movie) => (
                            <div
                                key={movie.id}
                                className="search-result"
                                onClick={() => handleMovieClick(movie)}
                            >
                                <div className="movie-title">
                                    {movie.primarytitle}
                                </div>
                                {movie.startyear && (
                                    <div className="movie-year">
                                        ({movie.startyear})
                                    </div>
                                )}
                                {movie.averagerating && (
                                    <div className="movie-rating">
                                        ★ {movie.averagerating.toFixed(1)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

