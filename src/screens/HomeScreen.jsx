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
  const selectedGenres = useStore(state => state.selectedGenres);
  const watchlist = useStore(state => state.watchlist);
  const favorites = useStore(state => state.favorites);
  const history = useStore(state => state.history);
  const homeSections = useStore(state => state.homeSections);

  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [popular, setPopular] = useState([]);
  const [genre1Movies, setGenre1Movies] = useState([]);
  const [genre2Movies, setGenre2Movies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstGenre = selectedGenres[0] || 'Action';
  const secondGenre = selectedGenres[1];

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          recData,
          trendData,
          newRelData,
          popData,
          g1Data,
          g2Data
        ] = await Promise.all([
          getRecommended(),
          getTrending(),
          getNewReleases(),
          getPopular(),
          getMoviesByGenreId(GENRE_NAME_TO_ID[firstGenre] || 28),
          secondGenre ? getMoviesByGenreId(GENRE_NAME_TO_ID[secondGenre]) : Promise.resolve([])
        ]);

        setRecommended(recData);
        setTrending(trendData);
        setNewReleases(newRelData);
        setPopular(popData);
        setGenre1Movies(g1Data);
        setGenre2Movies(g2Data);

        if (recData.length > 0) {
          const randomIndex = Math.floor(Math.random() * recData.length);
          setHeroMovie(recData[randomIndex]);
        }
      } catch (err) {
        console.error('Error fetching TMDB data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [firstGenre, secondGenre]);

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
        title={`Because You Like ${firstGenre}`} 
        movies={genre1Movies} 
        getStatus={getStatus}
      />
    ),
    genre2: () => (
      secondGenre && genre2Movies.length > 0 ? (
        <ScrollRail 
          key="genre2"
          title={`More ${secondGenre}`} 
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
            border: '2px solid',
            borderColor: 'primary.main',
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
