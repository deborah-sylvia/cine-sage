import { Movie } from '../types/movie';

export const systemPrompt = `You are a movie recommendation expert. Analyze the user's movie preferences and provide personalized recommendations.`;

export const generateMovieRecPrompt = (selectedMovies: Movie[]): string => {
  const movieList = selectedMovies
    .map(movie => `- ${movie.title} (${movie.year}) - ${movie.genre}`)
    .join('\n');

  return `Based on these movies I like, please provide 5 personalized movie recommendations with a short explanation for each:

${movieList}

Format your response as a markdown list with each recommendation including:
1. Movie Title (Year)
2. Brief explanation of why it's recommended
3. Similar themes or elements to the selected movies`;
};
