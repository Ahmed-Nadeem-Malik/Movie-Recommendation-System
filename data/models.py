from sqlalchemy import Column, Integer, String, Float
from .database import Base  # import Base from database.py


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tconst = Column(String, index=True)
    primarytitle = Column(String)
    startyear = Column(Integer)
    rank = Column(Integer)
    averagerating = Column(Float)
    numvotes = Column(Integer)
    runtimeminutes = Column(Integer)
    directors = Column(String)
    writers = Column(String)
    genres = Column(String)
    imdblink = Column(String)
    title_imdb_link = Column(String)
