import { Movie } from '../types/movie';

export const popularMovies: Movie[] = [
  { id: 1, title: "The Shawshank Redemption", year: 1994, genre: "Drama", tmdb_id: 278 },
  { id: 2, title: "The Dark Knight", year: 2008, genre: "Action", tmdb_id: 155 },
  { id: 3, title: "Pulp Fiction", year: 1994, genre: "Crime", tmdb_id: 680 },
  { id: 4, title: "The Godfather", year: 1972, genre: "Crime", tmdb_id: 238 },
  { id: 5, title: "Inception", year: 2010, genre: "Sci-Fi", tmdb_id: 27205 },
  { id: 6, title: "Fight Club", year: 1999, genre: "Drama", tmdb_id: 550 },
  { id: 7, title: "Forrest Gump", year: 1994, genre: "Drama", tmdb_id: 13 },
  { id: 8, title: "The Matrix", year: 1999, genre: "Sci-Fi", tmdb_id: 603 },
  { id: 9, title: "Goodfellas", year: 1990, genre: "Crime", tmdb_id: 769 },
  { id: 10, title: "The Lord of the Rings", year: 2001, genre: "Fantasy", tmdb_id: 120 },
  { id: 11, title: "Parasite", year: 2019, genre: "Thriller", tmdb_id: 496243 },
  { id: 12, title: "Interstellar", year: 2014, genre: "Sci-Fi", tmdb_id: 157336 },
  { id: 13, title: "The Departed", year: 2006, genre: "Crime", tmdb_id: 1422 },
  { id: 14, title: "Whiplash", year: 2014, genre: "Drama", tmdb_id: 244786 },
  { id: 15, title: "The Grand Budapest Hotel", year: 2014, genre: "Comedy", tmdb_id: 120467 },
  { id: 16, title: "Mad Max: Fury Road", year: 2015, genre: "Action", tmdb_id: 76341 },
  { id: 17, title: "Her", year: 2013, genre: "Romance", tmdb_id: 152601 },
  { id: 18, title: "Moonlight", year: 2016, genre: "Drama", tmdb_id: 376867 },
  { id: 19, title: "La La Land", year: 2016, genre: "Musical", tmdb_id: 313369 },
  { id: 20, title: "Blade Runner 2049", year: 2017, genre: "Sci-Fi", tmdb_id: 335984 },
  { id: 21, title: "Everything Everywhere All at Once", year: 2022, genre: "Sci-Fi", tmdb_id: 545611 },
  { id: 22, title: "Dune", year: 2021, genre: "Sci-Fi", tmdb_id: 438631 },
  { id: 23, title: "The Menu", year: 2022, genre: "Horror", tmdb_id: 718930 },
  { id: 24, title: "Top Gun: Maverick", year: 2022, genre: "Action", tmdb_id: 361743 },
  { id: 25, title: "Oppenheimer", year: 2023, genre: "Biography", tmdb_id: 872585 },
  { id: 26, title: "Barbie", year: 2023, genre: "Comedy", tmdb_id: 346698 },
  { id: 27, title: "Spider-Man: Across the Spider-Verse", year: 2023, genre: "Animation", tmdb_id: 569094 },
  { id: 28, title: "John Wick: Chapter 4", year: 2023, genre: "Action", tmdb_id: 603692 },
  { id: 29, title: "Past Lives", year: 2023, genre: "Romance", tmdb_id: 758009 },
  { id: 30, title: "The Killer", year: 2023, genre: "Thriller", tmdb_id: 359410 }
];

export const recommendationPool: Recommendation[] = [
  {
    title: "Drive My Car",
    year: 2021,
    tmdb_id: 581734,
    reason: "This contemplative Japanese masterpiece offers the same emotional depth and character study excellence, available on various streaming platforms in Singapore.",
    category: "Hidden Gem",
    genre: "Drama"
  },
  {
    title: "The Northman",
    year: 2022,
    tmdb_id: 639933,
    reason: "A visceral Viking epic that combines mythological storytelling with stunning cinematography, perfect for fans of immersive period pieces.",
    category: "Recent Release",
    genre: "Action"
  },
  {
    title: "Minari",
    year: 2020,
    tmdb_id: 518068,
    reason: "This tender family drama captures the immigrant experience with the same emotional authenticity and beautiful storytelling you appreciate.",
    category: "Hidden Gem",
    genre: "Drama"
  },
  {
    title: "The Power of the Dog",
    year: 2021,
    tmdb_id: 482373,
    reason: "Jane Campion's psychological Western offers complex character dynamics and stunning visuals, streaming on Netflix Singapore.",
    category: "Strong Match",
    genre: "Drama"
  },
  {
    title: "RRR",
    year: 2022,
    tmdb_id: 579974,
    reason: "This spectacular Indian action epic delivers the same larger-than-life storytelling and visual spectacle, available on Netflix.",
    category: "Surprising Pick",
    genre: "Action"
  },
  {
    title: "Turning Red",
    year: 2022,
    tmdb_id: 508947,
    reason: "Pixar's coming-of-age story combines humor and heart with innovative animation, streaming on Disney+ Singapore.",
    category: "Surprising Pick",
    genre: "Animation"
  },
  {
    title: "The Banshees of Inisherin",
    year: 2022,
    tmdb_id: 674324,
    reason: "A darkly comic meditation on friendship and isolation that matches your taste for character-driven narratives.",
    category: "Strong Match",
    genre: "Drama"
  },
  {
    title: "Nope",
    year: 2022,
    tmdb_id: 762504,
    reason: "Jordan Peele's genre-bending thriller combines social commentary with spectacular visuals and innovative storytelling.",
    category: "Recent Release",
    genre: "Horror"
  },
  {
    title: "The Handmaiden",
    year: 2016,
    tmdb_id: 290859,
    reason: "Park Chan-wook's erotic psychological thriller offers intricate plotting and stunning visual artistry.",
    category: "Hidden Gem",
    genre: "Thriller"
  },
  {
    title: "Knives Out",
    year: 2019,
    tmdb_id: 546554,
    reason: "A clever modern whodunit that revitalizes the mystery genre with wit, style, and excellent ensemble acting.",
    category: "Strong Match",
    genre: "Mystery"
  }
];