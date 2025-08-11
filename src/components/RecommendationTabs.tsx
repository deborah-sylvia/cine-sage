import React, {
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
  useRef,
} from "react";
import { AnalysisResult, Movie } from "../types/movie";
import { AIRecommendation } from "../types/aiRecommendation";
import { MovieCard } from "./MovieCard";
import { tmdbService } from "../services/tmdbApi";

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
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-red-400">
            Something went wrong loading recommendations.
          </p>
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

type TabType = "tmdb" | "ai";

interface RecommendationTabsProps {
  tmdbRecommendations: Movie[];
  aiRecommendations: AIRecommendation[];
  loading: boolean;
}

// Helper function to get title from TMDB content
const getTitle = (content: any): string => {
  if (!content) return "";
  return content.title || content.name || "";
};

// Helper function to get release year from TMDB content
const getReleaseYear = (content: any): number => {
  if (!content) return new Date().getFullYear();
  const dateStr = content.release_date || content.first_air_date;
  return dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
};

export const RecommendationTabs: React.FC<RecommendationTabsProps> = ({
  tmdbRecommendations: propTmdbRecommendations,
  aiRecommendations = [],
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("tmdb");
  const [aiMovies, setAiMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Use the prop if provided, otherwise use analysis.recommendations if available
  const tmdbRecommendations =
    propTmdbRecommendations || analysis?.recommendations || [];

  // Store the current recommendations in a ref to avoid dependency issues
  const aiRecsRef = useRef<AIRecommendation[]>([]);

  // Update the ref when aiRecommendations changes
  useEffect(() => {
    // Take all AI recommendations without any limit
    aiRecsRef.current = Array.isArray(aiRecommendations)
      ? [...aiRecommendations]
      : [];

    // If we have recommendations, trigger the effect to load movie details
    if (aiRecsRef.current.length > 0) {
      const loadMovies = async () => {
        const currentAiRecs = [...aiRecsRef.current];
        const movies: Movie[] = [];

        for (const rec of currentAiRecs) {
          if (!rec?.title) continue;

          try {
            const searchResults = await tmdbService.searchMovies(
              rec.title,
              1,
              "movie"
            );
            if (searchResults?.results?.[0]) {
              const bestMatch = searchResults.results[0];
              // Ensure year is always a valid number, default to current year if not available
              const movie: Movie = {
                id: bestMatch.id,
                title: getTitle(bestMatch) || "Unknown Title",
                year:
                  typeof rec.year === "number"
                    ? rec.year
                    : getReleaseYear(bestMatch),
                genre: rec.category || "Unknown",
                tmdb_id: bestMatch.id,
                overview:
                  rec.why ||
                  bestMatch.overview ||
                  "Recommended based on your preferences",
                poster_path: bestMatch.poster_path,
                vote_average:
                  typeof bestMatch.vote_average === "number"
                    ? bestMatch.vote_average
                    : undefined,
                genre_ids: bestMatch.genre_ids || [],
                media_type: "movie",
                popularity: bestMatch.popularity || 0,
              };
              movies.push(movie);
            }
          } catch (error) {
            console.error("Error processing AI recommendation:", error);
          }
        }

        setAiMovies(movies);
        setIsLoading(false);
      };

      setIsLoading(true);
      loadMovies();
    } else {
      setAiMovies([]);
      setIsLoading(false);
    }
  }, [aiRecommendations]);

  // Normalize string for comparison (removes special chars and converts to lowercase)
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  };

  // Render loading state
  if (loading || (activeTab === "ai" && isLoading)) {
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
            onClick={() => setActiveTab("tmdb")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tmdb"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
            }`}
          >
            TMDB Recommendations
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "ai"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
            }`}
            disabled={aiRecommendations.length === 0}
          >
            AI-Powered Picks
          </button>
        </nav>
      </div>

      <div className="mt-4">
        <ErrorBoundary>
          {activeTab === "tmdb" ? (
            tmdbRecommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
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
                <p className="text-gray-400">
                  No TMDB recommendations available. Try selecting different
                  movies.
                </p>
              </div>
            )
          ) : aiMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
              {aiMovies.map((movie, index) => (
                <div key={`ai-${movie.id}-${index}`} className="relative group">
                  <MovieCard
                    movie={movie}
                    isSelected={false}
                    onToggle={() => {}}
                  />
                  {aiRecommendations[index]?.why && (
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 text-sm text-gray-200 overflow-auto pointer-events-none">
                      <h4 className="font-semibold text-amber-400 mb-2">
                        Why we recommend this:
                      </h4>
                      <p>{aiRecommendations[index]?.why}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700/50 text-center">
              <p className="text-gray-400">
                No AI recommendations available. Try selecting some movies
                first.
              </p>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default RecommendationTabs;
