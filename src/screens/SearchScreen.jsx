import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { SearchOff, History, TrendingUp } from '@mui/icons-material';
import useStore from '../store';
import { searchMovies, popularSearches } from '../data/mockData';
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

  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(false), 500);
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

  // Filter movies/shows solely based on query and type (genre chips removed)
  const results = useMemo(() => {
    let res = searchMovies(query);
    if (type === 'tv') {
      res = res.filter(m => 
        m.title.toLowerCase().includes('series') || 
        m.genres.includes('Documentary') ||
        m.genres.includes('Animation')
      );
    }
    return res;
  }, [query, type]);

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
            {results.map((movie) => (
              <Box key={movie.id} sx={{ width: 'calc(50% - 8px)', display: 'flex', justifyContent: 'center' }}>
                <PosterCard movie={movie} status={getStatus(movie.id)} />
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
                    sx={{ borderRadius: '8px' }}
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
                  sx={{ borderRadius: '8px', bgcolor: 'surface.surfaceContainerLow' }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
