export interface Movie {
  id: number;
  primarytitle: string;
  startyear?: number;
  averagerating?: number;
  similarity_score?: number;
}

export interface Recommendation {
  id?: number;
  primaryTitle: string;
  startYear?: number;
  averageRating?: number;
  numVotes?: number;
  tconst?: string;
  score?: number;
  similarity_score?: number;
}

