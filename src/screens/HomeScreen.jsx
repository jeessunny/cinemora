import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import { 
  getRecommended, 
  getTrending, 
  getNewReleases, 
  getMoviesByGenreId, 
  getPopular 
} from '../services/tmdb';
import HeroCard from '../components/HeroCard';
import ScrollRail from '../components/ScrollRail';
import SearchBar from '../components/SearchBar';
import { getRecommendationData } from '../services/recommendationEngine';

// Need to map genre name to TMDB genre ID
const GENRE_NAME_TO_ID = {
  "Action": 28,
  "Adventure": 12,
  "Animation": 16,
  "Comedy": 35,
  "Crime": 80,
  "Documentary": 99,
  "Drama": 18,
  "Family": 10751,
  "Fantasy": 14,
  "History": 36,
  "Horror": 27,
  "Music": 10402,
  "Mystery": 9648,
  "Romance": 10749,
  "Sci-Fi": 878,
  "TV Movie": 10770,
  "Thriller": 53,
  "War": 10752,
  "Western": 37
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const userName = useStore(state => state.userName);
  const avatar = useStore(state => state.avatar);
  const selectedGenres = useStore(state => state.selectedGenres) || [];
  const selectedLanguages = useStore(state => state.selectedLanguages) || [];
  const watchlist = useStore(state => state.watchlist) || [];
  const favorites = useStore(state => state.favorites) || [];
  const history = useStore(state => state.history) || [];
  const homeSections = useStore(state => state.homeSections) || [];

  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [popular, setPopular] = useState([]);
  const [genre1Movies, setGenre1Movies] = useState([]);
  const [genre2Movies, setGenre2Movies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [rail1Title, setRail1Title] = useState('Because You Like Action');
  const [rail2Title, setRail2Title] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const { topGenres, topLanguages } = await getRecommendationData();
        
        const g1 = topGenres[0] || selectedGenres[0] || 'Action';
        const g2 = topGenres[1] || selectedGenres[1];

        if (isMounted) {
          setRail1Title(`Because You Like ${g1}`);
          if (g2) setRail2Title(`More ${g2}`);
        }

        const g1Id = GENRE_NAME_TO_ID[g1] || 28;
        const g2Id = g2 ? GENRE_NAME_TO_ID[g2] : null;

        // Distribute languages across rails to prevent mono-language saturation
        const lang1 = topLanguages[0] || 'en';
        const lang2 = topLanguages[1] || lang1;
        const lang3 = topLanguages[2] || lang1;

        const [
          recData,
          trendData,
          newRelData,
          popData,
          g1Data,
          g2Data
        ] = await Promise.all([
          getRecommended([g1Id, g2Id].filter(Boolean), lang1, 3), 
          getTrending(lang2),
          getNewReleases(lang3),
          getPopular(lang1),
          getMoviesByGenreId(g1Id, lang2, 1), 
          g2Id ? getMoviesByGenreId(g2Id, lang3, 2) : Promise.resolve([]) 
        ]);

        if (!isMounted) return;

        const historyIds = new Set(useStore.getState().history.map(m => m.id));
        const seenIds = new Set();
        
        const filterMovies = (movies) => {
          return movies.filter(m => {
            if (historyIds.has(m.id)) return false;
            
            // Allow watchlist movies to appear in the feed roughly 10% of the time (1 in 10 chance)
            // This satisfies the user's "5 in 50" request so watchlist items don't dominate
            const inWatchlist = useStore.getState().watchlist.some(wm => wm.id === m.id);
            if (inWatchlist && Math.random() > 0.10) return false;

            if (seenIds.has(m.id)) return false;
            seenIds.add(m.id);
            return true;
          });
        };

        const filteredRec = filterMovies(recData);
        const filteredTrend = filterMovies(trendData);
        const filteredNewRel = filterMovies(newRelData);
        const filteredPop = filterMovies(popData);
        const filteredG1 = filterMovies(g1Data);
        const filteredG2 = filterMovies(g2Data);

        setRecommended(filteredRec);
        setTrending(filteredTrend);
        setNewReleases(filteredNewRel);
        setPopular(filteredPop);
        setGenre1Movies(filteredG1);
        setGenre2Movies(filteredG2);

        const allFetchedMovies = [
          ...filteredRec,
          ...filteredTrend,
          ...filteredNewRel,
          ...filteredPop,
          ...filteredG1,
          ...filteredG2
        ];

        const uniqueMovies = Array.from(new Map(allFetchedMovies.map(m => [m.id, m])).values());
        const newHero = uniqueMovies.length > 0 ? uniqueMovies[Math.floor(Math.random() * uniqueMovies.length)] : null;
        setHeroMovie(newHero);

      } catch (err) {
        console.error('Error fetching TMDB data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, [selectedGenres, selectedLanguages]);

  const getStatus = (id) => {
    const statuses = [];
    if (history.some(m => m.id === id)) statuses.push('history');
    if (favorites.some(m => m.id === id)) statuses.push('favorite');
    if (watchlist.some(m => m.id === id)) statuses.push('watchlist');
    return statuses.length > 0 ? statuses : null;
  };

  const sectionMap = {
    recommended: () => (
      <ScrollRail 
        key="recommended"
        title="Recommended For You" 
        movies={recommended} 
        getStatus={getStatus}
      />
    ),
    genre1: () => (
      <ScrollRail 
        key="genre1"
        title={rail1Title} 
        movies={genre1Movies} 
        getStatus={getStatus}
      />
    ),
    genre2: () => (
      rail2Title && genre2Movies.length > 0 ? (
        <ScrollRail 
          key="genre2"
          title={rail2Title} 
          movies={genre2Movies} 
          getStatus={getStatus}
        />
      ) : null
    ),
    trending: () => (
      <ScrollRail 
        key="trending"
        title="Trending Now" 
        movies={trending} 
        getStatus={getStatus}
      />
    ),
    popular: () => (
      <ScrollRail 
        key="popular"
        title="Popular in Your Taste" 
        movies={popular} 
        getStatus={getStatus}
      />
    ),
    newReleases: () => (
      <ScrollRail 
        key="newReleases"
        title="New Releases" 
        movies={newReleases} 
        getStatus={getStatus}
      />
    ),
  };

  return (
    <Box sx={{ pb: 12, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, flex: 1, pr: 2 }}>
          <Typography 
            variant="headlineMedium"
            fontWeight={800} 
            color="text.primary" 
            sx={{ 
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {userName || 'Movie Lover'}
          </Typography>
          <Typography 
            variant="bodyLarge"
            color="text.secondary" 
            sx={{ fontWeight: 600 }}
          >
            {getGreeting()}
          </Typography>
        </Box>
        <Avatar 
          src={avatar} 
          onClick={() => navigate('/settings')} 
          sx={{ 
            cursor: 'pointer', 
            width: 48, 
            height: 48,
            boxShadow: 'none',
            flexShrink: 0,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.1)' }
          }} 
        />
      </Box>

      {/* Search Bar */}
      <Box sx={{ px: 2, mb: 4 }}>
        <SearchBar 
          placeholder="Search movies, genres..." 
          readOnly 
          onClick={() => navigate('/search')}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Hero Card */}
          {heroMovie && (
            <Box sx={{ px: 2, mb: 5 }}>
              <HeroCard movie={heroMovie} />
            </Box>
          )}

          {/* Scroll Rails */}
          {homeSections
            .filter(section => section.enabled)
            .map(section => {
              const renderFn = sectionMap[section.id];
              return renderFn ? renderFn() : null;
            })
          }
        </>
      )}
    </Box>
  );
}
