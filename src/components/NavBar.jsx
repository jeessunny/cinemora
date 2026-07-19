import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Search, Bookmark } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveIndex = () => {
    const path = location.pathname;
    if (path.includes('/search')) return 1;
    if (path.includes('/saved')) return 2;
    return 0;
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        position: 'fixed', 
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        left: 20, 
        right: 20, 
        zIndex: 1000,
        borderRadius: '32px',
        overflow: 'hidden',
        bgcolor: 'surface.surfaceContainer',
        backgroundImage: 'none !important',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        border: '1px solid',
        borderColor: 'surface.surfaceContainerHighest',
        animation: 'slideUpNav 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        animationDelay: '0.15s',
      }} 
    >
      <BottomNavigation
        showLabels
        value={getActiveIndex()}
        onChange={(event, newValue) => {
          const routes = ['/home', '/search', '/saved'];
          navigate(routes[newValue]);
        }}
        sx={{
          backgroundColor: 'transparent',
          height: 72,
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            py: 1.2,
            transition: 'color 0.25s ease, transform 0.25s ease',
            '&.Mui-selected': {
              color: 'primary.main',
            },
            '& .MuiBottomNavigationAction-label': {
              mt: 0.5,
              fontSize: '11px',
              fontWeight: 600,
              transition: 'font-size 0.2s ease',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 22,
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
              color: 'primary.main',
              transform: 'scale(1.1)',
            }
          }
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Search" icon={<Search />} />
        <BottomNavigationAction label="Saved" icon={<Bookmark />} />
      </BottomNavigation>
    </Paper>
  );
}
