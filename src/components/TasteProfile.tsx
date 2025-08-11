import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Film,
  BarChart2,
} from "lucide-react";
import { AIRecommendation } from "../types/aiRecommendation";
import { RecommendationTabs } from "./RecommendationTabs";
import { Recommendation, Movie } from "../types/movie";
import { MovieCard } from "./MovieCard";
import { tmdbService } from "../services/tmdbApi";

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
  recommendations: Recommendation[];
  selectedMovies: Movie[];
}

export const TasteProfile: React.FC<TasteProfileProps> = ({
  tasteProfile,
  recommendations,
  selectedMovies,
}) => {
  const [aiRecommendations, setAiRecommendations] = useState<
    AIRecommendation[]
  >([]);
  const [tmdbMovies, setTmdbMovies] = useState<Movie[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSelectedMovies, setShowSelectedMovies] = useState(false);

  useEffect(() => {
    // Parse AI recommendations from the taste profile text
    const parsedRecs = parseAIRecommendations(tasteProfile);
    setAiRecommendations(parsedRecs);

    const loadRecs = async () => {
      // Convert TMDB recommendations to Movie format with fresh TMDB details
      const movies = await Promise.all(
        recommendations.map(async (rec) => {
          // Prefer exact-id lookup; if not found, fall back to a multi search by title
          let details = await tmdbService.getAnyDetailsById(rec.tmdb_id);
          if (!details) {
            try {
              const search = await tmdbService.searchMovies(
                rec.title,
                1,
                "multi"
              );
              details = search.results?.[0] as any;
            } catch {}
          }

          const isTV = details && "name" in details;
          const mediaType = isTV ? "tv" : "movie";
          const title = details
            ? isTV
              ? (details as any).name
              : (details as any).title
            : rec.title;

          return {
            id: details?.id ?? rec.tmdb_id,
            title,
            year:
              typeof rec.year === "number"
                ? rec.year
                : details?.release_date || (details as any)?.first_air_date
                ? new Date(
                    (details as any).release_date ||
                      (details as any).first_air_date
                  ).getFullYear()
                : new Date().getFullYear(),
            genre: rec.genre || "Unknown",
            tmdb_id: rec.tmdb_id,
            poster_path: details?.poster_path ?? null,
            overview: rec.reason,
            vote_average:
              typeof (details as any)?.vote_average === "number"
                ? (details as any).vote_average
                : undefined,
            popularity:
              typeof (details as any)?.popularity === "number"
                ? (details as any).popularity
                : undefined,
            genre_ids: (details as any)?.genre_ids || [],
            media_type: mediaType as "movie" | "tv",
          } as Movie;
        })
      );

      setTmdbMovies(movies);
    };

    loadRecs();
  }, [tasteProfile, recommendations]);

  return (
    <div className="space-y-4">
      {/* Selected Movies Dropdown */}
      {selectedMovies.length > 0 && (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden transition-all duration-300 hover:border-purple-500/50">
          <button
            onClick={() => setShowSelectedMovies(!showSelectedMovies)}
            className="w-full px-6 py-4 text-left transition-colors duration-200 hover:bg-gray-700/50 flex items-center justify-between"
          >
            <h2 className="text-lg font-semibold text-white flex items-center">
              <BarChart2 className="w-5 h-5 mr-3 text-purple-400" />
              Your Selected Movies ({selectedMovies.length})
            </h2>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                showSelectedMovies ? "transform rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showSelectedMovies
                ? "max-h-[2000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
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
                      onToggle={() => {}}
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
          <h2 className="text-lg font-semibold text-white flex items-center">
            <BarChart2 className="w-5 h-5 mr-3 text-amber-400" />
            Your Taste Profile
          </h2>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isExpanded ? "transform rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
          role="region"
          aria-labelledby="taste-profile-heading"
        >
          <div className="px-6 pb-6 pt-3 text-gray-200">
            {formatText(tasteProfile)}
          </div>
        </div>
      </div>

      {/* Tabbed Recommendations */}
      <RecommendationTabs
        tmdbRecommendations={tmdbMovies}
        aiRecommendations={aiRecommendations}
        loading={false}
      />
    </div>
  );
};
