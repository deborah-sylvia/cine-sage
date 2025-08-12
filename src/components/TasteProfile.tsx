import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AIRecommendation } from "../types/aiRecommendation";
import { RecommendationTabs } from "./RecommendationTabs";
import { Recommendation, Movie } from "../types/movie";
import { MovieCard } from "./MovieCard";

// Helper function to convert Recommendation to Movie
const recommendationToMovie = (rec: Recommendation | Movie): Movie => {
  if ("reason" in rec) {
    // It's a Recommendation
    return {
      id: rec.tmdb_id,
      title: rec.title,
      year: rec.year,
      genre: rec.genre || "Unknown",
      tmdb_id: rec.tmdb_id,
      poster_path: rec.poster_path || rec.poster || null,
      overview: rec.overview || rec.reason || "",
      vote_average: rec.vote_average,
      popularity: rec.popularity,
      genre_ids: rec.genre_ids || [],
      media_type: rec.media_type || "movie",
    };
  }
  // It's already a Movie
  return rec;
};

// Function to parse AI recommendations from markdown text
const parseAIRecommendations = (text: string): AIRecommendation[] => {
  if (!text) return [];

  const recommendations: AIRecommendation[] = [];
  console.log("Raw AI response:", text); // Debug log

  // First try to find the AI insights section if it exists
  const aiInsightsMatch = text.includes("**AI-Powered Insights**")
    ? text.split("**AI-Powered Insights**")[1]
    : text;

  // First try to match the exact format we're seeing
  const numberedItems = aiInsightsMatch.match(/\d+\.\s*\*\*[^*]+\*\*/g);

  if (numberedItems && numberedItems.length > 0) {
    console.log("Found numbered items:", numberedItems);

    for (const item of numberedItems) {
      // Extract title and year using a more flexible pattern
      const titleMatch = item.match(/\*\*([^*]+?)(?:\s*\((\d{4})\))?\*\*/);
      if (!titleMatch) continue;

      let title = titleMatch[1].trim();
      const year = titleMatch[2] ? parseInt(titleMatch[2]) : undefined;

      // Get the description by finding the content after the title
      const descriptionStart = item.indexOf("**", titleMatch[0].length) + 2;
      const description =
        descriptionStart > 1
          ? item.substring(descriptionStart).trim()
          : "Recommended based on your preferences";

      console.log("Parsed item:", { title, year, description });

      recommendations.push({
        title,
        year,
        type: "Movie",
        category: "Safe Bet",
        why: description,
        similarElements: [],
        contentNote: undefined,
        whereToWatch: undefined,
      });
    }
  } else {
    // Fallback: Try to extract from markdown headers
    console.log("No numbered items found, trying markdown headers");
    const headerSections = aiInsightsMatch.split(/###/).slice(1);

    for (const section of headerSections) {
      const titleMatch = section.match(/\*\*([^*]+?)(?:\s*\((\d{4})\))?\*\*/);
      if (!titleMatch) continue;

      const title = titleMatch[1].trim();
      const year = titleMatch[2] ? parseInt(titleMatch[2]) : undefined;
      const description = section.split("\n").slice(1).join(" ").trim();

      recommendations.push({
        title,
        year,
        type: "Movie",
        category: "Safe Bet",
        why: description || "Recommended based on your preferences",
        similarElements: [],
        contentNote: undefined,
        whereToWatch: undefined,
      });
    }
  }

  // If we didn't find any recommendations in the numbered list format,
  // try to extract from the markdown headers (###)
  if (recommendations.length === 0) {
    const headerSections = aiInsightsMatch.split(/###/).slice(1);

    for (const section of headerSections) {
      const titleMatch = section.match(/\*\*([^*]+?)(?:\s*\((\d{4})\))?\*\*/);
      if (!titleMatch) continue;

      const title = titleMatch[1].trim();
      const year = titleMatch[2] ? parseInt(titleMatch[2]) : undefined;
      const description = section.split("\n").slice(1).join(" ").trim();

      recommendations.push({
        title,
        year,
        type: "Movie",
        category: "Safe Bet",
        why: description || "Recommended based on your preferences",
        similarElements: [],
        contentNote: undefined,
        whereToWatch: undefined,
      });
    }
  }

  return recommendations;
};

// Simple markdown to JSX converter for basic formatting
const formatText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Remove markdown headers (###, ##, #) at the start of lines
  const cleanText = text.replace(/^#+\s*/gm, "");

  // Split by double newlines to handle paragraphs
  return cleanText.split("\n\n").map((paragraph, i) => {
    // Skip empty paragraphs
    if (!paragraph.trim()) return null;

    // Process bold text
    const parts: (string | JSX.Element)[] = [];
    let remaining = paragraph;
    let key = 0;

    while (remaining) {
      const boldStart = remaining.indexOf("**");

      if (boldStart === -1) {
        // No more bold markers, add remaining text
        if (remaining) parts.push(remaining);
        break;
      }

      // Add text before the bold section
      if (boldStart > 0) {
        parts.push(remaining.substring(0, boldStart));
      }

      // Find the end of the bold section
      const afterBoldStart = remaining.substring(boldStart + 2);
      const boldEnd = afterBoldStart.indexOf("**");

      if (boldEnd === -1) {
        // No closing **, treat as regular text
        parts.push("**" + afterBoldStart);
        break;
      }

      // Add the bold text
      const boldText = afterBoldStart.substring(0, boldEnd);
      parts.push(<strong key={`bold-${i}-${key++}`}>{boldText}</strong>);

      // Continue with the rest of the text
      remaining = afterBoldStart.substring(boldEnd + 2);
    }

    return (
      <p key={i} className="mb-4 text-gray-200">
        {parts}
      </p>
    );
  });
};

interface TasteProfileProps {
  tasteProfile: string;
  recommendations: (Recommendation | Movie)[];
  selectedMovies: Movie[];
  hatedMovies?: Movie[];
  onHateToggle?: (movie: Movie) => void;
}

export const TasteProfile: React.FC<TasteProfileProps> = ({
  tasteProfile,
  recommendations,
  selectedMovies,
  hatedMovies = [],
  onHateToggle = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSelectedMovies, setShowSelectedMovies] = useState(false);
  // State for AI recommendations (not currently used but keeping for future use)
  const [aiRecommendations, setAiRecommendations] = useState<
    AIRecommendation[]
  >([]);
  // tmdbMovies state removed as it's not being used

  useEffect(() => {
    // Parse AI recommendations from the taste profile text
    const parsedRecs = parseAIRecommendations(tasteProfile);
    setAiRecommendations(parsedRecs);
  }, [tasteProfile]);

  return (
    <div className="space-y-6">
      {/* Selected Movies */}
      {selectedMovies.length > 0 && (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <button
            onClick={() => setShowSelectedMovies(!showSelectedMovies)}
            className="w-full px-6 py-4 text-left transition-colors duration-200 hover:bg-gray-700/50 flex items-center justify-between"
            aria-expanded={showSelectedMovies}
          >
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-white">
                Your Selected Movies & Shows
              </h2>
              <span className="ml-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {selectedMovies.length}
              </span>
            </div>
            {showSelectedMovies ? (
              <ChevronUp className="text-gray-400" />
            ) : (
              <ChevronDown className="text-gray-400" />
            )}
          </button>

          <div className="transition-all duration-300 ease-in-out overflow-hidden">
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700"
                  >
                    <MovieCard
                      movie={movie}
                      isSelected={false}
                      isHated={hatedMovies.some((m) => m.id === movie.id)}
                      onToggle={() => {}}
                      onHateToggle={onHateToggle}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Taste Profile */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden transition-all duration-300 hover:border-purple-500/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 text-left transition-colors duration-200 hover:bg-gray-700/50 flex items-center justify-between"
          aria-expanded={isExpanded}
        >
          <h2 className="text-xl font-bold text-white">Your Taste Profile</h2>
          {isExpanded ? (
            <ChevronUp className="text-gray-400" />
          ) : (
            <ChevronDown className="text-gray-400" />
          )}
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <div className="p-6 pt-0 ">
            <div className="prose prose-invert text-gray-300">
              {formatText(tasteProfile)}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">
          Recommendations For You
        </h2>
        <RecommendationTabs
          tmdbRecommendations={recommendations.map((rec) =>
            recommendationToMovie(rec)
          )}
          aiRecommendations={aiRecommendations}
          loading={false}
        />
      </div>
    </div>
  );
};
