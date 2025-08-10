import { Movie, Recommendation, AnalysisResult } from '../types/movie';
import { tmdbService, TMDBContent, TMDBMovie, TMDBSeries } from '../services/tmdbApi';
import { openRouterService } from '../services/openRouterService';

export class MovieAnalyzer {
  private analyzeGenrePreferences(movies: Movie[]): string[] {
    const genreCounts: { [key: string]: number } = {};
    
    movies.forEach(movie => {
      genreCounts[movie.genre] = (genreCounts[movie.genre] || 0) + 1;
    });

    return Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);
  }

  private generateTasteProfile(movies: Movie[]): string {
    if (movies.length === 0) {
      return "Exploring cinematic preferences - ready to discover new favorites across all genres and styles.";
    }

    const genres = this.analyzeGenrePreferences(movies);
    const decades = this.analyzeDecadePreferences(movies);
    
    let profile = "You have sophisticated taste in cinema with a preference for ";
    
    if (genres.length > 0) {
      profile += genres.slice(0, 2).join(" and ").toLowerCase() + " films";
    }

    if (decades.length > 0) {
      profile += `, particularly drawn to ${decades[0]}s classics`;
    }

    profile += ". Your selections suggest an appreciation for strong storytelling, complex characters, and films that challenge conventional narratives.";

    return profile;
  }

  private analyzeDecadePreferences(movies: Movie[]): string[] {
    const decadeCounts: { [key: string]: number } = {};
    
    movies.forEach(movie => {
      const decade = Math.floor(movie.year / 10) * 10;
      const decadeStr = decade.toString();
      decadeCounts[decadeStr] = (decadeCounts[decadeStr] || 0) + 1;
    });

    return Object.entries(decadeCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([decade]) => decade);
  }

  private async selectRecommendations(movies: Movie[]): Promise<Recommendation[]> {
    if (movies.length === 0) return [];

    console.log('Selecting recommendations for movies:', movies.map(m => `${m.title} (${m.id})`));

    // Get recommendations for each movie
    const recommendationPromises = movies.map(movie => {
      console.log(`Fetching recommendations for movie: ${movie.title} (ID: ${movie.tmdb_id}, Type: ${movie.media_type || 'movie'})`);
      return tmdbService.getRecommendations(movie.media_type || 'movie', movie.tmdb_id);
    });

    const recommendationResponses = await Promise.all(recommendationPromises);
    
    // Log the full response for debugging
    console.log('Raw TMDB API responses:', recommendationResponses.map((res, idx) => ({
      movie: movies[idx].title,
      results: res.results.map((r: any) => ({
        id: r.id,
        title: r.title || r.name,
        vote_average: r.vote_average,
        vote_count: r.vote_count,
        media_type: r.media_type
      }))
    })));

    // Flatten all recommendations into a single array and count occurrences
    const recommendationCounts: { [key: number]: { content: TMDBContent; count: number } } = {};
    
    recommendationResponses.forEach((response, index) => {
      if (!response || !response.results) return;
      
      response.results.forEach((content: any) => {
        if (!content || !content.id) return;
        
        // Skip if the content is one of the originally selected movies
        if (movies.some(movie => movie.id === content.id)) return;
        
        // Initialize or increment count for this content
        if (!recommendationCounts[content.id]) {
          recommendationCounts[content.id] = { content, count: 0 };
        }
        recommendationCounts[content.id].count++;
      });
    });
    
    // If no recommendations found, return empty array
    if (Object.keys(recommendationCounts).length === 0) {
      console.warn('No recommendations found');
      return [];
    }

    const rankedRecommendations = Object.values(recommendationCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const finalRecommendations: Recommendation[] = rankedRecommendations.map(({ content, count }) => {
      // Safely extract common properties from TMDB content
      const isMovie = 'title' in content;
      const mediaType = content.media_type || (isMovie ? 'movie' : 'tv');
      const title = isMovie ? content.title : content.name;
      const releaseDate = isMovie ? content.release_date : content.first_air_date;
      const year = releaseDate ? new Date(releaseDate).getFullYear() : 0;
      
      // Safely extract vote information with proper type checking
      const voteAverage = 'vote_average' in content && typeof content.vote_average === 'number' 
        ? content.vote_average 
        : 0;
      
      const voteCount = 'vote_count' in content && typeof content.vote_count === 'number'
        ? content.vote_count
        : 0;
      
      // Debug log to inspect the content object
      console.log('Processing recommendation:', {
        id: content.id,
        title,
        mediaType,
        isMovie,
        voteAverage,
        voteCount,
        hasVoteAverage: 'vote_average' in content,
        hasVoteCount: 'vote_count' in content,
        releaseDate
      });

      // Create the base recommendation object with required fields
      const baseRecommendation = {
        tmdb_id: content.id,
        title: title || 'Unknown Title',
        year: year,
        reason: `Recommended based on ${count} of your selection${count > 1 ? 's' : ''}.`,
        category: count > 1 ? 'Strong Match' as const : 'Surprising Pick' as const,
      };

      // Create additional movie fields
      const movieFields = {
        id: content.id,
        genre: content.genre_ids && content.genre_ids.length > 0 
          ? tmdbService.getGenreName(content.genre_ids[0], mediaType as 'movie' | 'tv')
          : 'Unknown',
        poster_path: content.poster_path || null,
        vote_average: voteAverage,
        genre_ids: content.genre_ids || [],
        media_type: mediaType as 'movie' | 'tv',
        overview: content.overview || '',
        popularity: content.popularity || 0,
      };

      // Add type-specific fields
      const typeSpecificFields = isMovie
        ? {
            release_date: content.release_date,
            original_title: (content as any).original_title || title,
          }
        : {
            first_air_date: (content as any).first_air_date,
            name: (content as any).name,
          };

      // Combine all fields into the final recommendation object
      const recommendation: Recommendation & Partial<Movie> = {
        ...baseRecommendation,
        ...movieFields,
        ...typeSpecificFields,
      };
      
      // Debug log the final recommendation object
      console.log('Created recommendation:', {
        id: recommendation.id,
        title: recommendation.title,
        vote_average: recommendation.vote_average,
        media_type: recommendation.media_type,
        genre: recommendation.genre,
      });
      
      return recommendation;
    });

    return finalRecommendations.slice(0, 10);
  }

  public async analyzeMovies(selectedMovies: Movie[]): Promise<AnalysisResult> {
    const tasteProfile = this.generateTasteProfile(selectedMovies);
    
    // Get both traditional and AI recommendations
    const [traditionalRecs, aiInsights] = await Promise.all([
      this.selectRecommendations(selectedMovies),
      this.getAIInsights(selectedMovies)
    ]);

    // Combine traditional recommendations with AI insights
    const enhancedProfile = `${tasteProfile}\n\n${aiInsights}`;

    return {
      taste_profile: enhancedProfile,
      recommendations: traditionalRecs,
    };
  }

  private async getAIInsights(selectedMovies: Movie[]): Promise<string> {
    try {
      if (selectedMovies.length === 0) return '';
      
      // Get AI-powered insights and recommendations from OpenRouter
      const aiResponse = await openRouterService.generatePersonalizedRecommendations(selectedMovies);
      return `\n**AI-Powered Insights**\n\n${aiResponse}`;
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return '\n*AI insights are currently unavailable. Showing standard recommendations.*';
    }
  }
}