import joblib
import pandas as pd
import numpy as np
import os

# Load once and keep in memory
matrix = None
movies = None
title_map = None


def load_data():
    global matrix, movies, title_map

    if matrix is not None:
        return  # Already loaded

    # In container: /app/utils/recommender.py -> /app/data/models
    current_dir = os.path.dirname(__file__)
    data_path = os.path.join(current_dir, "..", "data", "models")

    # Load the files
    matrix = joblib.load(os.path.join(data_path, "tfidf_matrix.joblib"))
    movies = pd.read_csv(os.path.join(data_path, "movies_meta.csv"))

    # Create title lookup
    title_map = {}
    for i, title in enumerate(movies["primaryTitle"]):
        title_map[str(title).lower()] = i


def recommend_by_title(title, count=10):
    load_data()

    # Make sure data loaded properly
    if matrix is None or movies is None or title_map is None:
        return {"error": "Failed to load model data"}

    # Clean up the title
    clean_title = title.lower().strip()

    # Find the movie
    if clean_title not in title_map:
        return {"error": f"Movie '{title}' not found"}

    movie_idx = title_map[clean_title]

    # Get similarities with all movies
    sims = (matrix[movie_idx] @ matrix.T).toarray().flatten()
    sims[movie_idx] = -1  # Don't recommend the same movie

    # Find top movies
    top_idx = np.argsort(-sims)[:count]

    # Build results
    results = []
    for idx in top_idx:
        movie = movies.iloc[idx].to_dict()
        movie["score"] = float(sims[idx])
        results.append(movie)

    return {"title": title, "recommendations": results}
