import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Avatar, Chip, Snackbar, CircularProgress, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ChevronLeft, Favorite, FavoriteBorder,
  Bookmark, BookmarkBorder, Share, CheckCircle, CheckCircleOutline,
  ExpandMore, Star, PlayArrow
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { getSeriesDetails, getSeasonDetails } from '../services/tmdb';
import ScrollRail from '../components/ScrollRail';

export default function SeriesDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState('');
  const [bounceId, setBounceId] = useState(null);

  // Season / episode state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [expandedEpisode, setExpandedEpisode] = useState(null);

  const watchlist = useStore(state => state.watchlist);
  const addToWatchlist = useStore(state => state.addToWatchlist);
  const removeFromWatchlist = useStore(state => state.removeFromWatchlist);
  const favorites = useStore(state => state.favorites);
  const addToFavorites = useStore(state => state.addToFavorites);
  const removeFromFavorites = useStore(state => state.removeFromFavorites);
  const history = useStore(state => state.history);
  const addToHistory = useStore(state => state.addToHistory);
  const removeFromHistory = useStore(state => state.removeFromHistory);

  // Fetch series details
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getSeriesDetails(id);
        setSeries(data);
        // Auto-select last season
        if (data.seasons && data.seasons.length > 0) {
          setSelectedSeason(data.seasons[0].seasonNumber);
        }
      } catch (err) {
        console.error('Error fetching series details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  // Fetch episodes when season changes
  useEffect(() => {
    if (!id || !selectedSeason) return;
    const fetchEpisodes = async () => {
      setEpisodesLoading(true);
      setExpandedEpisode(null);
      try {
        const data = await getSeasonDetails(id, selectedSeason);
        setEpisodes(data.episodes || []);
      } catch (err) {
        console.error('Error fetching season details:', err);
        setEpisodes([]);
      } finally {
        setEpisodesLoading(false);
      }
    };
    fetchEpisodes();
  }, [id, selectedSeason]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!series) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Typography color="text.secondary">Series not found</Typography>
      </Box>
    );
  }

  const moreLikeThis = series.similar || [];
  const isWatchlist = watchlist.some(m => m.id === series.id);
  const isFavorite = favorites.some(m => m.id === series.id);
  const isHistory = history.some(m => m.id === series.id);

  const triggerBounce = (name) => {
    setBounceId(name);
    setTimeout(() => setBounceId(null), 350);
  };

  const toggleWatchlist = () => {
    triggerBounce('watchlist');
    if (isWatchlist) {
      removeFromWatchlist(series.id);
      setSnackbar('Removed from watchlist');
    } else {
      addToWatchlist(series);
      setSnackbar('Added to watchlist');
    }
  };

  const toggleFavorite = () => {
    triggerBounce('favorite');
    if (isFavorite) {
      removeFromFavorites(series.id);
      setSnackbar('Removed from favorites');
    } else {
      addToFavorites(series);
      setSnackbar('Added to favorites');
    }
  };

  const toggleHistory = () => {
    triggerBounce('history');
    if (isHistory) {
      removeFromHistory(series.id);
      setSnackbar('Unmarked as watched');
    } else {
      addToHistory(series);
      setSnackbar('Marked as watched');
    }
  };

  const handleShare = async () => {
    triggerBounce('share');
    if (navigator.share) {
      try {
        await navigator.share({
          title: series.title,
          text: `Check out ${series.title} on Cinemora!`,
          url: window.location.href,
        });
      } catch (e) { /* cancelled */ }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setSnackbar('Link copied!');
    }
  };

  const getStatus = (mId) => {
    const statuses = [];
    if (history.some(m => m.id === mId)) statuses.push('history');
    if (favorites.some(m => m.id === mId)) statuses.push('favorite');
    if (watchlist.some(m => m.id === mId)) statuses.push('watchlist');
    return statuses.length > 0 ? statuses : null;
  };

  const scrimColor = theme.palette.background.default === '#000000'
    ? '0, 0, 0'
    : (theme.palette.mode === 'dark' ? '15, 13, 13' : '255, 255, 255');

  const actionButtonStyle = (name) => ({
    textAlign: 'center',
    cursor: 'pointer',
    animation: bounceId === name ? 'iconBounce 0.35s ease' : 'none',
  });

  const formatEpRuntime = (mins) => {
    if (!mins) return '';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <Box sx={{ pb: 6, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Backdrop */}
      <Box
        sx={{
          position: 'relative',
          height: 360,
          backgroundImage: `url(${series.backdropUrl})`,
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

        {/* Status badge */}
        {series.status && (
          <Box sx={{
            position: 'absolute', top: 0, right: 0,
            p: 2, pt: 'max(env(safe-area-inset-top), 16px)',
            zIndex: 2,
            animation: 'fadeIn 0.4s ease both',
            animationDelay: '0.4s',
          }}>
            <Chip
              label={series.status}
              size="small"
              sx={{
                bgcolor: series.status === 'Returning Series' ? 'success.main' : 'surface.surfaceContainerHigh',
                color: series.status === 'Returning Series' ? 'success.contrastText' : 'text.primary',
                fontWeight: 700,
                fontSize: '11px',
                backdropFilter: 'blur(8px)',
              }}
            />
          </Box>
        )}

        {/* Gradient Scrim */}
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: `linear-gradient(to top, rgba(${scrimColor}, 1) 0%, rgba(${scrimColor}, 0.65) 50%, rgba(${scrimColor}, 0) 100%)`
        }} />
      </Box>

      {/* Poster + Info */}
      <Box sx={{
        px: 2, mt: -10, position: 'relative', display: 'flex', gap: 2.5, zIndex: 1,
        animation: 'fadeSlideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        animationDelay: '0.2s',
      }}>
        <Box
          component="img"
          src={series.posterUrl}
          alt={series.title}
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
              {series.title}
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
            {series.year}   •   {series.numberOfSeasons} Season{series.numberOfSeasons !== 1 ? 's' : ''}   •   {series.numberOfEpisodes} Episodes   •   ★ {series.rating}
          </Typography>

          {/* Networks */}
          {series.networks && series.networks.length > 0 && (
            <Typography
              variant="labelSmall"
              color="primary.main"
              fontWeight={700}
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 0.8,
                animation: 'staggerUp 0.4s ease-out both',
                animationDelay: '0.42s',
              }}
            >
              {series.networks.join(' • ')}
            </Typography>
          )}

          <Box sx={{
            display: 'flex', gap: 0.8, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {series.genres.map((g, i) => (
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

      {/* Action Buttons */}
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

      {/* Synopsis */}
      <Box sx={{
        px: 2, mb: 4,
        animation: 'staggerUp 0.4s ease-out both',
        animationDelay: '0.45s',
      }}>
        <Typography
          variant="titleMedium"
          fontWeight={800}
          sx={{ textAlign: 'left', width: '100%', display: 'block', mb: 1.5 }}
        >
          Synopsis
        </Typography>
        <Typography variant="bodyMedium" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '14px', textAlign: 'left' }}>
          {series.synopsis}
        </Typography>
      </Box>

      {/* ═══════════════════════════════════════════
         SEASONS & EPISODES SECTION
         ═══════════════════════════════════════════ */}
      <Box sx={{
        px: 2, mb: 4,
        animation: 'staggerUp 0.4s ease-out both',
        animationDelay: '0.5s',
      }}>
        <Typography
          variant="titleMedium"
          fontWeight={800}
          sx={{ textAlign: 'left', width: '100%', display: 'block', mb: 2 }}
        >
          Seasons & Episodes
        </Typography>

        {/* Season Selector — horizontal scrollable chips */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}>
          {series.seasons.map((season, i) => (
            <Chip
              key={season.seasonNumber}
              label={`Season ${season.seasonNumber}`}
              onClick={() => setSelectedSeason(season.seasonNumber)}
              variant={selectedSeason === season.seasonNumber ? 'filled' : 'outlined'}
              color={selectedSeason === season.seasonNumber ? 'primary' : 'default'}
              sx={{
                fontWeight: 700,
                fontSize: '13px',
                height: 36,
                borderRadius: '18px',
                flexShrink: 0,
                transition: 'all 0.25s ease',
                animation: 'chipCascade 0.3s ease-out both',
                animationDelay: `${0.5 + i * 0.04}s`,
              }}
            />
          ))}
        </Box>

        {/* Episodes List */}
        {episodesLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rounded" width={140} height={80} sx={{ borderRadius: '8px', flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
                  <Skeleton width="100%" height={14} sx={{ mt: 1 }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : episodes.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {episodes.map((ep, i) => {
              const isExpanded = expandedEpisode === ep.id;
              return (
                <Box
                  key={ep.id}
                  onClick={() => setExpandedEpisode(isExpanded ? null : ep.id)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'surface.surfaceContainerLow',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    animation: 'staggerUp 0.35s ease-out both',
                    animationDelay: `${0.55 + i * 0.04}s`,
                    '&:hover': {
                      bgcolor: 'surface.surfaceContainer',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, p: 1.5 }}>
                    {/* Episode Still / Thumbnail */}
                    <Box sx={{
                      width: 140,
                      height: 80,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                      bgcolor: 'surface.surfaceContainerHigh',
                    }}>
                      {ep.stillUrl ? (
                        <Box
                          component="img"
                          src={ep.stillUrl}
                          alt={ep.name}
                          loading="lazy"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <PlayArrow sx={{ fontSize: 32, color: 'text.secondary', opacity: 0.5 }} />
                        </Box>
                      )}
                      {/* Episode number overlay */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        borderRadius: '4px',
                        px: 0.8,
                        py: 0.2,
                        backdropFilter: 'blur(4px)',
                      }}>
                        <Typography variant="labelSmall" sx={{ fontSize: '10px', fontWeight: 700, color: 'white' }}>
                          E{ep.episodeNumber}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Episode info */}
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography
                        variant="bodyMedium"
                        fontWeight={700}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                        }}
                      >
                        {ep.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        {ep.runtime && (
                          <Typography variant="labelSmall" color="text.secondary" sx={{ fontWeight: 600, fontSize: '11px' }}>
                            {formatEpRuntime(ep.runtime)}
                          </Typography>
                        )}
                        {ep.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <Star sx={{ fontSize: 12, color: 'warning.main' }} />
                            <Typography variant="labelSmall" color="text.secondary" sx={{ fontWeight: 600, fontSize: '11px' }}>
                              {ep.rating}
                            </Typography>
                          </Box>
                        )}
                        {ep.airDate && (
                          <Typography variant="labelSmall" color="text.secondary" sx={{ fontWeight: 500, fontSize: '11px' }}>
                            {new Date(ep.airDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                        )}
                      </Box>
                      <ExpandMore sx={{
                        fontSize: 18,
                        color: 'text.secondary',
                        mt: 0.5,
                        transition: 'transform 0.3s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }} />
                    </Box>
                  </Box>

                  {/* Expanded overview */}
                  <Box sx={{
                    maxHeight: isExpanded ? 200 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), padding 0.35s ease',
                    px: 1.5,
                    pb: isExpanded ? 1.5 : 0,
                  }}>
                    {ep.overview ? (
                      <Typography variant="bodySmall" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '13px' }}>
                        {ep.overview}
                      </Typography>
                    ) : (
                      <Typography variant="bodySmall" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '13px' }}>
                        No description available.
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="bodyMedium" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No episodes available for this season.
          </Typography>
        )}
      </Box>

      {/* Cast */}
      <Box sx={{
        mt: 3, mb: 0,
        animation: 'staggerUp 0.4s ease-out both',
        animationDelay: '0.55s',
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
          pt: 1.5,
          pb: 1.5,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}>
          {series.cast.map((actor, i) => (
            <Box
              key={i}
              sx={{
                width: 90,
                flexShrink: 0,
                textAlign: 'center',
                animation: 'staggerUp 0.35s ease-out both',
                animationDelay: `${0.55 + i * 0.06}s`,
              }}
            >
              <Avatar
                src={actor.photoUrl}
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 1.2,
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

      {/* Snackbar */}
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
