import React, { useState } from 'react';
import { 
  Box, Typography, Avatar, List, ListItem, ListItemButton, 
  ListItemText, ListItemIcon, Divider, IconButton 
} from '@mui/material';
import { DeleteSweep, RestartAlt, ChevronLeft, Palette } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import ConfirmDialog from '../components/ConfirmDialog';
import SegmentedButton from '../components/SegmentedButton';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const userName = useStore(state => state.userName);
  const avatar = useStore(state => state.avatar);
  const selectedGenres = useStore(state => state.selectedGenres);
  const themeMode = useStore(state => state.themeMode);
  const setThemeMode = useStore(state => state.setThemeMode);
  const clearHistory = useStore(state => state.clearHistory);
  const resetRecommendations = useStore(state => state.resetRecommendations);
  const setOnboarded = useStore(state => state.setOnboarded);

  const [confirmDialog, setConfirmDialog] = useState(null);

  const handleClearHistory = () => {
    clearHistory();
    setConfirmDialog(null);
  };

  const handleResetRecommendations = () => {
    resetRecommendations();
    setConfirmDialog(null);
    setOnboarded(false);
    navigate('/');
  };

  return (
    <Box sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header - Centered title text with back button matched to movie details style */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ 
            position: 'absolute', 
            left: 16,
            bgcolor: 'rgba(0,0,0,0.6)', 
            color: 'white', 
            backdropFilter: 'blur(8px)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } 
          }}
        >
          <ChevronLeft />
        </IconButton>
        <Typography 
          variant="titleLarge" 
          sx={{ 
            fontWeight: 800, 
            textAlign: 'center',
            width: '100%',
            display: 'block'
          }}
        >
          Settings
        </Typography>
      </Box>

      {/* Profile Card Restructured */}
      <Box sx={{ 
        pl: 2.5,
        pr: 3.5,
        mb: 4, 
        mx: 2,
        py: 3,
        bgcolor: 'surface.surfaceContainerLow',
        borderRadius: '16px',
        display: 'flex', 
        alignItems: 'center', 
        gap: 2.5,
        boxSizing: 'border-box'
      }}>
        <Avatar 
          src={avatar || ''} 
          sx={{ 
            width: 72, 
            height: 72,
            border: '2px solid',
            borderColor: 'primary.main',
            flexShrink: 0
          }} 
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, flex: 1 }}>
          <Typography 
            variant="titleMedium" 
            fontWeight={800} 
            color="text.primary"
            sx={{ 
              lineHeight: 1.2,
              mb: 0.8,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {userName || 'Movie Lover'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="bodySmall" color="text.secondary" sx={{ fontWeight: 500 }}>
              {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
            </Typography>
            <Typography variant="bodySmall" color="text.secondary" sx={{ opacity: 0.5 }}>
              •
            </Typography>
            <Typography 
              variant="bodySmall" 
              color="primary.main" 
              onClick={() => {
                // Pass fromSettings state to flag the edit profile flow correctly
                navigate('/', { state: { fromSettings: true } });
              }}
              sx={{ 
                cursor: 'pointer', 
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Edit Profile
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Settings List */}
      <List sx={{ 
        bgcolor: 'surface.surfaceContainer', 
        borderRadius: '16px', 
        mx: 2, 
        overflow: 'hidden' 
      }}>
        {/* Theme Mode Segmented Button */}
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', py: 2.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Palette color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Theme Mode" 
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </Box>
          <SegmentedButton
            value={themeMode}
            onChange={setThemeMode}
            fullWidth
            options={[
              { label: 'Light', value: 'light' },
              { label: 'System', value: 'system' },
              { label: 'Dark', value: 'dark' }
            ]}
          />
        </ListItem>
        
        <Divider sx={{ mx: 2 }} />
        
        <ListItemButton sx={{ py: 2 }} onClick={() => setConfirmDialog('history')}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <DeleteSweep />
          </ListItemIcon>
          <ListItemText 
            primary="Clear Watch History" 
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItemButton>
        
        <Divider sx={{ mx: 2 }} />
        
        <ListItemButton sx={{ py: 2 }} onClick={() => setConfirmDialog('reset')}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <RestartAlt color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Reset Recommendations" 
            primaryTypographyProps={{ color: 'error', fontWeight: 600 }} 
          />
        </ListItemButton>
      </List>

      <Typography 
        variant="labelMedium" 
        color="text.secondary" 
        align="center" 
        sx={{ mt: 4, display: 'block', opacity: 0.6 }}
      >
        Cinemora v1.0.0
      </Typography>

      <ConfirmDialog
        open={confirmDialog === 'history'}
        title="Clear History?"
        content="Are you sure you want to clear your watch history? This cannot be undone."
        onConfirm={handleClearHistory}
        onCancel={() => setConfirmDialog(null)}
      />

      <ConfirmDialog
        open={confirmDialog === 'reset'}
        title="Reset Recommendations?"
        content="This will clear your genres, watchlist, favorites, and history. You will be taken back to the onboarding screen."
        onConfirm={handleResetRecommendations}
        onCancel={() => setConfirmDialog(null)}
        confirmText="Reset"
      />
    </Box>
  );
}
