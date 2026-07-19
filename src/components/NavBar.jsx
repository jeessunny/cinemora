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
        bottom: 'calc(16px + env(safe-area-inset-bottom))', // Perfect safe area offsets
        left: 20, 
        right: 20, 
        zIndex: 1000,
        borderRadius: '32px', // Premium curved Apple-style rounded pill
        overflow: 'hidden',
        bgcolor: 'surface.surfaceContainer', // Solid surface container color (no transparent glass effect)
        backgroundImage: 'none !important',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)', // Premium soft drop shadow
        border: '1px solid',
        borderColor: 'surface.surfaceContainerHighest'
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
          backgroundColor: 'transparent', // Inherits Paper solid color
          height: 72, // Sleeker compact height
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            py: 1.2,
            '&.Mui-selected': {
              color: 'primary.main',
            },
            '& .MuiBottomNavigationAction-label': {
              mt: 0.5,
              fontSize: '11px',
              fontWeight: 600,
            },
            '& .MuiSvgIcon-root': {
              fontSize: 22,
              transition: 'transform 0.2s ease-in-out',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
              color: 'primary.main',
              transform: 'scale(1.1)' // Micro-interaction scale feedback
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
