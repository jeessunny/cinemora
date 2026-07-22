const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// ═══════════════════════════════════════════
// IN-MEMORY CACHE — avoids re-fetching the same data
// ═══════════════════════════════════════════
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getCached = (key) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, ts: Date.now() });
};

// Deduplicate in-flight requests — if the same URL is already being fetched,
// return the existing promise instead of firing a second network call
const inFlight = new Map();

const GENRE_MAP = {
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

export const getGenresFromIds = (ids) => {
  return ids.map(id => GENRE_MAP[id]).filter(Boolean);
};

export const mapMovie = (m) => ({
  id: m.id,
  type: m.media_type || (m.first_air_date ? 'tv' : 'movie'),
  title: m.title || m.name,
  year: m.release_date ? parseInt(m.release_date.split('-')[0]) : (m.first_air_date ? parseInt(m.first_air_date.split('-')[0]) : 'N/A'),
  rating: Math.round(m.vote_average * 10) / 10,
  runtime: m.runtime ? `${Math.floor(m.runtime / 60)}h ${m.runtime % 60}m` : 'N/A',
  genres: m.genre_ids ? getGenresFromIds(m.genre_ids) : (m.genres ? m.genres.map(g => g.name) : []),
  // Use smaller image sizes for lists — w342 is plenty for poster cards
  posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Poster',
  // Use w780 for backdrops — more than enough for mobile screens
  backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : 'https://via.placeholder.com/780x439?text=No+Backdrop',
  synopsis: m.overview || 'No synopsis available.',
  matchPercentage: Math.round(m.vote_average * 10),
  cast: m.credits?.cast?.slice(0, 10).map(c => ({
    name: c.name,
    character: c.character,
    // w185 is fine for small circular avatars
    photoUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://via.placeholder.com/185x185?text=No+Photo'
  })) || []
});

const fetchTMDB = async (endpoint) => {
  const urlStr = `${BASE_URL}${endpoint}`;

  // Check cache first
  const cached = getCached(urlStr);
  if (cached) return cached;

  // Deduplicate in-flight requests
  if (inFlight.has(urlStr)) return inFlight.get(urlStr);

  const request = (async () => {
    const url = new URL(urlStr);
    url.searchParams.append('api_key', TMDB_API_KEY);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch from TMDB');
    }
    const data = await response.json();
    setCache(urlStr, data);
    return data;
  })();

  inFlight.set(urlStr, request);
  try {
    return await request;
  } finally {
    inFlight.delete(urlStr);
  }
};

export const getTrending = async () => {
  const data = await fetchTMDB('/trending/movie/week');
  return data.results.map(mapMovie);
};

export const getNewReleases = async () => {
  const data = await fetchTMDB('/movie/now_playing');
  return data.results.map(mapMovie);
};

export const getPopular = async () => {
  const data = await fetchTMDB('/movie/popular');
  return data.results.map(mapMovie);
};

export const getRecommended = async () => {
  const data = await fetchTMDB('/movie/top_rated');
  return data.results.map(mapMovie);
};

export const searchMovies = async (query, type = 'movies') => {
  if (!query) return [];
  const endpoint = type === 'tv' ? '/search/tv' : '/search/movie';
  const cacheKey = `${BASE_URL}${endpoint}?query=${encodeURIComponent(query)}`;

  // Check cache for search results too
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('query', query);
  const response = await fetch(url);
  const data = await response.json();
  const results = data.results.map(mapMovie);
  setCache(cacheKey, results);
  return results;
};

export const getPopularSearches = async (type = 'movies') => {
  const endpoint = type === 'tv' ? '/trending/tv/week' : '/trending/movie/week';
  const data = await fetchTMDB(endpoint);
  return data.results.slice(0, 8).map(m => m.title || m.name);
};

export const getMovieDetails = async (id, type = 'movie') => {
  const endpoint = type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
  const cacheKey = `${BASE_URL}${endpoint}?details=1`;

  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('append_to_response', 'credits,similar');
  const response = await fetch(url);
  if (!response.ok) throw new Error('Not found');
  const data = await response.json();
  const result = {
    ...mapMovie(data),
    similar: data.similar?.results?.map(mapMovie) || []
  };
  setCache(cacheKey, result);
  return result;
};

export const getMoviesByGenreId = async (genreId) => {
  const cacheKey = `${BASE_URL}/discover/movie?genre=${genreId}`;

  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(`${BASE_URL}/discover/movie`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('with_genres', genreId);
  const response = await fetch(url);
  const data = await response.json();
  const results = data.results.map(mapMovie);
  setCache(cacheKey, results);
  return results;
};

export const getSeriesDetails = async (id) => {
  const cacheKey = `${BASE_URL}/tv/${id}?details=1`;

  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(`${BASE_URL}/tv/${id}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('append_to_response', 'credits,similar');
  const response = await fetch(url);
  if (!response.ok) throw new Error('Not found');
  const data = await response.json();

  const seasons = (data.seasons || [])
    .filter(s => s.season_number > 0)
    .map(s => ({
      id: s.id,
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      airDate: s.air_date,
      posterUrl: s.poster_path
        ? `https://image.tmdb.org/t/p/w300${s.poster_path}`
        : null,
      overview: s.overview || '',
    }));

  const result = {
    ...mapMovie(data),
    numberOfSeasons: data.number_of_seasons,
    numberOfEpisodes: data.number_of_episodes,
    status: data.status,
    networks: (data.networks || []).map(n => n.name),
    seasons,
    similar: data.similar?.results?.map(mapMovie) || [],
  };
  setCache(cacheKey, result);
  return result;
};

export const getSeasonDetails = async (seriesId, seasonNumber) => {
  const cacheKey = `${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`;

  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  const response = await fetch(url);
  if (!response.ok) throw new Error('Season not found');
  const data = await response.json();

  const result = {
    seasonNumber: data.season_number,
    name: data.name,
    overview: data.overview,
    episodes: (data.episodes || []).map(ep => ({
      id: ep.id,
      episodeNumber: ep.episode_number,
      name: ep.name,
      overview: ep.overview || '',
      airDate: ep.air_date,
      runtime: ep.runtime,
      rating: ep.vote_average ? Math.round(ep.vote_average * 10) / 10 : null,
      stillUrl: ep.still_path
        ? `https://image.tmdb.org/t/p/w400${ep.still_path}`
        : null,
    })),
  };
  setCache(cacheKey, result);
  return result;
};
