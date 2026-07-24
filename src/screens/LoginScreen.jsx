import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Avatar, Button, IconButton } from '@mui/material';
import { Refresh, ChevronLeft } from '@mui/icons-material';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import useStore from '../store';
import { genres } from '../data/mockData';
import { supabase } from '../services/supabaseClient';
import GenreChips from '../components/GenreChips';
import ConfirmDialog from '../components/ConfirmDialog';

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const setUserName = useStore(state => state.setUserName);
  const setAvatar = useStore(state => state.setAvatar);
  const toggleGenre = useStore(state => state.toggleGenre);
  const selectedGenres = useStore(state => state.selectedGenres);
  const setOnboarded = useStore(state => state.setOnboarded);
  const isOnboarded = useStore(state => state.isOnboarded);
  const session = useStore(state => state.session);
  const storeAvatar = useStore(state => state.avatar);
  const storeUserName = useStore(state => state.userName);
  
  const [nameInput, setNameInput] = useState(storeUserName || '');
  const [avatarPreview, setAvatarPreview] = useState(storeAvatar);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [initialGenres, setInitialGenres] = useState([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check router navigation state to determine if user arrived via settings profile edit click
  const isEditing = location.state?.fromSettings === true;

  // Store initial genre list snapshot on mount
  useEffect(() => {
    setInitialGenres([...selectedGenres]);
  }, []);

  const hasGenreChanges = 
    selectedGenres.length !== initialGenres.length || 
    selectedGenres.some(g => !initialGenres.includes(g));

  const hasChanges = 
    nameInput !== (storeUserName || '') || 
    avatarPreview !== storeAvatar || 
    hasGenreChanges;

  // Use a ref to track changes without re-triggering useEffect and pushing multiple history states
  const hasChangesRef = React.useRef(hasChanges);
  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  // Intercept browser and device back button pops to show discard confirmation dialog
  useEffect(() => {
    if (!isEditing) return;

    // Push ONE dummy state to history stack to intercept pop state
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e) => {
      if (hasChangesRef.current) {
        // Block pop exit by pushing dummy state back on top
        window.history.pushState(null, '', window.location.href);
        setShowDiscardDialog(true);
      } else {
        navigate('/settings', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEditing, navigate]); // Removed hasChanges from dependency array to prevent multiple pushState calls

  // Only redirect if onboarded AND not explicitly editing their profile (bypassed via fromSettings state)
  if (isOnboarded && !isEditing) {
    return <Navigate to="/home" replace />;
  }

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
    
    setTimeout(() => {
      setIsSpinning(false);
    }, 600);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    // Save local selections before redirecting so they persist and can be sent to Supabase in App.jsx
    setUserName(nameInput);
    setAvatar(avatarPreview);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      console.error(error);
      setIsLoggingIn(false);
    }
  };

  const isFormValid = selectedGenres.length > 0 && nameInput.trim().length > 0;

  const handleSubmit = () => {
    if (isFormValid) {
      // Name and avatar are handled by App.jsx fetching the profile
      setOnboarded(true);
      navigate('/home');
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  const handleConfirmDiscard = () => {
    useStore.setState({ selectedGenres: initialGenres });
    setShowDiscardDialog(false);
    navigate('/settings', { replace: true });
  };

  return (
    <Box sx={{ 
      p: 3, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      alignItems: 'center',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Back Button matching details styling */}
      {isEditing && (
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16,
          zIndex: 2,
        }}>
          <IconButton 
            onClick={handleBack} 
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.6)', 
              color: 'primary.contrastText', 
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } 
            }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>
      )}

      {/* Centered logo and tagline */}
      <Box 
        sx={{ 
          mt: isEditing ? 8 : 5, 
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
            color: 'primary.main',
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
          {isEditing ? 'Update your profile preferences' : 'Discover your next favorite movie'}
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
              borderColor: avatarPreview ? 'primary.main' : 'surface.surfaceContainerHighest',
              transition: 'border-color 0.3s ease',
            }}
          />
          <IconButton 
            sx={{ 
              position: 'absolute', 
              bottom: -4, 
              right: -4,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              border: '3px solid',
              borderColor: 'background.default',
              '&:hover': { bgcolor: 'primary.dark' },
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
                color: 'primary.contrastText',
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

      {(!session && !isEditing) ? (
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!isFormValid || isLoggingIn}
          onClick={handleGoogleLogin}
          sx={{ 
            mt: 5, 
            py: 1.8, 
            borderRadius: '8px', 
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: isFormValid ? 'surface.surfaceContainerHighest' : 'action.disabledBackground',
            color: isFormValid ? 'text.primary' : 'action.disabled',
            border: '1px solid',
            borderColor: isFormValid ? 'surface.surfaceContainerHighest' : 'transparent',
            '&:hover': {
              bgcolor: 'surface.surfaceContainer',
            }
          }}
        >
          {isLoggingIn ? 'Connecting...' : 'Sign in with Google to Continue'}
        </Button>
      ) : (
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
            bgcolor: isFormValid ? 'primary.main' : 'action.disabledBackground',
            color: isFormValid ? 'primary.contrastText' : 'action.disabled',
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }}
        >
          {isEditing ? 'Save Changes' : 'Complete Setup'}
        </Button>
      )}

      {/* Discard changes dialog matches Yes/No format */}
      <ConfirmDialog
        open={showDiscardDialog}
        title="Discard Changes?"
        content="You have unsaved changes. Are you sure you want to leave without saving?"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardDialog(false)}
        confirmText="Yes"
        cancelText="No"
      />
    </Box>
  );
}
