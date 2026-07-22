import React from 'react';
import { Card, Box, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function HeroCard({ movie }) {
  const navigate = useNavigate();

  if (!movie) return null;

  return (
    <Card 
      elevation={0}
      sx={{ 
        position: 'relative',
        height: 400,
        borderRadius: '28px',
        overflow: 'hidden',
        cursor: 'pointer',
        animation: 'heroShimmer 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        animationDelay: '0.1s',
        transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.35s ease',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        }
      }}
      onClick={() => {
        const mediaType = movie.type || 'movie';
        navigate(mediaType === 'tv' ? `/series/${movie.id}` : `/movie/${movie.id}?type=movie`);
      }}
    >
      <Box
        component="img"
        src={movie.backdropUrl}
        alt={movie.title}
        loading="lazy"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.6s ease',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(15, 13, 13, 0.9) 0%, rgba(15, 13, 13, 0) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          {movie.genres.slice(0, 2).map((g, i) => (
            <Chip 
              key={g} 
              label={g} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(4px)',
                animation: 'chipCascade 0.35s ease-out both',
                animationDelay: `${0.25 + i * 0.08}s`,
              }} 
            />
          ))}
          {movie.matchPercentage && (
            <Chip 
              label={`${movie.matchPercentage}% Match`} 
              size="small"
              color="primary"
              sx={{
                animation: 'chipCascade 0.35s ease-out both',
                animationDelay: '0.4s',
              }}
            />
          )}
        </Box>
        <Typography 
          variant="headlineMedium" 
          color="white" 
          fontWeight={700} 
          gutterBottom
          sx={{
            animation: 'staggerUp 0.4s ease-out both',
            animationDelay: '0.3s',
          }}
        >
          {movie.title}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{ 
            mt: 1,
            animation: 'staggerUp 0.4s ease-out both',
            animationDelay: '0.4s',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:active': {
              transform: 'scale(0.97)',
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movie/${movie.id}`);
          }}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
}
