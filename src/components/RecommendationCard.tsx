import React from 'react';
import { Recommendation } from '../types/movie';
import { Star, Calendar, Tag } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, index }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Strong Match': return 'bg-green-500';
      case 'Hidden Gem': return 'bg-purple-500';
      case 'Surprising Pick': return 'bg-amber-500';
      case 'Recent Release': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const posterUrl = recommendation.poster ? `https://image.tmdb.org/t/p/w500${recommendation.poster}` : 'https://via.placeholder.com/500x750.png?text=No+Image';

  return (
    <div
      className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 flex flex-col"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative">
        <img src={posterUrl} alt={recommendation.title} className="w-full h-auto object-cover" />
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(recommendation.category)}`}>
          {recommendation.category}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{recommendation.title}</h3>
          <div className="flex items-center text-gray-400 text-sm mb-2">
            <Calendar size={14} className="mr-1" />
            <span>{recommendation.year}</span>
            {recommendation.genre && (
              <>
                <span className="mx-2">•</span>
                <Tag size={14} className="mr-1" />
                <span>{recommendation.genre}</span>
              </>
            )}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">{recommendation.reason}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-amber-400">
            <Star size={14} className="mr-1 fill-current" />
            <span className="text-sm font-medium">TMDB ID: {recommendation.tmdb_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};