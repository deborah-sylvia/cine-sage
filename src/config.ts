// Configuration for TMDB API
// This file is loaded directly to avoid Vite environment variable issues

export const TMDB_CONFIG = {
  API_KEY: '8f791a769488232a439b2b979fd8389c', // From .env file
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
} as const;

console.log('TMDB Config loaded:', {
  ...TMDB_CONFIG,
  API_KEY: TMDB_CONFIG.API_KEY ? `***${TMDB_CONFIG.API_KEY.slice(-4)}` : 'Not set',
});
