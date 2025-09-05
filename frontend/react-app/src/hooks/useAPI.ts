import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

// Simple cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useAPI() {
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Cancel any in-flight requests
  const cancelRequests = () => {
    if (abortController) {
      abortController.abort();
    }
    const newController = new AbortController();
    setAbortController(newController);
    return newController;
  };

  // Check cache for recent responses
  const getCached = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    cache.delete(key);
    return null;
  };

  // Store response in cache
  const setCache = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  };

  // Search movies with caching
  const searchMovies = async (query: string, limit: number = 10) => {
    if (!query || query.trim().length < 2) {
      return { results: [] };
    }

    const cacheKey = `search:${query}:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const controller = cancelRequests();
    
    try {
      const response = await fetch(
        `${API_BASE}/search/?q=${encodeURIComponent(query)}&limit=${limit}`,
        { signal: controller.signal }
      );
      
      if (!response.ok) throw new Error(`Search failed: ${response.status}`);
      
      const data = await response.json();
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { results: [] };
      }
      throw error;
    }
  };

  // Get recommendations with caching
  const getRecommendations = async (title: string, k: number = 10) => {
    const params = new URLSearchParams({
      title,
      k: k.toString(),
      fuzzy: 'true'
    });

    const cacheKey = `recommend:${params.toString()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const controller = cancelRequests();

    try {
      const response = await fetch(`${API_BASE}/recommend/?${params}`, {
        signal: controller.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Request failed: ${response.status}`);
      }
      
      const data = await response.json();
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { recommendations: [] };
      }
      throw error;
    }
  };

  return {
    searchMovies,
    getRecommendations
  };
}