import { useState } from "react";
import { Film, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Movie, AnalysisResult } from "./types/movie";
import { MovieAnalyzer } from "./utils/movieAnalyzer";
import { MovieSearch } from "./components/MovieSearch";
import { TasteProfile } from "./components/TasteProfile";
import { RecommendationCard } from "./components/RecommendationCard";
import { FeedbackButton } from "./components/FeedbackButton";

function App() {
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzer = new MovieAnalyzer();

  const handleMovieToggle = (movie: Movie) => {
    setSelectedMovies((prev) => {
      const isSelected = prev.some((m) => m.id === movie.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = await analyzer.analyzeMovies(selectedMovies);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setSelectedMovies([]);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div
                className="p-1 rounded-full bg-gradient-to-r from-orange-400 via-yellow-400 to-blue-400"
                style={{ transform: "rotate(45deg)" }}
              >
                <div
                  className="bg-gray-900 rounded-full p-2"
                  style={{ transform: "rotate(-45deg)" }}
                >
                  <img
                    src="/logo.png"
                    alt="Cine-Sage Logo"
                    className="w-12 h-12"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              Cine-Sage
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Your AI-powered film analyst and recommendation engine. Discover
              your unique cinematic taste and get personalized movie
              suggestions.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-400">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="flex items-center justify-between">
                Powered by advanced film analysis •
                <span className="flex items-center justify-between hover:underline hover:cursor-pointer transition-all duration-300 ease-in-out">
                  <svg
                    className="w-6 h-6 text-gray-400 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.07 1 5.07 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  <a
                    href="https://github.com/deborah-sylvia"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @deborah-sylvia
                  </a>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 py-4 mt-4">
        {!analysis ? (
          <div className="space-y-8">
            {/* Selection Phase */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Film className="w-6 h-6 mr-3 text-purple-400" />
                Search & Select Your Favorite Movies
              </h2>
              <p className="text-gray-300 mb-6">
                Search from thousands of movies and select at least 3 that you
                love to help me understand your taste preferences.
              </p>

              <MovieSearch
                selectedMovies={selectedMovies}
                onMovieToggle={handleMovieToggle}
              />
            </div>

            {/* Analysis Button */}
            {selectedMovies.length >= 3 && (
              <div className="text-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Your Taste...
                    </>
                  ) : (
                    <>
                      Generate Recommendations
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
                <p className="text-gray-400 text-sm mt-3">
                  {selectedMovies.length} movie
                  {selectedMovies.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 mr-3 text-amber-400" />
                Your Personalized Analysis
              </h2>
              <button
                onClick={handleReset}
                className="text-purple-400 hover:text-purple-300 underline flex items-center mx-auto"
              >
                Start Over
                <RefreshCw className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Taste Profile */}
            <TasteProfile
              tasteProfile={analysis.taste_profile}
              recommendations={analysis.recommendations}
              selectedMovies={selectedMovies}
            />

            {/* Recommendations */}
            {/* <div>
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Your 7 Movie Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.recommendations.map((recommendation, index) => (
                  <RecommendationCard
                    key={recommendation.tmdb_id}
                    recommendation={recommendation}
                    index={index}
                  />
                ))}
              </div>
            </div> */}

            {/* JSON Export */}
            {/* <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="bg-green-500 w-3 h-3 rounded-full mr-2"></span>
                JSON Output for Developers
              </h3>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 border border-gray-600">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </div> */}
          </div>
        )}
      </div>
      <FeedbackButton />
    </div>
  );
}

export default App;
