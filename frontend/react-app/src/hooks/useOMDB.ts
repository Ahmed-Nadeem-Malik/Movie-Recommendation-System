import { useState, useEffect } from 'react';

/**
 * OMDB API Integration Hook
 * 
 * This hook fetches movie poster images from the Open Movie Database (OMDB) API.
 * It uses IMDb IDs (tconst) to retrieve poster URLs and includes smart caching
 * to avoid duplicate API calls.
 * 
 * Usage:
 *   const { poster, loading, error } = useOMDB('tt0111161');
 * 
 * Returns:
 *   - poster: URL string of the movie poster (null if not available)
 *   - loading: boolean indicating if API request is in progress
 *   - error: error message if request fails (null if successful)
 */

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

interface OMDBResponse {
  Title?: string;
  Year?: string;
  Poster?: string;
  Response: string;
  Error?: string;
}

// Simple in-memory cache to store poster URLs and avoid duplicate requests
const posterCache: { [key: string]: string | null } = {};

export function useOMDB(imdbId?: string) {
  const [poster, setPoster] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if no IMDb ID or API key provided
    if (!imdbId || !OMDB_API_KEY) return;

    // Return cached poster if available
    if (posterCache[imdbId] !== undefined) {
      setPoster(posterCache[imdbId]);
      return;
    }

    // Fetch poster from OMDB API
    const fetchPoster = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${OMDB_BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: OMDBResponse = await response.json();
        
        if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
          // Success: cache and set poster URL
          posterCache[imdbId] = data.Poster;
          setPoster(data.Poster);
        } else {
          // No poster available: cache failure to avoid retrying
          posterCache[imdbId] = null;
          setError(data.Error || 'No poster available');
        }
      } catch (err) {
        // Network or parsing error: cache failure
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch poster';
        setError(errorMessage);
        posterCache[imdbId] = null;
      } finally {
        setLoading(false);
      }
    };

    fetchPoster();
  }, [imdbId]);

  return { poster, loading, error };
}