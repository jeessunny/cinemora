import { supabase } from './supabaseClient';
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
 * Custom Recommendation Algorithm
 * 1. Fetches all user activity (views, favorites, history).
 * 2. Tallies the weights per genre.
 * 3. Returns the top genres for the user based on behavior.
 * 4. Falls back to their explicitly selected onboarding genres if no activity exists.
 */
export const getRecommendationData = async () => {
  const { session, selectedGenres, selectedLanguages } = useStore.getState();
  
  const fallbackLanguage = selectedLanguages?.length > 0 ? selectedLanguages[0] : 'en';
  
  if (!session?.user) {
    return { topGenres: selectedGenres, topLanguage: fallbackLanguage };
  }

  const { data: activity, error } = await supabase
    .from('user_activity')
    .select('genres, weight, original_language')
    .eq('user_id', session.user.id);

  if (error || !activity || activity.length === 0) {
    return { topGenres: selectedGenres, topLanguage: fallbackLanguage };
  }

  // Calculate scores
  const genreScores = {};
  const languageScores = {};
  
  activity.forEach(row => {
    if (row.genres && Array.isArray(row.genres)) {
      row.genres.forEach(genreId => {
        const genreName = GENRE_ID_TO_NAME[genreId] || String(genreId);
        genreScores[genreName] = (genreScores[genreName] || 0) + row.weight;
      });
    }
    if (row.original_language) {
      languageScores[row.original_language] = (languageScores[row.original_language] || 0) + row.weight;
    }
  });

  // Sort by highest score
  const sortedGenres = Object.entries(genreScores)
    .sort(([, a], [, b]) => b - a)
    .map(([genre]) => genre);

  const sortedLanguages = Object.entries(languageScores)
    .sort(([, a], [, b]) => b - a)
    .map(([lang]) => lang);

  const topGenres = sortedGenres.length > 0 ? sortedGenres.slice(0, 3) : selectedGenres;
  const topLanguage = sortedLanguages.length > 0 ? sortedLanguages[0] : 'en';

  return { topGenres, topLanguage };
};
