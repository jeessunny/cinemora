import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { HomeRounded, SearchRounded, VideoLibraryRounded, SettingsRounded } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const floatingNavBar = useStore(state => state.floatingNavBar);
  const animationsEnabled = useStore(state => state.animationsEnabled);
  const navSettingsEnabled = useStore(state => state.navSettingsEnabled ?? true);

  const getTabValue = () => {
    const path = location.pathname;
    if (path.includes('/home')) return 'home';
    if (path.includes('/search')) return 'search';
    if (path.includes('/library') || path.includes('/saved')) return 'library';
    if (path.includes('/settings') || path.includes('/setting')) return 'settings';
    return 'none';
  };

  // Dynamic animated style for the nav bar
  const navStyle = {
    position: 'fixed',
    bottom: floatingNavBar ? 'calc(16px + env(safe-area-inset-bottom))' : 0,
    left: floatingNavBar ? 20 : 0,
    right: floatingNavBar ? 20 : 0,
    zIndex: 1000,
    borderRadius: floatingNavBar ? '32px' : 0,
    overflow: 'hidden',
    bgcolor: 'surface.surfaceContainer',
    backgroundImage: 'none !important',
    boxShadow: floatingNavBar ? '0 8px 30px rgba(0, 0, 0, 0.45)' : '0 -1px 8px rgba(0, 0, 0, 0.2)',
    border: '1px solid',
    borderBottomWidth: floatingNavBar ? '1px' : 0,
    borderLeftWidth: floatingNavBar ? '1px' : 0,
    borderRightWidth: floatingNavBar ? '1px' : 0,
    borderColor: 'divider',
    paddingBottom: floatingNavBar ? 0 : 'env(safe-area-inset-bottom)',
    // Premium spring-like transition for morphing between floating and fixed states, and changing items
    transition: animationsEnabled ? 'all 0.5s cubic-bezier(0.34, 1.3, 0.64, 1)' : 'none',
    
    // Initial entrance animation
    animation: animationsEnabled ? 'slideUpNav 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' : 'none',
    animationDelay: animationsEnabled ? '0.15s' : '0s',
  };

  return (
    <Paper 
      elevation={0}
      sx={navStyle} 
    >
      <BottomNavigation
        value={getTabValue()}
        showLabels
        sx={{
          bgcolor: 'transparent',
          height: floatingNavBar ? 64 : 72,
          transition: animationsEnabled ? 'all 0.5s cubic-bezier(0.34, 1.3, 0.64, 1)' : 'none',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            color: 'text.secondary',
            opacity: 0.8,
            transition: animationsEnabled ? 'color 0.3s, opacity 0.3s, transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1), max-width 0.5s cubic-bezier(0.34, 1.3, 0.64, 1), min-width 0.5s cubic-bezier(0.34, 1.3, 0.64, 1), padding 0.5s ease, flex 0.5s cubic-bezier(0.34, 1.3, 0.64, 1)' : 'none',
            '&.Mui-selected': {
              color: 'primary.main',
              opacity: 1,
              transform: 'none',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 26,
              mb: 0.5,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1)',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
              transform: 'scale(1.1)',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '11px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.3s',
            },
            '&.Mui-selected .MuiBottomNavigationAction-label': {
              fontSize: '12px',
              fontWeight: 700,
            }
          }
        }}
      >
        <BottomNavigationAction 
          label="Home" 
          value="home"
          icon={<HomeRounded />} 
          disableRipple
          onClick={() => navigate('/home')}
        />
        <BottomNavigationAction 
          label="Search" 
          value="search"
          icon={<SearchRounded />} 
          disableRipple
          onClick={() => navigate('/search')}
        />
        <BottomNavigationAction 
          label="Library" 
          value="library"
          icon={<VideoLibraryRounded />} 
          disableRipple
          onClick={() => navigate('/library')}
        />
        <BottomNavigationAction 
          label="Settings" 
          value="settings"
          icon={<SettingsRounded />} 
          disableRipple
          onClick={() => navigate('/settings')}
          sx={{
            flex: navSettingsEnabled ? 1 : 0,
            maxWidth: navSettingsEnabled ? 168 : 0,
            minWidth: navSettingsEnabled ? 'auto' : 0,
            padding: navSettingsEnabled ? undefined : 0,
            opacity: navSettingsEnabled ? undefined : '0 !important',
            pointerEvents: navSettingsEnabled ? 'auto' : 'none',
            overflow: 'hidden'
          }}
        />
      </BottomNavigation>
    </Paper>
  );
}
