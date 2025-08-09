import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Movie } from '../types/movie';
import { AIRecommendation } from '../types/aiRecommendation';
import { MovieCard } from './MovieCard';
import { tmdbService } from '../services/tmdbApi';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-red-400">Something went wrong loading recommendations.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 bg-red-700/50 hover:bg-red-600/50 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

type TabType = 'tmdb' | 'ai';

interface RecommendationTabsProps {
  tmdbRecommendations: Movie[];
  aiRecommendations: AIRecommendation[];
  loading: boolean;
}

export const RecommendationTabs: React.FC<RecommendationTabsProps> = ({
  tmdbRecommendations = [],
  aiRecommendations = [],
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tmdb');
  const [aiMovies, setAiMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch movie details for AI recommendations
  useEffect(() => {
    if (!aiRecommendations || aiRecommendations.length === 0) {
      setAiMovies([]);
      return;
    }
    
    let isMounted = true;
    setIsLoading(true);
    
    const fetchAiMovies = async () => {
      const movies: Movie[] = [];
      
      for (const rec of aiRecommendations) {
        try {
          // Skip if no title
          if (!rec?.title) continue;
          
          // Try to find the movie in TMDB
          const searchResults = await tmdbService.searchMovies(rec.title, 1, 'movie');
          let movie: Movie;
          
          if (searchResults?.results?.[0]) {
            const tmdbMovie = searchResults.results[0];
            // Handle both movie and TV show types
            const releaseYear = 'release_date' in tmdbMovie && tmdbMovie.release_date 
              ? new Date(tmdbMovie.release_date).getFullYear()
              : 'first_air_date' in tmdbMovie && tmdbMovie.first_air_date
                ? new Date(tmdbMovie.first_air_date).getFullYear()
                : 0;
                
            movie = {
              id: tmdbMovie.id,
              title: rec.title,
              year: rec.year || releaseYear || 0,
              genre: rec.category || 'Unknown',
              tmdb_id: tmdbMovie.id,
              overview: rec.why || tmdbMovie.overview || 'Recommended based on your preferences',
              poster_path: tmdbMovie.poster_path,
              vote_average: tmdbMovie.vote_average || 0,
              genre_ids: tmdbMovie.genre_ids || [],
              media_type: 'movie',
              popularity: tmdbMovie.popularity || 0,
            };
          } else {
            // Fallback if movie not found in TMDB
            movie = {
              id: Math.floor(Math.random() * 1000000) + 1000,
              title: rec.title,
              year: rec.year || new Date().getFullYear(),
              genre: rec.category || 'Unknown',
              tmdb_id: 0,
              overview: rec.why || 'Recommended based on your preferences',
              poster_path: undefined,
              vote_average: 0,
              genre_ids: [],
              media_type: 'movie',
              popularity: 0,
            };
          }
          
          movies.push(movie);
        } catch (error) {
          console.error('Error fetching movie details:', error);
        }
      }
      
      if (isMounted) {
        setAiMovies(movies);
        setIsLoading(false);
      }
    };
    
    fetchAiMovies();
    
    return () => {
      isMounted = false;
    };
  }, [aiRecommendations]);

  // Render loading state
  if (loading || (activeTab === 'ai' && isLoading)) {
    return (
      <div className="mt-8 text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-400 border-t-transparent"></div>
        <p className="mt-2 text-gray-400">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tmdb')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tmdb'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
            }`}
          >
            TMDB Recommendations
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
            }`}
            disabled={aiRecommendations.length === 0}
          >
            AI-Powered Picks
          </button>
        </nav>
      </div>

      <div className="mt-4">
        <ErrorBoundary>
          {activeTab === 'tmdb' ? (
            tmdbRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tmdbRecommendations.map((movie) => (
                  <MovieCard 
                    key={`tmdb-${movie.id}`}
                    movie={movie}
                    isSelected={false}
                    onToggle={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/50 text-center">
                <p className="text-gray-400">No TMDB recommendations available. Try selecting different movies.</p>
              </div>
            )
          ) : aiMovies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {aiMovies.map((movie, index) => (
                <div key={`ai-${movie.id}-${index}`} className="relative group">
                  <MovieCard 
                    movie={movie}
                    isSelected={false}
                    onToggle={() => {}}
                  />
                  {aiRecommendations[index]?.why && (
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 text-sm text-gray-200 overflow-auto pointer-events-none">
                      <h4 className="font-semibold text-amber-400 mb-2">Why we recommend this:</h4>
                      <p>{aiRecommendations[index]?.why}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/50 text-center">
              <p className="text-gray-400">No AI recommendations available. Try selecting some movies first.</p>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default RecommendationTabs;
