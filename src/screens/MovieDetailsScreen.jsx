import React, { useMemo, useEffect, useState } from 'react';
import { Box, Typography, IconButton, Avatar, Chip, Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  ChevronLeft, Favorite, FavoriteBorder, 
  Bookmark, BookmarkBorder, Share, CheckCircle, CheckCircleOutline 
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { mockMovies } from '../data/mockData';
import ScrollRail from '../components/ScrollRail';

export default function MovieDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState('');
  const [bounceId, setBounceId] = useState(null);
  
  const watchlist = useStore(state => state.watchlist);
  const addToWatchlist = useStore(state => state.addToWatchlist);
  const removeFromWatchlist = useStore(state => state.removeFromWatchlist);
  const favorites = useStore(state => state.favorites);
  const addToFavorites = useStore(state => state.addToFavorites);
  const removeFromFavorites = useStore(state => state.removeFromFavorites);
  const history = useStore(state => state.history);
  const addToHistory = useStore(state => state.addToHistory);
  const removeFromHistory = useStore(state => state.removeFromHistory);

  const movie = useMemo(() => mockMovies.find(m => m.id === parseInt(id)), [id]);
  const moreLikeThis = useMemo(() => {
    if (!movie) return [];
    return mockMovies
      .filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.includes(g)))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10);
  }, [movie]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  if (!movie) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Typography color="text.secondary">Movie not found</Typography>
      </Box>
    );
  }

  const isWatchlist = watchlist.some(m => m.id === movie.id);
  const isFavorite = favorites.some(m => m.id === movie.id);
  const isHistory = history.some(m => m.id === movie.id);

  const triggerBounce = (name) => {
    setBounceId(name);
    setTimeout(() => setBounceId(null), 350);
  };

  const toggleWatchlist = () => {
    triggerBounce('watchlist');
    if (isWatchlist) {
      removeFromWatchlist(movie.id);
      setSnackbar('Removed from watchlist');
    } else {
      addToWatchlist(movie);
      setSnackbar('Added to watchlist');
    }
  };

  const toggleFavorite = () => {
    triggerBounce('favorite');
    if (isFavorite) {
      removeFromFavorites(movie.id);
      setSnackbar('Removed from favorites');
    } else {
      addToFavorites(movie);
      setSnackbar('Added to favorites');
    }
  };

  const toggleHistory = () => {
    triggerBounce('history');
    if (isHistory) {
      removeFromHistory(movie.id);
      setSnackbar('Unmarked as watched');
    } else {
      addToHistory(movie);
      setSnackbar('Marked as watched');
    }
  };

  const handleShare = async () => {
    triggerBounce('share');
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} on Cinemora!`,
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled share
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setSnackbar('Link copied!');
    }
  };

  const getStatus = (mId) => {
    if (history.some(m => m.id === mId)) return 'history';
    if (favorites.some(m => m.id === mId)) return 'favorite';
    if (watchlist.some(m => m.id === mId)) return 'watchlist';
    return null;
  };

  const scrimColor = theme.palette.mode === 'dark' ? '15, 13, 13' : '255, 255, 255';

  const actionButtonStyle = (name) => ({
    textAlign: 'center', 
    cursor: 'pointer',
    animation: bounceId === name ? 'iconBounce 0.35s ease' : 'none',
  });

  return (
    <Box sx={{ pb: 6, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Backdrop with reveal animation */}
      <Box 
        sx={{ 
          position: 'relative', 
          height: 360,
          backgroundImage: `url(${movie.backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'backdropReveal 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        }}
      >
        {/* Back Button */}
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, right: 0, 
          p: 2, pt: 'max(env(safe-area-inset-top), 16px)',
          zIndex: 2,
          animation: 'fadeIn 0.4s ease both',
          animationDelay: '0.3s',
        }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.6)', 
              color: 'white', 
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              transition: 'transform 0.2s ease',
              '&:active': { transform: 'scale(0.9)' },
            }}
          >
            <ChevronLeft />
          </IconButton>
        </Box>
        {/* Dynamic Gradient Scrim */}
        <Box sx={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: `linear-gradient(to top, rgba(${scrimColor}, 1) 0%, rgba(${scrimColor}, 0.65) 50%, rgba(${scrimColor}, 0) 100%)` 
        }} />
      </Box>

      {/* Poster + Info with slide-up animation */}
      <Box sx={{ 
        px: 2, mt: -10, position: 'relative', display: 'flex', gap: 2.5, zIndex: 1,
        animation: 'fadeSlideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        animationDelay: '0.2s',
      }}>
        <Box 
          component="img"
          src={movie.posterUrl}
          alt={movie.title}
          sx={{ 
            width: 120, 
            height: 180, 
            borderRadius: '8px', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            objectFit: 'cover',
            flexShrink: 0,
            animation: 'scaleIn 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
            animationDelay: '0.25s',
          }}
        />
        <Box sx={{ pt: 10, flex: 1, minWidth: 0 }}>
          {/* Centered Movie Title in a full width block */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Typography 
              variant="headlineSmall" 
              fontWeight={800} 
              sx={{ 
                lineHeight: 1.25, 
                textAlign: 'center',
                width: '100%',
                display: 'block',
                animation: 'staggerUp 0.4s ease-out both',
                animationDelay: '0.35s',
              }}
            >
              {movie.title}
            </Typography>
          </Box>
          <Typography 
            variant="bodySmall" 
            color="text.secondary" 
            fontWeight={600}
            sx={{ 
              letterSpacing: '0.2px',
              display: 'block',
              mt: 0.5,
              textAlign: 'center',
              width: '100%',
              animation: 'staggerUp 0.4s ease-out both',
              animationDelay: '0.4s',
            }}
          >
            {movie.year}   •   {movie.runtime}   •   ★ {movie.rating}
          </Typography>
          <Box sx={{ 
            display: 'flex', gap: 0.8, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {movie.genres.map((g, i) => (
              <Chip 
                key={g} 
                label={g} 
                size="small" 
                variant="outlined" 
                sx={{ 
                  fontSize: '10px', 
                  height: 22, 
                  borderRadius: '4px',
                  animation: 'chipCascade 0.3s ease-out both',
                  animationDelay: `${0.45 + i * 0.06}s`,
                }} 
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Action Buttons with bounce feedback */}
      <Box sx={{ 
        display: 'flex', justifyContent: 'space-around', px: 2, my: 4.5,
        animation: 'fadeSlideUp 0.45s ease-out both',
        animationDelay: '0.4s',
      }}>
        <Box sx={actionButtonStyle('history')} onClick={toggleHistory}>
          <IconButton color={isHistory ? "success" : "default"} size="large">
            {isHistory ? <CheckCircle /> : <CheckCircleOutline />}
          </IconButton>
          <Typography variant="labelSmall" display="block" color={isHistory ? "success.main" : "text.secondary"} sx={{ fontWeight: 700 }}>
            Watched
          </Typography>
        </Box>
        <Box sx={actionButtonStyle('favorite')} onClick={toggleFavorite}>
          <IconButton color={isFavorite ? "error" : "default"} size="large">
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <Typography variant="labelSmall" display="block" color={isFavorite ? "error.main" : "text.secondary"} sx={{ fontWeight: 700 }}>
            Favorite
          </Typography>
        </Box>
        <Box sx={actionButtonStyle('watchlist')} onClick={toggleWatchlist}>
          <IconButton color={isWatchlist ? "primary" : "default"} size="large">
            {isWatchlist ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
          <Typography variant="labelSmall" display="block" color={isWatchlist ? "primary.main" : "text.secondary"} sx={{ fontWeight: 700 }}>
            Watchlist
          </Typography>
        </Box>
        <Box sx={actionButtonStyle('share')} onClick={handleShare}>
          <IconButton size="large">
            <Share />
          </IconButton>
          <Typography variant="labelSmall" display="block" color="text.secondary" sx={{ fontWeight: 700 }}>
            Share
          </Typography>
        </Box>
      </Box>

      {/* Synopsis with staggered entrance */}
      <Box sx={{ 
        px: 2, mb: 4,
        animation: 'staggerUp 0.4s ease-out both',
        animationDelay: '0.45s',
      }}>
        <Box sx={{ width: '100%', mb: 1.5 }}>
          <Typography 
            variant="titleMedium" 
            fontWeight={800} 
            sx={{ 
              textAlign: 'left',
              width: '100%',
              display: 'block'
            }}
          >
            Synopsis
          </Typography>
        </Box>
        <Typography variant="bodyMedium" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '14px', textAlign: 'left' }}>
          {movie.synopsis}
        </Typography>
      </Box>

      {/* Cast with staggered entrance */}
      <Box sx={{ 
        mt: 3, mb: 0,
        animation: 'staggerUp 0.4s ease-out both',
        animationDelay: '0.5s',
      }}>
        <Typography 
          variant="titleMedium" 
          fontWeight={800} 
          sx={{ 
            px: 2, 
            mb: 3, 
            textAlign: 'left',
            color: 'text.primary',
            width: '100%',
            display: 'block'
          }}
        >
          Cast
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto', 
          px: 2, 
          pb: 1.5,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}>
          {movie.cast.map((actor, i) => (
            <Box 
              key={i} 
              sx={{ 
                width: 90, 
                flexShrink: 0, 
                textAlign: 'center',
                animation: 'staggerUp 0.35s ease-out both',
                animationDelay: `${0.5 + i * 0.06}s`,
              }}
            >
              <Avatar 
                src={actor.photoUrl} 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  mx: 'auto', 
                  mb: 1.2,
                  border: '2px solid',
                  borderColor: 'surface.surfaceContainerHighest',
                  boxShadow: 'none',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }
                }} 
              />
              <Typography 
                variant="labelMedium" 
                sx={{ 
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  px: 0.5,
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                {actor.name}
              </Typography>
              <Typography 
                variant="bodySmall" 
                color="text.secondary" 
                sx={{ 
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  px: 0.5,
                  fontSize: '11px'
                }}
              >
                {actor.character}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* More Like This */}
      {moreLikeThis.length > 0 && (
        <ScrollRail 
          title="More Like This" 
          movies={moreLikeThis} 
          getStatus={getStatus}
        />
      )}

      {/* Snackbar with slide-up animation */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar('')}
        message={snackbar}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '8px',
            bgcolor: 'surface.surfaceContainerHighest',
            color: 'text.primary',
            fontWeight: 600,
            animation: 'snackSlideUp 0.3s ease-out both',
          }
        }}
      />
    </Box>
  );
}
