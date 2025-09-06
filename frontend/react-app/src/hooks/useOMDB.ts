import { useState, useEffect } from 'react';

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

interface OMDBResponse {
  Title?: string;
  Year?: string;
  Poster?: string;
  Response: string;
  Error?: string;
}

interface PosterCache {
  [key: string]: string | null;
}

const posterCache: PosterCache = {};

export function useOMDB(imdbId?: string) {
  const [poster, setPoster] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imdbId || !OMDB_API_KEY) return;

    // Check cache first
    if (posterCache[imdbId]) {
      setPoster(posterCache[imdbId]);
      return;
    }

    if (posterCache[imdbId] === null) {
      // Already tried and failed
      return;
    }

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
          posterCache[imdbId] = data.Poster;
          setPoster(data.Poster);
        } else {
          posterCache[imdbId] = null; // Cache the failure
          setError(data.Error || 'No poster available');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch poster';
        setError(errorMessage);
        posterCache[imdbId] = null; // Cache the failure
      } finally {
        setLoading(false);
      }
    };

    fetchPoster();
  }, [imdbId]);

  return { poster, loading, error };
}