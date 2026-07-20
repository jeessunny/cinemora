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
    borderColor: 'surface.surfaceContainerHighest',
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
            transition: 'color 0.3s, opacity 0.3s, transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1)',
            '&.Mui-selected': {
              color: 'primary.main',
              opacity: 1,
              transform: 'scale(1.1)',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 26,
              mb: 0.5,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1)',
            },
            '&.Mui-selected .MuiSvgIcon-root': {
              transform: 'scale(1.15)',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '11px',
              fontWeight: 600,
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
          icon={<HomeRounded />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/home')}
        />
        {navSearchEnabled && (
          <BottomNavigationAction 
            label="Search" 
            icon={<SearchRounded />} 
            disableRipple
            onPointerDown={handleRipple}
            onClick={() => navigate('/search')}
          />
        )}
        <BottomNavigationAction 
          label="Saved" 
          icon={<BookmarkRounded />} 
          disableRipple
          onPointerDown={handleRipple}
          onClick={() => navigate('/saved')}
        />
        {navSettingsEnabled && (
          <BottomNavigationAction 
            label="Settings" 
            icon={<SettingsRounded />} 
            disableRipple
            onPointerDown={handleRipple}
            onClick={() => navigate('/settings')}
          />
        )}
      </BottomNavigation>
    </Paper>
  );
}
