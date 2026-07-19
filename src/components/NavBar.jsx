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
        overflow: 'hidden', // Clips the ripple at the pill-shaped nav bar edges
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
          overflow: 'visible', // Allow ripples to flow beyond individual buttons
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            py: 1.2,
            overflow: 'visible', // Let the ripple escape the button boundary
            position: 'relative',
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
            },
            // Override MUI TouchRipple — allow it to overflow the button and expand to the nav bar edges
            '& .MuiTouchRipple-root': {
              overflow: 'visible', // Ripple is not clipped by the button
            },
            '& .MuiTouchRipple-ripple': {
              // Larger ripple that reaches the nav bar edges
              transform: 'scale(1)',
              animation: 'waterRipple 0.7s cubic-bezier(0, 0.2, 0.4, 1) forwards',
            },
            '& .MuiTouchRipple-rippleVisible': {
              opacity: 1,
              animation: 'waterRipple 0.7s cubic-bezier(0, 0.2, 0.4, 1) forwards',
            },
            '& .MuiTouchRipple-child': {
              borderRadius: '50%',
              backgroundColor: 'currentColor',
            },
            '& .MuiTouchRipple-childLeaving': {
              animation: 'waterRippleFade 0.5s ease-out forwards',
            },
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
