import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Loader2, TrendingUp, Star, Tv, Film } from 'lucide-react';
import { Movie } from '../types/movie';
import { tmdbService, TMDBContent } from '../services/tmdbApi';
import { MovieCard } from './MovieCard';

interface MovieSearchProps {
  selectedMovies: Movie[];
  onMovieToggle: (movie: Movie) => void;
}

type MediaType = 'movie' | 'tv';
type ViewType = 'popular' | 'trending' | 'search';

export const MovieSearch: React.FC<MovieSearchProps> = ({ selectedMovies, onMovieToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [content, setContent] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('popular');
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [hasSearched, setHasSearched] = useState(false);

  // Convert TMDB content to our Movie interface
  const convertTMDBContent = (tmdbContent: TMDBContent): Movie => {
    const isTV = 'name' in tmdbContent;
    
    return {
      id: tmdbContent.id,
      title: isTV ? tmdbContent.name : tmdbContent.title,
      year: (isTV ? tmdbContent.first_air_date : tmdbContent.release_date) 
        ? new Date((isTV ? tmdbContent.first_air_date : tmdbContent.release_date) as string).getFullYear() 
        : 0,
      genre: tmdbContent.genre_ids && tmdbContent.genre_ids.length > 0 
        ? tmdbService.getGenreName(tmdbContent.genre_ids[0], isTV ? 'tv' : 'movie')
        : 'Unknown',
      tmdb_id: tmdbContent.id,
      poster_path: tmdbContent.poster_path,
      overview: tmdbContent.overview,
      vote_average: tmdbContent.vote_average,
      popularity: tmdbContent.popularity,
      genre_ids: tmdbContent.genre_ids,
      media_type: isTV ? 'tv' : 'movie',
    };
  };

  // Initialize genres and load popular content
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await tmdbService.initializeGenres();
      await loadPopularContent();
      setLoading(false);
    };
    initialize();
  }, [mediaType]);

  const loadPopularContent = async () => {
    try {
      const response = await tmdbService.getPopularMovies(1, mediaType);
      const convertedContent = response.results.map(convertTMDBContent);
      setContent(convertedContent);
      setCurrentView('popular');
    } catch (error) {
      console.error(`Failed to load popular ${mediaType}:`, error);
    }
  };

  const loadTrendingContent = async () => {
    try {
      const response = await tmdbService.getTrendingContent('week', mediaType === 'movie' ? 'movie' : 'tv');
      const convertedContent = response.results
        .filter((item: TMDBContent) => 'media_type' in item && item.media_type === mediaType)
        .map(convertTMDBContent);
      setContent(convertedContent);
      setCurrentView('trending');
    } catch (error) {
      console.error(`Failed to load trending ${mediaType}:`, error);
    }
  };

  const searchContent = async (query: string) => {
    if (!query.trim()) {
      await loadPopularContent();
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await tmdbService.searchMovies(query, 1, mediaType);
      const convertedContent = response.results.map(convertTMDBContent);
      setContent(convertedContent);
      setCurrentView('search');
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchContent(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchContent(searchTerm);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    loadPopularContent();
    setHasSearched(false);
  };

  const toggleMediaType = (type: MediaType) => {
    if (type !== mediaType) {
      setMediaType(type);
      setSearchTerm('');
      setHasSearched(false);
    }
  };

  const isSelected = (content: Movie) => selectedMovies.some(m => m.id === content.id);

  const displayedContent = useMemo(() => {
    return content.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [content, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex mb-4 border-b border-gray-700">
          <button
            onClick={() => toggleMediaType('movie')}
            className={`flex items-center px-4 py-2 ${mediaType === 'movie' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'} font-medium`}
          >
            <Film size={16} className="mr-2" />
            Movies
          </button>
          <button
            onClick={() => toggleMediaType('tv')}
            className={`flex items-center px-4 py-2 ${mediaType === 'tv' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'} font-medium`}
          >
            <Tv size={16} className="mr-2" />
            TV Shows
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={`Search for ${mediaType === 'movie' ? 'movies' : 'TV shows'}...`}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>
          )}
        </form>
      </div>

      {/* View Toggle Buttons */}
      {!hasSearched && (
        <div className="flex gap-2">
          <button
            onClick={loadPopularContent}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'popular'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Star size={16} className="mr-2" />
            Popular {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
          </button>
          <button
            onClick={loadTrendingContent}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'trending'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingUp size={16} className="mr-2" />
            Trending {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
          </button>
        </div>
      )}

      {/* Selected Movies */}
      {selectedMovies.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            Selected Movies ({selectedMovies.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedMovies.map(movie => (
              <span
                key={movie.id}
                className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center cursor-pointer hover:bg-purple-700 transition-colors"
                onClick={() => onMovieToggle(movie)}
              >
                {movie.title}
                <X size={14} className="ml-2" />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {hasSearched && searchTerm 
              ? `Search Results for "${searchTerm}"` 
              : currentView === 'trending' 
                ? `Trending ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`
                : `Popular ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`}
          </h3>
          <span className="text-sm text-gray-400">
            {content.length} {mediaType === 'movie' ? 'movie' : 'TV show'}{content.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="ml-3 text-gray-400">Loading {mediaType === 'movie' ? 'movies' : 'TV shows'}...</span>
          </div>
        ) : displayedContent.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              {hasSearched 
                ? `No ${mediaType === 'movie' ? 'movies' : 'TV shows'} found`
                : `Failed to load ${mediaType === 'movie' ? 'movies' : 'TV shows'}`}
            </div>
            {hasSearched && (
              <button
                onClick={clearSearch}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                View popular {mediaType === 'movie' ? 'movies' : 'TV shows'} instead
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedContent.map((item) => (
              <MovieCard
                key={`${item.media_type || 'movie'}-${item.id}`}
                movie={item}
                isSelected={isSelected(item)}
                onToggle={onMovieToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSearch;