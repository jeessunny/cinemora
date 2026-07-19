import React, { useMemo } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import { getRecommended, getMoviesByGenre, getTrending, getNewReleases } from '../data/mockData';
import HeroCard from '../components/HeroCard';
import ScrollRail from '../components/ScrollRail';
import SearchBar from '../components/SearchBar';

export default function HomeScreen() {
  const navigate = useNavigate();
  const userName = useStore(state => state.userName);
  const avatar = useStore(state => state.avatar);
  const selectedGenres = useStore(state => state.selectedGenres);
  const watchlist = useStore(state => state.watchlist);
  const favorites = useStore(state => state.favorites);
  const history = useStore(state => state.history);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const recommended = useMemo(() => getRecommended(selectedGenres), [selectedGenres]);
  const trending = useMemo(() => getTrending(), []);
  const newReleases = useMemo(() => getNewReleases(), []);
  
  const firstGenre = selectedGenres[0] || 'Action';
  const genreMovies = useMemo(() => getMoviesByGenre(firstGenre), [firstGenre]);
  
  // Pick a random recommendation for the hero movie on load
  const heroMovie = useMemo(() => {
    if (recommended.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * recommended.length);
    return recommended[randomIndex];
  }, [recommended]);

  // Second genre rail if user selected more than one genre
  const secondGenre = selectedGenres[1];
  const secondGenreMovies = useMemo(
    () => secondGenre ? getMoviesByGenre(secondGenre) : [],
    [secondGenre]
  );

  const getStatus = (id) => {
    if (history.some(m => m.id === id)) return 'history';
    if (favorites.some(m => m.id === id)) return 'favorite';
    if (watchlist.some(m => m.id === id)) return 'watchlist';
    return null;
  };

  return (
    <Box sx={{ pb: 12, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header with username matched to page title size (headlineMedium) and appropriate bodyLarge greeting */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3
      }}>
        {/* Username set to headlineMedium, greeting set to bodyLarge with gap spacing */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, flex: 1, pr: 2 }}>
          <Typography 
            variant="headlineMedium" // Changed from titleLarge to headlineMedium to match Saved/Search headings
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
            variant="bodyLarge" // Changed from bodyMedium to bodyLarge to match the larger header
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

      {/* Hero Card */}
      {heroMovie && (
        <Box sx={{ px: 2, mb: 5 }}>
          <HeroCard movie={heroMovie} />
        </Box>
      )}

      {/* Scroll Rails */}
      <ScrollRail 
        title="Recommended For You" 
        movies={recommended} 
        getStatus={getStatus}
      />
      
      <ScrollRail 
        title={`Because You Like ${firstGenre}`} 
        movies={genreMovies} 
        getStatus={getStatus}
      />

      {secondGenre && secondGenreMovies.length > 0 && (
        <ScrollRail 
          title={`More ${secondGenre}`} 
          movies={secondGenreMovies} 
          getStatus={getStatus}
        />
      )}

      <ScrollRail 
        title="Trending Now" 
        movies={trending} 
        getStatus={getStatus}
      />

      <ScrollRail 
        title="Popular in Your Taste" 
        movies={recommended.slice().reverse()} 
        getStatus={getStatus}
      />

      <ScrollRail 
        title="New Releases" 
        movies={newReleases} 
        getStatus={getStatus}
      />
    </Box>
  );
}
