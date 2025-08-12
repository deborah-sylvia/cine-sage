import React, { useState, useMemo, useEffect } from "react";
import { Search, X, Loader2, ThumbsDown } from "lucide-react";
import { Movie } from "../types/movie";
import { tmdbService, TMDBContent } from "../services/tmdbApi";
import { MovieCard } from "./MovieCard";

interface MovieSearchProps {
  selectedMovies: Movie[];
  hatedMovies: Movie[];
  onMovieToggle: (movie: Movie) => void;
  onHateToggle: (movie: Movie) => void;
  showHateList: boolean;
  onToggleHateList: () => void;
}

export const MovieSearch: React.FC<MovieSearchProps> = ({
  selectedMovies,
  hatedMovies,
  onMovieToggle,
  onHateToggle,
  showHateList,
  onToggleHateList,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);

  // Convert TMDB content to our Movie interface
  const convertTMDBContent = (tmdbContent: TMDBContent): Movie => {
    const isTV = "name" in tmdbContent;

    return {
      id: tmdbContent.id,
      title: isTV ? tmdbContent.name : tmdbContent.title,
      year: (isTV ? tmdbContent.first_air_date : tmdbContent.release_date)
        ? new Date(
            (isTV
              ? tmdbContent.first_air_date
              : tmdbContent.release_date) as string
          ).getFullYear()
        : 0,
      genre:
        tmdbContent.genre_ids && tmdbContent.genre_ids.length > 0
          ? tmdbService.getGenreName(
              tmdbContent.genre_ids[0],
              isTV ? "tv" : "movie"
            )
          : "Unknown",
      tmdb_id: tmdbContent.id,
      poster_path: tmdbContent.poster_path,
      overview: tmdbContent.overview,
      vote_average: tmdbContent.vote_average,
      popularity: tmdbContent.popularity,
      genre_ids: tmdbContent.genre_ids,
      media_type: isTV ? "tv" : "movie",
    };
  };

  // Initialize genres and load initial content
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await tmdbService.initializeGenres();
      // Load popular content by default - both movies and TV shows
      const [moviesResponse, tvResponse] = await Promise.all([
        tmdbService.getPopularMovies(1, "movie"),
        tmdbService.getPopularMovies(1, "tv")
      ]);
      
      const allContent = [
        ...moviesResponse.results.map(convertTMDBContent),
        ...tvResponse.results.map(convertTMDBContent)
      ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      
      setContent(allContent);
      setLoading(false);
    };
    initialize();
  }, []);

  const searchContent = async (query: string) => {
    if (!query.trim()) {
      // If search is empty, show popular content - both movies and TV shows
      setLoading(true);
      const [moviesResponse, tvResponse] = await Promise.all([
        tmdbService.getPopularMovies(1, "movie"),
        tmdbService.getPopularMovies(1, "tv")
      ]);
      
      const allContent = [
        ...moviesResponse.results.map(convertTMDBContent),
        ...tvResponse.results.map(convertTMDBContent)
      ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      
      setContent(allContent);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      // Search across both movies and TV shows
      const response = await tmdbService.searchMovies(query, 1, "multi");

      // Convert and sort by popularity
      const convertedContent = response.results
        .filter(
          (item: any) => item.media_type === "movie" || item.media_type === "tv"
        )
        .map(convertTMDBContent)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      setContent(convertedContent);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setLoading(false);
  };

  // Search when searchTerm changes
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
    setSearchTerm("");
    setContent([]);
    setHasSearched(false);
  };

  const isSelected = (content: Movie) =>
    selectedMovies.some((m) => m.id === content.id);
    
  const isHated = (content: Movie) =>
    hatedMovies.some((m) => m.id === content.id);

  const displayedContent = useMemo(() => {
    if (showHateList) {
      return hatedMovies;
    }
    return content.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [content, searchTerm, showHateList, hatedMovies]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search for movies and TV shows..."
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          {showHateList 
            ? 'Hated Movies & Shows' 
            : searchTerm 
              ? `Search Results for "${searchTerm}"` 
              : 'Popular Movies & Shows'}
        </h2>
        <button
          type="button"
          onClick={onToggleHateList}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            showHateList
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <ThumbsDown className="h-5 w-5" />
          {hatedMovies.length > 0 && (
            <span className="bg-white text-red-600 rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {hatedMovies.length}
            </span>
          )}
          <span>Hate List</span>
        </button>
      </div>

      {/* Selected Movies */}
      {selectedMovies.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            Selected Movies ({selectedMovies.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedMovies.map((movie) => (
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="ml-3 text-gray-400">Loading...</span>
          </div>
        ) : displayedContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-center py-8">
              {loading ? "Searching..." : "No content found."}
            </p>
            {hasSearched && (
              <button
                onClick={clearSearch}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                View popular content instead
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedContent.map((item) => (
              <MovieCard
                key={item.id}
                movie={item}
                isSelected={isSelected(item)}
                isHated={isHated(item)}
                onToggle={onMovieToggle}
                onHateToggle={onHateToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSearch;
