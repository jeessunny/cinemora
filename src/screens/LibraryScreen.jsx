import React, { useState, useMemo } from 'react';
import { Box, Typography, InputBase, IconButton, Paper, Chip } from '@mui/material';
import { BookmarkBorder, FavoriteBorder, HistoryToggleOff, Search, Clear } from '@mui/icons-material';
import useStore from '../store';
import SegmentedButton from '../components/SegmentedButton';
import PosterCard from '../components/PosterCard';
import EmptyState from '../components/EmptyState';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LibraryScreen() {
  const navigate = useNavigate();
  const watchlist = useStore(state => state.watchlist);
  const favorites = useStore(state => state.favorites);
  const history = useStore(state => state.history);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'watchlist';
  const [category, setCategory] = useState('all'); // 'all' | 'movie' | 'tv'
  const [historySearch, setHistorySearch] = useState('');

  // Reset category when switching tabs
  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab }, { replace: true });
    setCategory('all');
    setHistorySearch('');
  };

  const getStatus = (id) => {
    const statuses = [];
    if (history.some(m => m.id === id)) statuses.push('history');
    if (favorites.some(m => m.id === id)) statuses.push('favorite');
    if (watchlist.some(m => m.id === id)) statuses.push('watchlist');
    return statuses.length > 0 ? statuses : null;
  };

  // Filter data by category (movie vs tv)
  const filterByCategory = (data) => {
    if (category === 'all') return data;
    return data.filter(m => {
      const type = m.type || 'movie';
      return type === category;
    });
  };

  // Get filtered + searched data for the active tab
  const getFilteredData = () => {
    let data = [];
    switch (tab) {
      case 'watchlist': data = watchlist; break;
      case 'favorites': data = favorites; break;
      case 'history': data = history; break;
      default: break;
    }

    // Apply category filter
    data = filterByCategory(data);

    // Apply search filter for history tab
    if (tab === 'history' && historySearch.trim()) {
      const q = historySearch.toLowerCase().trim();
      data = data.filter(m =>
        (m.title || '').toLowerCase().includes(q)
      );
    }

    return data;
  };

  const filteredData = useMemo(getFilteredData, [tab, category, historySearch, watchlist, favorites, history]);

  // Count items in each category for the current tab
  const getCounts = () => {
    let data = [];
    switch (tab) {
      case 'watchlist': data = watchlist; break;
      case 'favorites': data = favorites; break;
      case 'history': data = history; break;
      default: break;
    }
    const movies = data.filter(m => (m.type || 'movie') === 'movie').length;
    const series = data.filter(m => (m.type || 'movie') === 'tv').length;
    return { all: data.length, movies, series };
  };

  const counts = useMemo(getCounts, [tab, watchlist, favorites, history]);

  const emptyPropsMap = {
    watchlist: {
      icon: BookmarkBorder,
      title: 'Your watchlist is empty',
      subtitle: 'Save movies you want to watch later.',
      actionLabel: 'Find Movies',
      onAction: () => navigate('/search')
    },
    favorites: {
      icon: FavoriteBorder,
      title: 'No favorites yet',
      subtitle: 'Heart the movies you love to see them here.',
      actionLabel: 'Discover',
      onAction: () => navigate('/home')
    },
    history: {
      icon: HistoryToggleOff,
      title: 'No watch history',
      subtitle: 'Movies you mark as watched will appear here.',
    },
  };

  const renderCategoryChips = () => (
    <Box sx={{
      display: 'flex',
      gap: 1,
      mb: 2.5,
      animation: 'fadeSlideUp 0.3s ease-out both',
      animationDelay: '0.05s',
    }}>
      {[
        { label: 'All', value: 'all', count: counts.all },
        { label: 'Movies', value: 'movie', count: counts.movies },
        { label: 'Series', value: 'tv', count: counts.series },
      ].map((chip) => (
        <Chip
          key={chip.value}
          label={`${chip.label} (${chip.count})`}
          onClick={() => setCategory(chip.value)}
          variant={category === chip.value ? 'filled' : 'outlined'}
          color={category === chip.value ? 'primary' : 'default'}
          sx={{
            fontWeight: 700,
            fontSize: '12px',
            height: 32,
            borderRadius: '16px',
            transition: 'all 0.25s ease',
          }}
        />
      ))}
    </Box>
  );

  const renderHistorySearch = () => (
    <Box sx={{
      mb: 2,
      animation: 'fadeSlideUp 0.3s ease-out both',
      animationDelay: '0.1s',
    }}>
      <Paper
        elevation={0}
        sx={{
          p: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          borderRadius: '14px',
          bgcolor: 'surface.surfaceContainerHigh',
          transition: 'background-color 0.3s ease',
        }}
      >
        <IconButton sx={{ p: '8px' }} aria-label="search">
          <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
        </IconButton>
        <InputBase
          sx={{ flex: 1, fontSize: '14px' }}
          placeholder="Search history..."
          value={historySearch}
          onChange={(e) => setHistorySearch(e.target.value)}
        />
        {historySearch && (
          <IconButton sx={{ p: '8px' }} aria-label="clear" onClick={() => setHistorySearch('')}>
            <Clear sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Paper>
    </Box>
  );

  const renderGrid = () => {
    if (filteredData.length === 0) {
      // If we have data in the tab but the filter/search cleared it
      const hasDataInTab = (tab === 'watchlist' ? watchlist : tab === 'favorites' ? favorites : history).length > 0;

      if (hasDataInTab) {
        return (
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pb: 10,
          }}>
            <Typography variant="bodyLarge" color="text.secondary" fontWeight={600} sx={{ textAlign: 'center' }}>
              {historySearch
                ? `No results for "${historySearch}"`
                : category === 'tv'
                  ? 'No series in this list'
                  : 'No movies in this list'}
            </Typography>
            <Typography variant="bodySmall" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              {historySearch ? 'Try a different search term.' : 'Try switching the category filter.'}
            </Typography>
          </Box>
        );
      }

      return (
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          pb: 10,
        }}>
          <EmptyState {...emptyPropsMap[tab]} />
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pb: 14 }}>
        {filteredData.map((movie, index) => (
          <Box key={movie.id} sx={{ width: 'calc(50% - 8px)', display: 'flex', justifyContent: 'center' }}>
            <PosterCard movie={movie} status={getStatus(movie.id)} animDelay={Math.min(index * 0.05, 0.3)} />
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ pb: 12, p: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Title */}
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
        Library
      </Typography>

      {/* Main Tab Selector */}
      <Box sx={{ mb: 3.5 }}>
        <SegmentedButton
          value={tab}
          onChange={handleTabChange}
          fullWidth
          options={[
            { label: 'Watchlist', value: 'watchlist' },
            { label: 'Favorites', value: 'favorites' },
            { label: 'History', value: 'history' }
          ]}
        />
      </Box>

      {/* Content area with animation on tab switch */}
      <Box
        key={`${tab}-${category}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          animation: 'fadeSlideUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        }}
      >
        {/* Category Chips (always visible) */}
        {renderCategoryChips()}

        {/* History Search (only on history tab) */}
        {tab === 'history' && renderHistorySearch()}

        {/* Grid / Empty state */}
        {renderGrid()}
      </Box>
    </Box>
  );
}
