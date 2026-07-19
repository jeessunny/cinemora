import React, { useState } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { Home, Search, Bookmark } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ripples, setRipples] = useState([]);

  const getActiveIndex = () => {
    const path = location.pathname;
    if (path.includes('/search')) return 1;
    if (path.includes('/saved')) return 2;
    return 0;
  };

  const handleRipple = (e) => {
    // Only trigger ripple for primary pointers (mouse left click or touch)
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const navRect = e.currentTarget.parentElement.getBoundingClientRect();
    
    // Calculate center coordinates of the button relative to the entire navigation bar container
    const x = buttonRect.left - navRect.left + buttonRect.width / 2;
    const y = buttonRect.top - navRect.top + buttonRect.height / 2;

    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Clean up ripple element after animation finishes (1.2s)
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1200);
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
      {/* Custom Red Water Ripples container - placed between background and buttons */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1 }}>
        {ripples.map(ripple => (
          <Box
            key={ripple.id}
            className="water-ripple-custom"
            sx={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        ))}
      </Box>

      <BottomNavigation
        showLabels
        value={getActiveIndex()}
        sx={{
          backgroundColor: 'transparent',
          height: 72,
          position: 'relative',
          zIndex: 2,
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            py: 1.2,
            transition: 'color 0.25s ease, transform 0.25s ease',
            // Aggressively hide default MUI white ripple and background highlight
            WebkitTapHighlightColor: 'transparent',
            '& .MuiTouchRipple-root': {
              display: 'none !important',
            },
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&.Mui-selected': {
              color: 'primary.main',
              backgroundColor: 'transparent',
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
        <BottomNavigationAction 
          label="Home" 
          icon={<Home />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/home')}
        />
        <BottomNavigationAction 
          label="Search" 
          icon={<Search />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/search')}
        />
        <BottomNavigationAction 
          label="Saved" 
          icon={<Bookmark />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/saved')}
        />
      </BottomNavigation>
    </Paper>
  );
}
