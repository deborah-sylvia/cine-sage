import React from 'react';
import { Movie } from '../types/movie';
import { Plus, Check, Star } from 'lucide-react';
import { tmdbService } from '../services/tmdbApi';

interface MovieCardProps {
  movie: Movie;
  isSelected: boolean;
  onToggle: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, isSelected, onToggle }) => {
  const posterUrl = tmdbService.getPosterUrl(movie.poster_path || null);
  const genreName = movie.genre_ids && movie.genre_ids.length > 0 
    ? tmdbService.getGenreName(movie.genre_ids[0]) 
    : movie.genre;

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected ? 'ring-2 ring-amber-400' : ''
      }`}
      onClick={() => onToggle(movie)}
    >
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 h-full">
        {posterUrl && (
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="p-4">
        <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white text-sm leading-tight pr-2 line-clamp-2">{movie.title}</h3>
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? 'bg-amber-400 border-amber-400 text-gray-900'
                : 'border-gray-500 group-hover:border-purple-400'
            }`}
          >
            {isSelected ? <Check size={14} /> : <Plus size={14} className="text-gray-400 group-hover:text-purple-400" />}
          </div>
        </div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{movie.year}</span>
            <span className="bg-gray-700 px-2 py-1 rounded text-xs">{genreName}</span>
          </div>
          {movie.vote_average && movie.vote_average > 0 && (
            <div className="flex items-center text-xs text-amber-400">
              <Star size={12} className="mr-1 fill-current" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};