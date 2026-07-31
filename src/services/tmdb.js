// ═══════════════════════════════════════════
// TMDB Service — All calls go through /api/tmdb proxy
// Benefits: hidden API key, Vercel CDN edge caching for all users
// ═══════════════════════════════════════════

// Client-side in-memory cache (per-user, per-session)
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

// Deduplicate in-flight requests
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
  genre_ids: m.genre_ids || (m.genres ? m.genres.map(g => g.id) : []),
  original_language: m.original_language || 'en',
  posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : 'https://placehold.co/342x513?text=No+Poster',
  backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : 'https://placehold.co/780x439?text=No+Backdrop',
  synopsis: m.overview || 'No synopsis available.',
  matchPercentage: Math.round(m.vote_average * 10),
  cast: m.credits?.cast?.slice(0, 10).map(c => ({
    name: c.name,
    character: c.character,
    photoUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://placehold.co/185x185?text=No+Photo'
  })) || []
});

// Core fetch function — routes through /api/tmdb proxy with caching + dedup
const fetchTMDB = async (path, extraParams = {}) => {
  const cacheKey = `${path}?${JSON.stringify(extraParams)}`;

  // Check client cache
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Deduplicate in-flight
  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);

  const request = (async () => {
    const url = new URL('/api/tmdb', window.location.origin);
    url.searchParams.append('path', path);
    if (Object.keys(extraParams).length > 0) {
      url.searchParams.append('query', JSON.stringify(extraParams));
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB fetch failed: ${response.status}`);
    }
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  })();

  inFlight.set(cacheKey, request);
  try {
    return await request;
  } finally {
    inFlight.delete(cacheKey);
  }
};

export const getTrending = async (lang = 'en') => {
  if (lang && lang !== 'en') {
    const data = await fetchTMDB('discover/movie', { sort_by: 'popularity.desc', with_original_language: lang });
    return data.results.map(mapMovie);
  }
  const data = await fetchTMDB('trending/movie/week');
  return data.results.map(mapMovie);
};

export const getNewReleases = async (lang = 'en') => {
  if (lang && lang !== 'en') {
    const today = new Date().toISOString().split('T')[0];
    const past = new Date(Date.now() - 45*24*60*60*1000).toISOString().split('T')[0];
    const data = await fetchTMDB('discover/movie', { 
      sort_by: 'popularity.desc', 
      with_original_language: lang,
      'primary_release_date.lte': today,
      'primary_release_date.gte': past
    });
    return data.results.map(mapMovie);
  }
  const data = await fetchTMDB('movie/now_playing');
  return data.results.map(mapMovie);
};

export const getPopular = async (lang = 'en') => {
  // Use page 2 to ensure it doesn't overlap perfectly with Trending, solving deduplication starvation
  if (lang && lang !== 'en') {
    const data = await fetchTMDB('discover/movie', { sort_by: 'popularity.desc', with_original_language: lang, page: 2 });
    return data.results.map(mapMovie);
  }
  const data = await fetchTMDB('movie/popular', { page: 2 });
  return data.results.map(mapMovie);
};

export const getRecommended = async (genreIds = [], lang = 'en', page = 1) => {
  const params = { page };
  if (lang && lang !== 'en') params.with_original_language = lang;
  if (genreIds && genreIds.length > 0) params.with_genres = genreIds.join(',');
  
  // If no params (other than page), default to top_rated
  if (Object.keys(params).length === 1 && params.page === 1) {
    const data = await fetchTMDB('movie/top_rated');
    return data.results.map(mapMovie);
  } else {
    const data = await fetchTMDB('discover/movie', params);
    return data.results.map(mapMovie);
  }
};

export const searchMovies = async (query, type = 'movies') => {
  if (!query) return [];
  const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
  const data = await fetchTMDB(endpoint, { query });
  return data.results.map(mapMovie);
};

export const getPopularSearches = async (type = 'movies') => {
  const endpoint = type === 'tv' ? 'trending/tv/week' : 'trending/movie/week';
  const data = await fetchTMDB(endpoint);
  return data.results.slice(0, 8).map(m => m.title || m.name);
};

export const getMovieDetails = async (id, type = 'movie') => {
  const endpoint = type === 'tv' ? `tv/${id}` : `movie/${id}`;
  const data = await fetchTMDB(endpoint, { append_to_response: 'credits,similar' });
  return {
    ...mapMovie(data),
    similar: data.similar?.results?.map(mapMovie) || []
  };
};

export const getMoviesByGenreId = async (genreId, lang = 'en', page = 1) => {
  const params = { with_genres: genreId, page };
  if (lang && lang !== 'en') params.with_original_language = lang;
  const data = await fetchTMDB('discover/movie', params);
  return data.results.map(mapMovie);
};

export const getSeriesDetails = async (id) => {
  const data = await fetchTMDB(`tv/${id}`, { append_to_response: 'credits,similar' });

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

  return {
    ...mapMovie(data),
    numberOfSeasons: data.number_of_seasons,
    numberOfEpisodes: data.number_of_episodes,
    status: data.status,
    networks: (data.networks || []).map(n => n.name),
    seasons,
    similar: data.similar?.results?.map(mapMovie) || [],
  };
};

export const getSeasonDetails = async (seriesId, seasonNumber) => {
  const data = await fetchTMDB(`tv/${seriesId}/season/${seasonNumber}`);

  return {
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
};
