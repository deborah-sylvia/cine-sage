export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  tmdb_id: number;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  popularity?: number;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
}

export interface UserMovie {
  title: string;
  id: number;
}

export interface TasteProfile {
  description: string;
  genres: string[];
  themes: string[];
}

export interface Recommendation {
  id: number;
  title: string;
  year: number;
  tmdb_id: number;
  reason: string;
  category: 'Strong Match' | 'Hidden Gem' | 'Surprising Pick' | 'Recent Release';
  poster?: string;
  poster_path?: string | null;
  genre?: string;
  overview?: string;
  vote_average?: number;
  popularity?: number;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
}

export interface AnalysisResult {
  taste_profile: string;
  recommendations: Recommendation[];
}