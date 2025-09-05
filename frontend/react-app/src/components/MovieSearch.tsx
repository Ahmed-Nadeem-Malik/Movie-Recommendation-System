import { useState, useEffect } from 'react';
import type { Movie } from '../types';

// What this component needs from its parent
interface Props {
  query: string;              // Current search text
  searchResults: Movie[];     // Movies found by search
  onQueryChange: (query: string) => void;  // Tell parent when user types
  onMovieSelect: (movie: Movie) => void;   // Tell parent when user picks a movie
}

/**
 * Movie Search Component
 * 
 * Shows a search box with a dropdown of matching movies.
 * User types → waits 1 second → searches → shows dropdown → user clicks movie
 */
export function MovieSearch({ query, searchResults, onQueryChange, onMovieSelect }: Props) {
  // What user is currently typing (might be different from query while they type)
  const [inputValue, setInputValue] = useState(query);
  
  // Whether to show the dropdown with search results
  const [showDropdown, setShowDropdown] = useState(false);
  
  // The last thing we actually searched for (to avoid duplicate searches)
  const [lastSearched, setLastSearched] = useState('');
  
  // Whether we're waiting to search (shows "Searching..." text)
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Handle the search delay (debouncing)
   * 
   * When user types, we wait 1 second before actually searching.
   * This prevents too many API calls while they're still typing.
   */
  useEffect(() => {
    if (inputValue !== lastSearched && inputValue.length >= 2) {
      // User typed something new - start the countdown
      setIsSearching(true);
      
      const timer = setTimeout(() => {
        // 1 second passed - do the search
        onQueryChange(inputValue);
        setLastSearched(inputValue);
        setIsSearching(false);
      }, 1000);
      
      // If user types again before 1 second, cancel this search
      return () => {
        clearTimeout(timer);
        setIsSearching(false);
      };
    } else if (inputValue.length < 2 && lastSearched) {
      // User deleted text - clear everything immediately
      onQueryChange('');
      setLastSearched('');
      setIsSearching(false);
    }
  }, [inputValue, lastSearched, onQueryChange]);

  /**
   * Show dropdown when we have search results
   */
  useEffect(() => {
    setShowDropdown(searchResults.length > 0 && inputValue.length >= 2);
  }, [searchResults, inputValue]);

  // When user types in the search box
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // When user clicks a movie in the dropdown
  const handleMovieClick = (movie: Movie) => {
    setInputValue('');           // Clear the search box
    setShowDropdown(false);      // Hide the dropdown
    onMovieSelect(movie);        // Tell parent component which movie was picked
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
                <div className="movie-title">{movie.primarytitle}</div>
                {movie.startyear && (
                  <div className="movie-year">({movie.startyear})</div>
                )}
                {movie.averagerating && (
                  <div className="movie-rating">★ {movie.averagerating.toFixed(1)}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}