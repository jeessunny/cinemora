import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BookmarkBorder, FavoriteBorder, HistoryToggleOff } from '@mui/icons-material';
import useStore from '../store';
import SegmentedButton from '../components/SegmentedButton';
import PosterCard from '../components/PosterCard';
import EmptyState from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function SavedScreen() {
  const navigate = useNavigate();
  const watchlist = useStore(state => state.watchlist);
  const favorites = useStore(state => state.favorites);
  const history = useStore(state => state.history);
  const [tab, setTab] = useState('watchlist');

  const renderContent = () => {
    let data = [];
    let emptyProps = {};
    let status = '';

    switch (tab) {
      case 'watchlist':
        data = watchlist;
        status = 'watchlist';
        emptyProps = {
          icon: BookmarkBorder,
          title: 'Your watchlist is empty',
          subtitle: 'Save movies you want to watch later.',
          actionLabel: 'Find Movies',
          onAction: () => navigate('/search')
        };
        break;
      case 'favorites':
        data = favorites;
        status = 'favorite';
        emptyProps = {
          icon: FavoriteBorder,
          title: 'No favorites yet',
          subtitle: 'Heart the movies you love to see them here.',
          actionLabel: 'Discover',
          onAction: () => navigate('/home')
        };
        break;
      case 'history':
        data = history;
        status = 'history';
        emptyProps = {
          icon: HistoryToggleOff,
          title: 'No watch history',
          subtitle: 'Movies you mark as watched will appear here.',
        };
        break;
      default:
        break;
    }

    if (data.length === 0) {
      return (
        <Box 
          sx={{ 
            flexGrow: 1,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            boxSizing: 'border-box',
            pb: 10
          }}
        >
          <EmptyState {...emptyProps} />
        </Box>
      );
    }

    const getStatus = (id) => {
      const statuses = [];
      if (history.some(m => m.id === id)) statuses.push('history');
      if (favorites.some(m => m.id === id)) statuses.push('favorite');
      if (watchlist.some(m => m.id === id)) statuses.push('watchlist');
      return statuses.length > 0 ? statuses : null;
    };

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {data.map((movie, index) => (
          <Box key={movie.id} sx={{ width: 'calc(50% - 8px)', display: 'flex', justifyContent: 'center' }}>
            <PosterCard movie={movie} status={getStatus(movie.id)} animDelay={Math.min(index * 0.05, 0.3)} />
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ pb: 12, p: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Left-aligned Saved Screen Title */}
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
        Saved
      </Typography>

      <Box sx={{ mb: 3.5 }}>
        <SegmentedButton
          value={tab}
          onChange={setTab}
          fullWidth
          options={[
            { label: 'Watchlist', value: 'watchlist' },
            { label: 'Favorites', value: 'favorites' },
            { label: 'History', value: 'history' }
          ]}
        />
      </Box>

      {/* Animated content area — key forces remount on tab switch for fadeSlideUp replay */}
      <Box
        key={tab}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          animation: 'fadeSlideUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}
