import React from "react";
import { Movie } from "../types/movie";
import { Plus, Check, Star, ThumbsDown } from "lucide-react";
import { tmdbService } from "../services/tmdbApi";

interface MovieCardProps {
  movie: Movie;
  isSelected: boolean;
  isHated?: boolean;
  onToggle: (movie: Movie) => void;
  onHateToggle?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isSelected,
  isHated = false,
  onToggle,
  onHateToggle = () => {},
}) => {
  // Debug log to inspect the movie object
  console.log("MovieCard received movie:", {
    id: movie.id,
    title: movie.title,
    vote_average: movie.vote_average,
    vote_count: "vote_count" in movie ? movie.vote_count : "N/A",
    has_poster: !!movie.poster_path,
    media_type: movie.media_type,
  });

  const posterUrl = tmdbService.getPosterUrl(movie.poster_path || null);
  const genreName =
    movie.genre_ids && movie.genre_ids.length > 0
      ? tmdbService.getGenreName(movie.genre_ids[0])
      : movie.genre;

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected ? "ring-2 ring-amber-400" : ""
      }`}
      onClick={() => onToggle(movie)}
    >
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 h-full">
        <div className="relative group">
          <div className="aspect-w-2 aspect-h-3 w-full overflow-hidden rounded-lg bg-gray-700">
            {posterUrl ? (
              <img
                src={posterUrl || ""}
                srcSet={
                  posterUrl
                    ? posterUrl.replace("/w500", "/w185") +
                      " 185w, " +
                      posterUrl.replace("/w500", "/w342") +
                      " 342w, " +
                      posterUrl.replace("/w500", "/w500") +
                      " 500w"
                    : undefined
                }
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 250px"
                loading="lazy"
                decoding="async"
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}
            {/* Hate button */}
            {onHateToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHateToggle(movie);
                }}
                className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                  isHated
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-900/70 text-gray-300 hover:bg-red-900/70 hover:text-white"
                }`}
                aria-label={
                  isHated ? "Remove from hate list" : "Add to hate list"
                }
              >
                <ThumbsDown
                  className={`h-4 w-4 ${isHated ? "fill-current" : ""}`}
                />
              </button>
            )}
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 left-2 bg-purple-600 text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className={`m-3 ${isHated ? "opacity-70" : ""}`}>
            <h3 className="text-sm font-medium text-gray-100 line-clamp-1">
              {movie.title}
            </h3>
            <div className="mt-1 flex justify-between items-center">
              <span className="text-xs text-gray-400">{movie.year}</span>
              {movie.vote_average ? (
                <div className="flex items-center text-xs text-amber-400">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {movie.vote_average.toFixed(1)}
                </div>
              ) : null}
            </div>
            {isHated && (
              <div className="mt-1 text-xs text-red-400 flex items-center">
                <ThumbsDown className="h-3 w-3 mr-1 fill-current" />
                Not interested
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
