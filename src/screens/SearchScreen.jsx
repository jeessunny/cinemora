import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { SearchOff, History, TrendingUp } from '@mui/icons-material';
import useStore from '../store';
import { popularSearches } from '../data/mockData';
import { searchMovies } from '../services/tmdb';
import SearchBar from '../components/SearchBar';
import SegmentedButton from '../components/SegmentedButton';
import PosterCard from '../components/PosterCard';
import EmptyState from '../components/EmptyState';
import MovieSkeleton from '../components/MovieSkeleton';

export default function SearchScreen() {
  const recentSearches = useStore(state => state.recentSearches);
  const addRecentSearch = useStore(state => state.addRecentSearch);
  const clearRecentSearches = useStore(state => state.clearRecentSearches);
  const watchlist = useStore(state => state.watchlist);
  const favorites = useStore(state => state.favorites);
  const history = useStore(state => state.history);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('movies');
  const [isTyping, setIsTyping] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim()) {
        try {
          // You could conditionally search TMDB TV vs Movies here, but we are using movie search
          const res = await searchMovies(query);
          setResults(res);
        } catch (err) {
          console.error(err);
        }
      } else {
        setResults([]);
      }
      setIsTyping(false);
    };

    const timer = setTimeout(fetchResults, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (val) => {
    setQuery(val);
    setIsTyping(true);
  };

  const handleSearchSubmit = (val) => {
    if (val.trim()) {
      addRecentSearch(val.trim());
    }
  };

  const getStatus = (id) => {
    if (history.some(m => m.id === id)) return 'history';
    if (favorites.some(m => m.id === id)) return 'favorite';
    if (watchlist.some(m => m.id === id)) return 'watchlist';
    return null;
  };

  return (
    <Box sx={{ pb: 12, p: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Left-aligned Search Screen Title */}
      <Typography 
        variant="headlineMedium" 
        fontWeight={800} 
        sx={{ 
          mb: 3, 
          textAlign: 'left', 
          width: '100%', 
          display: 'block' 
        }}
      >
        Search
      </Typography>

      <Box sx={{ mb: 2 }}>
        <SearchBar 
          placeholder="Search movies, genres..." 
          value={query} 
          onChange={handleSearch} 
          onClear={() => setQuery('')}
        />
      </Box>

      {/* Movie and TV Show toggle stays preserved */}
      <Box sx={{ mb: 2.2 }}>
        <SegmentedButton
          value={type}
          onChange={setType}
          fullWidth
          options={[
            { label: 'Movies', value: 'movies' },
            { label: 'TV Shows', value: 'tv' }
          ]}
        />
      </Box>

      {/* Animated content area — key forces remount on type switch for fadeSlideUp replay */}
      <Box
        key={type}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          animation: 'fadeSlideUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        }}
      >
        {query ? (
          isTyping ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ width: 'calc(50% - 8px)' }}>
                  <MovieSkeleton type="poster" />
                </Box>
              ))}
            </Box>
          ) : results.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {results.map((movie, index) => (
                <Box key={movie.id} sx={{ width: 'calc(50% - 8px)', display: 'flex', justifyContent: 'center' }}>
                  <PosterCard movie={movie} status={getStatus(movie.id)} animDelay={Math.min(index * 0.05, 0.3)} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
              <EmptyState 
                icon={SearchOff} 
                title="No results found" 
                subtitle={type === 'tv' 
                  ? "No TV shows match your search. Try switching to Movies." 
                  : "Try adjusting your search or filters to find what you're looking for."
                } 
              />
            </Box>
          )
        ) : (
          <Box>
            {recentSearches.length > 0 && (
              <Box sx={{ mb: 3.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="titleMedium" 
                    sx={{ 
                      fontWeight: 800, 
                      textAlign: 'center', 
                      width: '100%', 
                      display: 'block', 
                      mb: 1.5 
                    }}
                  >
                    Recent Searches
                  </Typography>
                  <Typography 
                    variant="labelLarge" 
                    color="primary" 
                    sx={{ cursor: 'pointer', fontWeight: 700 }} 
                    onClick={clearRecentSearches}
                  >
                    Clear All
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, justifyContent: 'center' }}>
                  {recentSearches.map((s, i) => (
                    <Chip 
                      key={i} 
                      label={s} 
                      icon={<History fontSize="small" />} 
                      onClick={() => { setQuery(s); handleSearchSubmit(s); }}
                      variant="outlined"
                      sx={{ 
                        borderRadius: '8px',
                        animation: 'chipCascade 0.3s ease-out both',
                        animationDelay: `${i * 0.06}s`,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Conditional spacing based on recent search content presence */}
            <Box sx={{ mt: recentSearches.length > 0 ? 3.5 : 0.5 }}>
              <Typography 
                variant="titleMedium" 
                sx={{ 
                  fontWeight: 800, 
                  textAlign: 'center', 
                  width: '100%', 
                  display: 'block', 
                  mb: 2.2 
                }}
              >
                Popular Searches
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, justifyContent: 'center' }}>
                {popularSearches.map((s, i) => (
                  <Chip 
                    key={i} 
                    label={s} 
                    icon={<TrendingUp fontSize="small" />}
                    onClick={() => { setQuery(s); handleSearchSubmit(s); }}
                    sx={{ 
                      borderRadius: '8px', 
                      bgcolor: 'surface.surfaceContainerLow',
                      animation: 'chipCascade 0.3s ease-out both',
                      animationDelay: `${i * 0.06}s`,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
