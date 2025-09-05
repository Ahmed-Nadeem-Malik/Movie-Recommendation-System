import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

df = pd.read_csv("MovieDataSet.csv")
tfidf = TfidfVectorizer()

encoding = []
for idx, row in df.iterrows():
    # Convert to string, handle NaN
    directors = str(row.get("directors", "") or "")
    writers = str(row.get("writers", "") or "")
    genres = str(row.get("genres", "") or "")

    director_string = " ".join(
        d.strip().lower().replace(" ", "_")
        for d in directors.split(",")
        if d and d != "nan"
    )
    writer_string = " ".join(
        w.strip().lower().replace(" ", "_")
        for w in writers.split(",")
        if w and w != "nan"
    )
    genre_string = " ".join(
        g.strip().lower().replace(" ", "_")
        for g in genres.split(",")
        if g and g != "nan"
    )

    document = f"{director_string} {writer_string} {genre_string}"
    result = tfidf.fit_transform(document)
    encoding.append(result)
df["encodings"] = encoding
df.to_csv("MovieDataSet+Vectors.csv")
