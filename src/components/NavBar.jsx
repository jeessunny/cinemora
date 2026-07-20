import React, { useState } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { HomeRounded, SearchRounded, BookmarkRounded, SettingsRounded } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ripples, setRipples] = useState([]);
  const floatingNavBar = useStore(state => state.floatingNavBar);
  const animationsEnabled = useStore(state => state.animationsEnabled);
  const navBarAnimationEnabled = useStore(state => state.navBarAnimationEnabled);

  const showRipple = animationsEnabled && navBarAnimationEnabled;

  const getActiveIndex = () => {
    const path = location.pathname;
    if (path.includes('/search')) return 1;
    if (path.includes('/saved')) return 2;
    if (path.includes('/settings') || path.includes('/setting')) return 3;
    return 0;
  };

  const handleRipple = (e) => {
    if (!showRipple) return;
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

    // Clean up ripple element after animation finishes (1.6s)
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1600);
  };

  // Floating pill style
  const floatingStyle = {
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
    animation: animationsEnabled ? 'slideUpNav 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' : 'none',
    animationDelay: animationsEnabled ? '0.15s' : '0s',
  };

  // Fixed bottom style (traditional)
  const fixedStyle = {
    position: 'fixed', 
    bottom: 0,
    left: 0, 
    right: 0, 
    zIndex: 1000,
    borderRadius: 0,
    overflow: 'hidden',
    bgcolor: 'surface.surfaceContainer',
    backgroundImage: 'none !important',
    boxShadow: '0 -1px 8px rgba(0, 0, 0, 0.2)',
    borderTop: '1px solid',
    borderColor: 'surface.surfaceContainerHighest',
    paddingBottom: 'env(safe-area-inset-bottom)',
  };

  return (
    <Paper 
      elevation={0}
      sx={floatingNavBar ? floatingStyle : fixedStyle} 
    >
      {/* Custom Water Ripples container */}
      {showRipple && (
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
      )}

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
              transition: animationsEnabled ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
              color: 'primary.main',
              transform: animationsEnabled ? 'scale(1.1)' : 'none',
            }
          }
        }}
      >
        <BottomNavigationAction 
          label="Home" 
          icon={<HomeRounded />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/home')}
        />
        <BottomNavigationAction 
          label="Search" 
          icon={<SearchRounded />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/search')}
        />
        <BottomNavigationAction 
          label="Saved" 
          icon={<BookmarkRounded />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/saved')}
        />
        <BottomNavigationAction 
          label="Settings" 
          icon={<SettingsRounded />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/settings')}
        />
      </BottomNavigation>
    </Paper>
  );
}
