import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Avatar, Button, IconButton } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useNavigate, Navigate } from 'react-router-dom';
import useStore from '../store';
import { genres } from '../data/mockData';
import GenreChips from '../components/GenreChips';

export default function LoginScreen() {
  const navigate = useNavigate();
  const setUserName = useStore(state => state.setUserName);
  const setAvatar = useStore(state => state.setAvatar);
  const toggleGenre = useStore(state => state.toggleGenre);
  const selectedGenres = useStore(state => state.selectedGenres);
  const setOnboarded = useStore(state => state.setOnboarded);
  const isOnboarded = useStore(state => state.isOnboarded);
  const storeAvatar = useStore(state => state.avatar);
  const storeUserName = useStore(state => state.userName);
  
  const [nameInput, setNameInput] = useState(storeUserName || '');
  const [avatarPreview, setAvatarPreview] = useState(storeAvatar);
  const [isSpinning, setIsSpinning] = useState(false); // Track spinning state for refresh icon

  if (isOnboarded) {
    return <Navigate to="/home" replace />;
  }

  // Pre-generate a default random avatar seed on first load
  useEffect(() => {
    if (!avatarPreview) {
      const seed = Math.floor(Math.random() * 10000);
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
      setAvatarPreview(defaultAvatar);
    }
  }, [avatarPreview]);

  const handleAvatarChange = () => {
    setIsSpinning(true);
    const seed = Math.floor(Math.random() * 10000);
    const mockAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setAvatarPreview(mockAvatar);
    
    // Stop spinning after 600ms (duration of transition) to reset state instantly
    setTimeout(() => {
      setIsSpinning(false);
    }, 600);
  };

  const isFormValid = nameInput.trim() !== '' && avatarPreview !== null && selectedGenres.length > 0;

  const handleSubmit = () => {
    if (isFormValid) {
      setUserName(nameInput.trim());
      setAvatar(avatarPreview);
      setOnboarded(true);
      navigate('/home');
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Centered logo and tagline at the top */}
      <Box 
        sx={{ 
          mt: 5, 
          mb: 4.5, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '100%',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="displayMedium" 
          component="h1"
          sx={{ 
            fontWeight: 900, 
            letterSpacing: '-2px', 
            color: '#E50914',
            mb: 1.5, 
            textAlign: 'center',
            width: '100%',
            display: 'block',
            textTransform: 'none'
          }}
        >
          Cinemora
        </Typography>
        <Typography 
          variant="bodyLarge" 
          color="text.secondary" 
          sx={{ 
            fontWeight: 600,
            textAlign: 'center',
            width: '100%',
            display: 'block',
            maxWidth: '300px',
            lineHeight: 1.3
          }}
        >
          Discover your next favorite movie
        </Typography>
      </Box>

      {/* Avatar Picker Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar 
            src={avatarPreview || ''} 
            sx={{ 
              width: 110, 
              height: 110, 
              bgcolor: 'surface.surfaceContainerHighest',
              border: '3px solid',
              borderColor: avatarPreview ? '#E50914' : 'surface.surfaceContainerHighest',
              transition: 'border-color 0.3s ease',
            }}
          />
          <IconButton 
            sx={{ 
              position: 'absolute', 
              bottom: -4, 
              right: -4,
              bgcolor: '#E50914',
              color: '#FFFFFF',
              border: '3px solid',
              borderColor: 'background.default',
              '&:hover': { bgcolor: '#B20710' },
              width: 36,
              height: 36,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0
            }}
            onClick={handleAvatarChange}
          >
            <Refresh 
              sx={{ 
                fontSize: 20, 
                color: '#FFFFFF',
                // Dynamic rotation transition effect
                transition: isSpinning ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                transform: isSpinning ? 'rotate(360deg)' : 'rotate(0deg)'
              }} 
            />
          </IconButton>
        </Box>
        <Typography variant="labelMedium" color="text.secondary" sx={{ mt: 1.5, fontWeight: 600 }}>
          Tap the shuffle icon to change your avatar
        </Typography>
      </Box>

      {/* Text Field with full container width */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <TextField
          fullWidth
          label="What should we call you?"
          variant="outlined"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
        />
      </Box>

      {/* Genre selection row */}
      <Box sx={{ width: '100%' }}>
        <Typography 
          variant="titleMedium" 
          fontWeight={800} 
          sx={{ 
            mb: 2, 
            textAlign: 'center', 
            width: '100%', 
            display: 'block' 
          }}
        >
          Select your favorite genres
        </Typography>
        <Box sx={{ mb: 'auto' }}>
          <GenreChips 
            genres={genres}
            selected={selectedGenres}
            onChange={toggleGenre}
            wrap
          />
        </Box>
      </Box>

      <Button
        variant="contained"
        fullWidth
        size="large"
        disabled={!isFormValid}
        onClick={handleSubmit}
        sx={{ 
          mt: 5, 
          py: 1.8, 
          borderRadius: '8px', 
          fontSize: '16px',
          fontWeight: 700,
          textTransform: 'none',
          bgcolor: isFormValid ? '#E50914' : 'action.disabledBackground',
          color: isFormValid ? '#FFFFFF' : 'action.disabled',
          '&:hover': {
            bgcolor: '#B20710'
          }
        }}
      >
        Get Started
      </Button>
    </Box>
  );
}
