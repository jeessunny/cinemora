// ════════════════════════════════════════════════════════════════════════════
// Cinemora Local Data Service — Pure Local Architecture (No External API Fetch)
// All movie discovery, recommendations, search, and series data run offline
// ════════════════════════════════════════════════════════════════════════════

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

export const getGenresFromIds = (ids = []) => {
  return ids.map(id => GENRE_MAP[id] || id).filter(Boolean);
};

export const mapMovie = (m) => ({
  id: m.id,
  type: m.type || m.media_type || (m.first_air_date ? 'tv' : 'movie'),
  title: m.title || m.name,
  year: m.year || (m.release_date ? parseInt(m.release_date.split('-')[0]) : 2024),
  rating: m.rating || (m.vote_average ? Math.round(m.vote_average * 10) / 10 : 8.5),
  runtime: m.runtime || '2h 15m',
  genres: m.genres || (m.genre_ids ? getGenresFromIds(m.genre_ids) : ['Action']),
  genre_ids: m.genre_ids || [28],
  original_language: m.original_language || 'en',
  posterUrl: m.posterUrl || m.poster_path || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
  backdropUrl: m.backdropUrl || m.backdrop_path || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=80',
  synopsis: m.synopsis || m.overview || 'An extraordinary cinematic journey filled with unforgettable characters and thrilling moments.',
  matchPercentage: m.matchPercentage || 94,
  cast: m.cast || [
    { name: 'Cillian Murphy', character: 'Lead Role', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    { name: 'Emily Blunt', character: 'Supporting', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
    { name: 'Robert Downey Jr.', character: 'Antagonist', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' }
  ],
  similar: m.similar || []
});

// Built-in offline curated catalog
const LOCAL_CATALOG = [
  {
    id: 101,
    type: 'movie',
    title: 'Interstellar: Beyond Horizons',
    year: 2024,
    rating: 8.9,
    runtime: '2h 49m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    genre_ids: [878, 12, 18],
    original_language: 'en',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80',
    synopsis: 'When humanity faces extinction, a daring team of explorers ventures through a newly discovered wormhole beyond our solar system in search of a new home.',
    matchPercentage: 98,
    cast: [
      { name: 'Matthew McConaughey', character: 'Cooper', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Anne Hathaway', character: 'Brand', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      { name: 'Jessica Chastain', character: 'Murph', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' }
    ]
  },
  {
    id: 102,
    type: 'movie',
    title: 'The Dark Sentinel',
    year: 2024,
    rating: 8.7,
    runtime: '2h 32m',
    genres: ['Action', 'Crime', 'Thriller'],
    genre_ids: [28, 80, 53],
    original_language: 'en',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
    synopsis: 'A shadowy vigilante uncovers a deep conspiracy woven through the city corrupt elite, testing the boundaries of justice and morality.',
    matchPercentage: 96,
    cast: [
      { name: 'Christian Bale', character: 'The Sentinel', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Heath Ledger', character: 'The Anarchist', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' }
    ]
  },
  {
    id: 103,
    type: 'movie',
    title: 'Echoes of Neo-Tokyo',
    year: 2024,
    rating: 8.6,
    runtime: '2h 08m',
    genres: ['Animation', 'Sci-Fi', 'Action'],
    genre_ids: [16, 878, 28],
    original_language: 'ja',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80',
    synopsis: 'In a rain-slicked cyberpunk metropolis, a renegade hacker and a cybernetic detective unravel memories that should not exist.',
    matchPercentage: 94,
    cast: [
      { name: 'Kenji Sato', character: 'Ren', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
      { name: 'Aoi Tanaka', character: 'Kaya', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' }
    ]
  },
  {
    id: 104,
    type: 'movie',
    title: 'Midnight in Paris: Revisited',
    year: 2023,
    rating: 8.4,
    runtime: '1h 56m',
    genres: ['Romance', 'Comedy', 'Fantasy'],
    genre_ids: [10749, 35, 14],
    original_language: 'en',
    posterUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
    synopsis: 'A nostalgic writer wandering the cobblestone streets of Paris finds a mysterious midnight carriage that transports him to the vibrant 1920s.',
    matchPercentage: 91,
    cast: [
      { name: 'Owen Wilson', character: 'Gil', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Marion Cotillard', character: 'Adriana', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' }
    ]
  },
  {
    id: 105,
    type: 'movie',
    title: 'The Crimson Protocol',
    year: 2024,
    rating: 8.5,
    runtime: '2h 14m',
    genres: ['Action', 'Thriller', 'Mystery'],
    genre_ids: [28, 53, 9648],
    original_language: 'en',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
    synopsis: 'An operative framed for high treason races against time across Europe to uncover the architect behind a global destabilization protocol.',
    matchPercentage: 93,
    cast: [
      { name: 'Tom Hardy', character: 'Agent Vance', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      { name: 'Rebecca Ferguson', character: 'Dr. Ilsa', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' }
    ]
  },
  {
    id: 106,
    type: 'movie',
    title: 'Whispers of the Forest',
    year: 2023,
    rating: 8.8,
    runtime: '1h 58m',
    genres: ['Animation', 'Fantasy', 'Family'],
    genre_ids: [16, 14, 10751],
    original_language: 'ja',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1200&q=80',
    synopsis: 'A spirited young girl discovers an ancient woodland spirit shrine, sparking an enchanting adventure between the spirit realm and modern humanity.',
    matchPercentage: 97,
    cast: [
      { name: 'Rumi Hiiragi', character: 'Chihiro', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' }
    ]
  },
  {
    id: 107,
    type: 'tv',
    title: 'Chronicles of Silicon',
    year: 2024,
    rating: 9.1,
    runtime: '8 Episodes',
    genres: ['Drama', 'Sci-Fi'],
    genre_ids: [18, 878],
    original_language: 'en',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
    synopsis: 'The inside rise and cutthroat rivalries behind the genesis of artificial intelligence and the tech titans who engineered the next century.',
    matchPercentage: 99,
    numberOfSeasons: 2,
    numberOfEpisodes: 16,
    status: 'Returning Series',
    networks: ['Cinemora Original'],
    seasons: [
      { id: 1, seasonNumber: 1, name: 'Season 1: Inception', episodeCount: 8, airDate: '2023-09-10' },
      { id: 2, seasonNumber: 2, name: 'Season 2: Convergence', episodeCount: 8, airDate: '2024-04-12' }
    ]
  },
  {
    id: 108,
    type: 'movie',
    title: 'The Grand Illusionist',
    year: 2023,
    rating: 8.3,
    runtime: '2h 10m',
    genres: ['Mystery', 'Drama', 'Thriller'],
    genre_ids: [9648, 18, 53],
    original_language: 'en',
    posterUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
    synopsis: 'Two rival stage magicians in Victorian London engage in a competitive battle to create the ultimate teleportation trick, with fatal consequences.',
    matchPercentage: 92,
    cast: [
      { name: 'Hugh Jackman', character: 'Robert Angier', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      { name: 'Christian Bale', character: 'Alfred Borden', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' }
    ]
  }
];

export const getTrending = async (lang = 'en') => {
  return LOCAL_CATALOG.map(mapMovie);
};

export const getNewReleases = async (lang = 'en') => {
  return [...LOCAL_CATALOG].reverse().map(mapMovie);
};

export const getPopular = async (lang = 'en') => {
  return [...LOCAL_CATALOG].sort((a, b) => b.rating - a.rating).map(mapMovie);
};

export const getRecommended = async (genreIds = [], lang = 'en', page = 1) => {
  if (!genreIds || genreIds.length === 0) {
    return LOCAL_CATALOG.map(mapMovie);
  }
  const filtered = LOCAL_CATALOG.filter(m =>
    m.genre_ids.some(gid => genreIds.includes(gid))
  );
  return (filtered.length > 0 ? filtered : LOCAL_CATALOG).map(mapMovie);
};

export const searchMovies = async (query = '', type = 'movies') => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const matches = LOCAL_CATALOG.filter(m => {
    const titleMatch = (m.title || '').toLowerCase().includes(q);
    const genreMatch = (m.genres || []).some(g => g.toLowerCase().includes(q));
    const synopsisMatch = (m.synopsis || '').toLowerCase().includes(q);
    return titleMatch || genreMatch || synopsisMatch;
  });
  return matches.map(mapMovie);
};

export const getPopularSearches = async (type = 'movies') => {
  return [
    'Interstellar',
    'Cyberpunk Neo-Tokyo',
    'The Dark Sentinel',
    'Chronicles of Silicon',
    'Animation Fantasy',
    'Thriller Mystery'
  ];
};

export const getMovieDetails = async (id, type = 'movie') => {
  const numId = parseInt(id, 10);
  const found = LOCAL_CATALOG.find(m => m.id === numId) || LOCAL_CATALOG[0];
  const similar = LOCAL_CATALOG.filter(m => m.id !== found.id).slice(0, 4);

  return {
    ...mapMovie(found),
    similar: similar.map(mapMovie)
  };
};

export const getMoviesByGenreId = async (genreId, lang = 'en', page = 1) => {
  const gId = parseInt(genreId, 10);
  const filtered = LOCAL_CATALOG.filter(m => (m.genre_ids || []).includes(gId));
  return (filtered.length > 0 ? filtered : LOCAL_CATALOG).map(mapMovie);
};

export const getSeriesDetails = async (id) => {
  const numId = parseInt(id, 10);
  const found = LOCAL_CATALOG.find(m => m.id === numId && m.type === 'tv') || LOCAL_CATALOG.find(m => m.type === 'tv') || LOCAL_CATALOG[0];

  return {
    ...mapMovie(found),
    numberOfSeasons: found.numberOfSeasons || 2,
    numberOfEpisodes: found.numberOfEpisodes || 16,
    status: found.status || 'Returning Series',
    networks: found.networks || ['Cinemora Original'],
    seasons: found.seasons || [
      { id: 1, seasonNumber: 1, name: 'Season 1', episodeCount: 8, airDate: '2023-09-10' },
      { id: 2, seasonNumber: 2, name: 'Season 2', episodeCount: 8, airDate: '2024-04-12' }
    ],
    similar: LOCAL_CATALOG.filter(m => m.id !== found.id).slice(0, 4).map(mapMovie)
  };
};

export const getSeasonDetails = async (seriesId, seasonNumber) => {
  const sNum = parseInt(seasonNumber, 10) || 1;
  return {
    seasonNumber: sNum,
    name: `Season ${sNum}`,
    overview: `Season ${sNum} explores deeper conflicts and reveals unexpected alliances.`,
    episodes: Array.from({ length: 8 }, (_, i) => ({
      id: 500 + i,
      episodeNumber: i + 1,
      name: `Episode ${i + 1}: The Turning Point`,
      overview: `A pivotal moment shifts the balance of power as secrets emerge.`,
      airDate: '2024-01-15',
      runtime: 52,
      rating: 8.8,
      stillUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80'
    }))
  };
};
