"""
Movie recommendation system using TF-IDF and cosine similarity.
Loads pre-computed TF-IDF matrix and movie metadata for fast recommendations.
"""
import joblib
import pandas as pd
import numpy as np
import os

# Global variables for loaded data (loaded once for performance)
matrix = None
movies = None
title_map = None


def load_data():
    """Load TF-IDF matrix and movie data into memory."""
    global matrix, movies, title_map

    if matrix is not None:
        return  # Already loaded

    current_dir = os.path.dirname(__file__)
    data_path = os.path.join(current_dir, "..", "data", "models")

    # Load pre-computed models and data
    matrix = joblib.load(os.path.join(data_path, "tfidf_matrix.joblib"))
    movies = pd.read_csv(os.path.join(data_path, "movies_meta.csv"))

    # Create fast title lookup dictionary
    title_map = {}
    for i, title in enumerate(movies["primaryTitle"]):
        title_map[str(title).lower()] = i


def recommend_by_title(title, count=10):
    """
    Get movie recommendations based on content similarity.
    
    Args:
        title (str): Movie title to find recommendations for
        count (int): Number of recommendations to return
        
    Returns:
        dict: Contains title and list of recommended movies with scores
    """
    load_data()

    if matrix is None or movies is None or title_map is None:
        return {"error": "Failed to load model data"}

    clean_title = title.lower().strip()

    if clean_title not in title_map:
        return {"error": f"Movie '{title}' not found"}

    movie_idx = title_map[clean_title]

    # Calculate similarity between selected movie and all others
    selected_movie_vector = matrix[movie_idx]
    similarity_matrix = selected_movie_vector.dot(matrix.T)
    sims = similarity_matrix.toarray().flatten()
    sims[movie_idx] = -1  # Exclude the input movie from results

    # Get top similar movies
    top_idx = np.argsort(-sims)[:count]

    # Format results with similarity scores
    results = []
    for idx in top_idx:
        movie = movies.iloc[idx].to_dict()
        movie["score"] = float(sims[idx])
        results.append(movie)

    return {"title": title, "recommendations": results}
