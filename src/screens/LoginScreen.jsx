import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Avatar, Button, IconButton, Chip, Dialog, ListItemButton, ListItemText } from '@mui/material';
import { Refresh, ChevronLeft } from '@mui/icons-material';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import useStore from '../store';
import { supabase } from '../services/supabaseClient';
import GenreChips from '../components/GenreChips';
import ConfirmDialog from '../components/ConfirmDialog';
import { allLanguages } from '../data/languages';

// Custom language filter removed since we now use a Dialog

const genres = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller',
  'Romance', 'Animation', 'Documentary', 'Fantasy', 'Mystery', 'Adventure'
];

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const setUserName = useStore(state => state.setUserName);
  const setAvatar = useStore(state => state.setAvatar);
  const setStoreGenres = useStore(state => state.setGenres || (genres => useStore.setState({ selectedGenres: genres })));
  const setSelectedLanguages = useStore(state => state.setSelectedLanguages);
  const storeGenres = useStore(state => state.selectedGenres);
  const storeLanguages = useStore(state => state.selectedLanguages);
  const setOnboarded = useStore(state => state.setOnboarded);
  const isOnboarded = useStore(state => state.isOnboarded);
  const session = useStore(state => state.session);
  const storeAvatar = useStore(state => state.avatar);
  const storeUserName = useStore(state => state.userName);
  
  const [nameInput, setNameInput] = useState(storeUserName || '');
  const [avatarPreview, setAvatarPreview] = useState(storeAvatar);
  const [genresInput, setGenresInput] = useState(storeGenres || []);
  const [languagesInput, setLanguagesInput] = useState(storeLanguages || []);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tmdbLanguages, setTmdbLanguages] = useState(allLanguages);
  const [langDialogOpen, setLangDialogOpen] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState('');

  // Check router navigation state to determine if user arrived via settings profile edit click
  const isEditing = location.state?.fromSettings === true;

  const toggleLocalGenre = (genre) => {
    setGenresInput(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const hasChanges = 
    nameInput !== (storeUserName || '') || 
    avatarPreview !== storeAvatar || 
    JSON.stringify(genresInput) !== JSON.stringify(storeGenres) ||
    JSON.stringify(languagesInput) !== JSON.stringify(storeLanguages);

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
  }, [isEditing, navigate]);

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

  const handleAvatarClick = () => {
    setIsSpinning(true);
    const seed = Math.floor(Math.random() * 10000);
    const mockAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setAvatarPreview(mockAvatar);
    
    setTimeout(() => {
      setIsSpinning(false);
    }, 600);
  };

  const handleGoogleLogin = async (type = 'create') => {
    setIsLoggingIn(type);
    // Save local selections before redirecting so they persist and can be sent to Supabase in App.jsx
    setUserName(nameInput);
    setAvatar(avatarPreview);
    useStore.setState({ selectedGenres: genresInput, selectedLanguages: languagesInput });
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    });
    if (error) {
      console.error(error);
      setIsLoggingIn(false);
    }
  };

  const isFormValid = genresInput.length > 0 && nameInput.trim().length > 0;

  const handleSubmit = () => {
    if (isFormValid) {
      setUserName(nameInput);
      setAvatar(avatarPreview);
      
      // Update global store AND trigger Supabase sync
      setStoreGenres(genresInput);
      setSelectedLanguages(languagesInput);
      
      setOnboarded(true);
      if (isEditing) {
        navigate('/settings', { replace: true });
      } else {
        navigate('/home');
      }
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
    useStore.setState({ selectedGenres: storeGenres });
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar 
            src={avatarPreview || ''} 
            sx={{ 
              width: 90, 
              height: 90, 
              bgcolor: 'surface.surfaceContainerHighest',
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
            onClick={handleAvatarClick}
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
        <Typography variant="labelMedium" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
          Tap the shuffle icon to change your avatar
        </Typography>
      </Box>

      {/* Text Field with full container width */}
      <Box sx={{ width: '100%', mb: 2.5 }}>
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
      <Box sx={{ width: '100%', mb: 2.5 }}>
        <Typography 
          variant="titleMedium" 
          fontWeight={800} 
          sx={{ 
            mb: 1.5, 
            textAlign: 'center', 
            width: '100%', 
            display: 'block' 
          }}
        >
          Select your favorite genres
        </Typography>
        <Box>
          <GenreChips 
            genres={genres}
            selected={genresInput}
            onChange={toggleLocalGenre}
            wrap
          />
        </Box>
      </Box>

      {/* Language selection row */}
      <Box sx={{ width: '100%', mb: 'auto' }}>
        <Typography 
          variant="titleMedium" 
          fontWeight={800} 
          sx={{ 
            mb: 1.5, 
            textAlign: 'center', 
            width: '100%', 
            display: 'block' 
          }}
        >
          Favorite languages <Typography component="span" variant="labelMedium" color="text.secondary">(Max 3)</Typography>
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {languagesInput.map((langValue) => {
            const label = tmdbLanguages.find(l => l.value === langValue)?.label || langValue;
            return (
              <Chip
                key={langValue}
                label={label}
                onDelete={() => setLanguagesInput(languagesInput.filter(l => l !== langValue))}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 600,
                  borderRadius: '6px',
                  '& .MuiChip-deleteIcon': {
                    color: 'primary.contrastText',
                    opacity: 0.7,
                    '&:hover': { opacity: 1 }
                  }
                }}
              />
            );
          })}
          {languagesInput.length < 3 && (
            <Chip
              label="+ Add Language"
              onClick={() => setLangDialogOpen(true)}
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderRadius: '6px',
                borderColor: 'primary.main',
                color: 'primary.main',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Language Search Dialog */}
      <Dialog 
        open={langDialogOpen} 
        onClose={() => setLangDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: 'surface.surfaceContainer',
            borderRadius: '16px',
            maxHeight: '80vh',
            p: 2
          }
        }}
      >
        <Typography variant="titleLarge" fontWeight={800} sx={{ mb: 2 }}>
          Search Language
        </Typography>
        <TextField
          autoFocus
          fullWidth
          placeholder="Type a language (e.g., Malayalam)..."
          variant="outlined"
          value={langSearchQuery}
          onChange={(e) => setLangSearchQuery(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: 'surface.surfaceContainerHighest',
            }
          }}
        />
        <Box sx={{ overflowY: 'auto', flex: 1, maxHeight: '400px' }}>
          {tmdbLanguages
            .filter(l => l.label.toLowerCase().includes(langSearchQuery.trim().toLowerCase()))
            .slice(0, 20)
            .map(lang => (
              <ListItemButton
                key={lang.value}
                onClick={() => {
                  if (!languagesInput.includes(lang.value)) {
                    setLanguagesInput([...languagesInput, lang.value]);
                  }
                  setLangDialogOpen(false);
                  setLangSearchQuery('');
                }}
                sx={{ borderRadius: '8px', mb: 0.5 }}
              >
                <ListItemText primary={lang.label} />
              </ListItemButton>
            ))}
          {langSearchQuery.trim() && tmdbLanguages.filter(l => l.label.toLowerCase().includes(langSearchQuery.trim().toLowerCase())).length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              No languages found.
            </Typography>
          )}
        </Box>
      </Dialog>
      {(!session && !isEditing) ? (
        <Box sx={{ mt: 'auto', pt: 2, width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={!isFormValid || !!isLoggingIn}
            onClick={() => handleGoogleLogin('create')}
            sx={{ 
              py: 1.6, 
              borderRadius: '8px', 
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: isFormValid ? 'primary.main' : 'action.disabledBackground',
              color: isFormValid ? 'primary.contrastText' : 'action.disabled',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            {isLoggingIn === 'create' ? 'Connecting...' : 'Continue with Google'}
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={() => handleGoogleLogin('signin')}
            disabled={!!isLoggingIn}
            sx={{ 
              py: 1.6, 
              borderRadius: '8px', 
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            {isLoggingIn === 'signin' ? 'Connecting...' : 'Sign in to existing account'}
          </Button>
        </Box>
      ) : (
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!isFormValid}
          onClick={handleSubmit}
          sx={{ 
            mt: 'auto', 
            py: 1.6, 
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
