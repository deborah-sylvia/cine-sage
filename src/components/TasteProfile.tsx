import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AIRecommendation } from '../types/aiRecommendation';
import { RecommendationTabs } from './RecommendationTabs';
import { Recommendation, Movie } from '../types/movie';

// Function to parse AI recommendations from markdown text
const parseAIRecommendations = (text: string): AIRecommendation[] => {
  if (!text) return [];
  
  const recommendations: AIRecommendation[] = [];
  console.log('Raw AI response:', text); // Debug log
  
  // First try to find the AI insights section if it exists
  const aiInsightsMatch = text.includes('**AI-Powered Insights**') 
    ? text.split('**AI-Powered Insights**')[1] 
    : text;

  // First try to match the exact format we're seeing
  const numberedItems = aiInsightsMatch.match(/\d+\.\s*\*\*[^*]+\*\*/g);
  
  if (numberedItems && numberedItems.length > 0) {
    console.log('Found numbered items:', numberedItems);
    
    for (const item of numberedItems) {
      // Extract title and year using a more flexible pattern
      const titleMatch = item.match(/\*\*([^*]+?)(?:\s*\((\d{4})\))?\*\*/);
      if (!titleMatch) continue;
      
      let title = titleMatch[1].trim();
      const year = titleMatch[2] ? parseInt(titleMatch[2]) : undefined;
      
      // Get the description by finding the content after the title
      const descriptionStart = item.indexOf('**', titleMatch[0].length) + 2;
      const description = descriptionStart > 1 
        ? item.substring(descriptionStart).trim()
        : 'Recommended based on your preferences';
      
      console.log('Parsed item:', { title, year, description });
      
      recommendations.push({
        title,
        year,
        type: 'Movie',
        category: 'Safe Bet',
        why: description,
        similarElements: [],
        contentNote: undefined,
        whereToWatch: undefined
      });
    }
  } else {
    // Fallback: Try to extract from markdown headers
    console.log('No numbered items found, trying markdown headers');
    const headerSections = aiInsightsMatch.split(/###/).slice(1);
    
    for (const section of headerSections) {
      const titleMatch = section.match(/\*\*([^*]+?)(?:\s*\((\d{4})\))?\*\*/);
      if (!titleMatch) continue;
      
      const title = titleMatch[1].trim();
      const year = titleMatch[2] ? parseInt(titleMatch[2]) : undefined;
      const description = section.split('\n').slice(1).join(' ').trim();
      
      recommendations.push({
        title,
        year,
        type: 'Movie',
        category: 'Safe Bet',
        why: description || 'Recommended based on your preferences',
        similarElements: [],
        contentNote: undefined,
        whereToWatch: undefined
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
      const description = section.split('\n').slice(1).join(' ').trim();
      
      recommendations.push({
        title,
        year,
        type: 'Movie',
        category: 'Safe Bet',
        why: description || 'Recommended based on your preferences',
        similarElements: [],
        contentNote: undefined,
        whereToWatch: undefined
      });
    }
  }
  
  return recommendations;
};

// Simple markdown to JSX converter for basic formatting
const formatText = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Split by double newlines to handle paragraphs
  return text.split('\n\n').map((paragraph, i) => {
    // Simple bold text handling
    const parts: (string | JSX.Element)[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(paragraph)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(paragraph.substring(lastIndex, match.index));
      }
      
      // Add the bold text
      parts.push(<strong key={`bold-${i}-${match.index}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < paragraph.length) {
      parts.push(paragraph.substring(lastIndex));
    }
    
    return (
      <p key={i} className="mb-4">
        {parts}
      </p>
    );
  });
};

interface TasteProfileProps {
  tasteProfile: string;
  recommendations: Recommendation[];
}

export const TasteProfile: React.FC<TasteProfileProps> = ({ tasteProfile, recommendations }) => {
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [tmdbMovies, setTmdbMovies] = useState<Movie[]>([]);
  
  useEffect(() => {
    // Parse AI recommendations from the taste profile text
    const parsedRecs = parseAIRecommendations(tasteProfile);
    setAiRecommendations(parsedRecs);
    
    // Convert TMDB recommendations to Movie format
    const movies = recommendations.map(rec => ({
      id: rec.tmdb_id,
      title: rec.title,
      year: rec.year,
      genre: rec.genre || 'Unknown',
      tmdb_id: rec.tmdb_id,
      poster_path: rec.poster,
      overview: rec.reason,
      vote_average: 0,
      genre_ids: [],
      media_type: 'movie' as const,
    }));
    
    setTmdbMovies(movies);
  }, [tasteProfile, recommendations]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-amber-900/20 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-amber-500 p-2 rounded-lg mr-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            Your Cinematic Taste Profile
            <Sparkles className="w-5 h-5 ml-2 text-amber-400" />
          </h2>
        </div>
        <div className="text-gray-200">
          {formatText(tasteProfile)}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-amber-400" />
          Recommended For You
        </h3>
        
        {/* Tabbed Recommendations */}
        <RecommendationTabs 
          tmdbRecommendations={tmdbMovies}
          aiRecommendations={aiRecommendations}
          loading={false}
        />
      </div>
    </div>
  );
};