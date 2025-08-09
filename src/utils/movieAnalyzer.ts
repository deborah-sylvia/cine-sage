import { Movie, Recommendation, AnalysisResult } from '../types/movie';
import { tmdbService, TMDBContent } from '../services/tmdbApi';
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

    const recommendationPromises = movies.map(movie => 
      tmdbService.getRecommendations(movie.media_type || 'movie', movie.tmdb_id)
    );

    const recommendationResponses = await Promise.all(recommendationPromises);
    const allRecommendedContent = recommendationResponses.flatMap(res => res.results);

    const recommendationCounts: { [key: number]: { count: number, content: TMDBContent } } = {};

    for (const content of allRecommendedContent) {
      if (movies.some(m => m.tmdb_id === content.id)) continue;

      if (recommendationCounts[content.id]) {
        recommendationCounts[content.id].count++;
      } else {
        recommendationCounts[content.id] = { count: 1, content };
      }
    }

    const rankedRecommendations = Object.values(recommendationCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const finalRecommendations: Recommendation[] = rankedRecommendations.map(({ content, count }) => {
      const mediaType = 'title' in content ? 'movie' : 'tv';
      const title = 'title' in content ? content.title : content.name;
      const releaseDate = 'release_date' in content ? content.release_date : content.first_air_date;
      const year = releaseDate ? new Date(releaseDate).getFullYear() : 0;

      return {
        tmdb_id: content.id,
        title: title || 'Unknown Title',
        year: year,
        reason: `Recommended based on ${count} of your selection${count > 1 ? 's' : ''}.`,
        category: count > 1 ? 'Strong Match' : 'Surprising Pick',
        genre: content.genre_ids && content.genre_ids.length > 0 
          ? tmdbService.getGenreName(content.genre_ids[0], mediaType) 
          : 'Unknown',
        poster: content.poster_path || undefined,
      };
    });

    return finalRecommendations.slice(0, 7);
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