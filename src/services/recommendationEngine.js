import useStore from '../store';

// Maps genre IDs to names (TMDB mapping)
const GENRE_ID_TO_NAME = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

/**
 * Recommendation Algorithm (Local & Offline Capable)
 * 1. Reads local user activity (history, favorites, watchlist) from store.
 * 2. Tallies the weights per genre and language.
 * 3. Returns the top genres for the user based on behavior.
 * 4. Falls back to their selected onboarding genres and languages.
 */
export const getRecommendationData = async () => {
  const { selectedGenres = [], selectedLanguages = [], history = [], favorites = [], watchlist = [] } = useStore.getState();

  const genreScores = {};
  const languageScores = {};

  const processMovie = (movie, weight) => {
    if (!movie) return;
    if (Array.isArray(movie.genres)) {
      movie.genres.forEach(g => {
        const name = typeof g === 'string' ? g : (GENRE_ID_TO_NAME[g] || String(g));
        genreScores[name] = (genreScores[name] || 0) + weight;
      });
    } else if (Array.isArray(movie.genre_ids)) {
      movie.genre_ids.forEach(id => {
        const name = GENRE_ID_TO_NAME[id] || String(id);
        genreScores[name] = (genreScores[name] || 0) + weight;
      });
    }

    const lang = movie.original_language;
    if (lang && typeof lang === 'string') {
      languageScores[lang] = (languageScores[lang] || 0) + weight;
    }
  };

  history.forEach(m => processMovie(m, 5));
  favorites.forEach(m => processMovie(m, 4));
  watchlist.forEach(m => processMovie(m, 2));

  // Sort by highest score
  const sortedGenres = Object.entries(genreScores)
    .sort(([, a], [, b]) => b - a)
    .map(([genre]) => genre);

  const sortedLanguages = Object.entries(languageScores)
    .sort(([, a], [, b]) => b - a)
    .map(([lang]) => lang);

  const topGenres = sortedGenres.length > 0
    ? Array.from(new Set([...sortedGenres.slice(0, 3), ...(selectedGenres || [])]))
    : (selectedGenres && selectedGenres.length > 0 ? selectedGenres : ['Action']);

  const topLanguages = Array.from(new Set([...sortedLanguages.slice(0, 3), ...(selectedLanguages || ['en'])]));

  return { topGenres, topLanguages };
};
