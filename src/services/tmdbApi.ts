import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'demo_key';
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  popularity: number;
  media_type?: 'movie';
}

export interface TMDBSeries {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  popularity: number;
  media_type: 'tv';
}

export type TMDBContent = TMDBMovie | TMDBSeries;

export interface TMDBSearchResponse<T = TMDBMovie> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMultiSearchResponse extends TMDBSearchResponse<TMDBContent> {}

class TMDBService {
  private api = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
      api_key: TMDB_API_KEY,
    },
  });

  private movieGenres: TMDBGenre[] = [];
  private tvGenres: TMDBGenre[] = [];

  async initializeGenres() {
    try {
      // Load movie genres
      const movieResponse = await this.api.get('/genre/movie/list');
      this.movieGenres = movieResponse.data.genres;
      
      // Load TV show genres
      const tvResponse = await this.api.get('/genre/tv/list');
      this.tvGenres = tvResponse.data.genres;
    } catch (error) {
      console.error('Failed to load genres:', error);
      // Fallback genres
      this.movieGenres = [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
      ];
      
      this.tvGenres = [
        { id: 10759, name: 'Action & Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 10762, name: 'Kids' },
        { id: 9648, name: 'Mystery' },
        { id: 10763, name: 'News' },
        { id: 10764, name: 'Reality' },
        { id: 10765, name: 'Sci-Fi & Fantasy' },
        { id: 10766, name: 'Soap' },
        { id: 10767, name: 'Talk' },
        { id: 10768, name: 'War & Politics' },
        { id: 37, name: 'Western' }
      ];
    }
  }

  public getGenreName(id: number, mediaType: 'movie' | 'tv' = 'movie'): string {
    const genreMap = mediaType === 'movie' ? this.movieGenres : this.tvGenres;
    const genre = genreMap.find(g => g.id === id);
    return genre ? genre.name : 'Unknown';
  }

  async getRecommendations(mediaType: 'movie' | 'tv', id: number): Promise<TMDBSearchResponse> {
    try {
      const response = await this.api.get(`/${mediaType}/${id}/recommendations`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get recommendations for ${mediaType} ${id}:`, error);
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  }

  getPosterUrl(posterPath: string | null): string | null {
    return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : null;
  }

  async searchMovies(query: string, page: number = 1, mediaType: 'movie' | 'tv' | 'multi' = 'movie'): Promise<TMDBSearchResponse<TMDBContent>> {
    try {
      const endpoint = mediaType === 'multi' ? '/search/multi' : `/search/${mediaType}`;
      const response = await this.api.get(endpoint, {
        params: {
          query,
          page,
          include_adult: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Search failed:', error);
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }
  }

  async getPopularMovies(page: number = 1, mediaType: 'movie' | 'tv' = 'movie'): Promise<TMDBSearchResponse<TMDBContent>> {
    try {
      const response = await this.api.get(`/${mediaType}/popular`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get popular ${mediaType}:`, error);
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }
  }

  async getTrendingContent(timeWindow: 'day' | 'week' = 'week', mediaType: 'all' | 'movie' | 'tv' | 'person' = 'all'): Promise<TMDBSearchResponse<TMDBContent>> {
    try {
      const response = await this.api.get(`/trending/${mediaType}/${timeWindow}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get trending content:', error);
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }
  }

  async getMovieDetails(movieId: number) {
    try {
      const response = await this.api.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get movie details:', error);
      return null;
    }
  }

  async discoverContent(
    mediaType: 'movie' | 'tv' = 'movie',
    params: {
      genre?: number;
      year?: number;
      sortBy?: string;
      page?: number;
    } = {}
  ): Promise<TMDBSearchResponse<TMDBContent>> {
    try {
      const response = await this.api.get(`/discover/${mediaType}`, {
        params: {
          sort_by: params.sortBy || 'popularity.desc',
          page: params.page || 1,
          with_genres: params.genre,
          [mediaType === 'movie' ? 'year' : 'first_air_date_year']: params.year,
          include_adult: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Discovery failed:', error);
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };
    }
  }
}

export const tmdbService = new TMDBService();