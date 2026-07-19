import React from 'react';
import { Card, CardActionArea, CardMedia, Typography, Box } from '@mui/material';
import { Favorite, Bookmark, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function PosterCard({ movie, status, animDelay = 0 }) {
  const navigate = useNavigate();

  const getStatusIcon = () => {
    switch (status) {
      case 'favorite': return <Favorite color="error" fontSize="small" sx={{ fontSize: 16 }} />;
      case 'watchlist': return <Bookmark color="primary" fontSize="small" sx={{ fontSize: 16 }} />;
      case 'history': return <CheckCircle color="success" fontSize="small" sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        width: 150, 
        height: 225,
        flexShrink: 0,
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'transparent',
        backgroundImage: 'none !important',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
        animation: 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        animationDelay: `${animDelay}s`,
        '&:hover': {
          transform: 'scale(1.04)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
        },
        '&:active': {
          transform: 'scale(0.97)',
        }
      }}
    >
      <CardActionArea 
        onClick={() => navigate(`/movie/${movie.id}`)}
        sx={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px', overflow: 'hidden' }}
      >
        {/* Full Card Background Image */}
        <CardMedia
          component="img"
          image={movie.posterUrl}
          alt={movie.title}
          sx={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: '12px'
          }}
        />

        {/* Gradient Scrim Overlay at the bottom */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            height: '65%', 
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 45%, rgba(0, 0, 0, 0) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 1.5,
            zIndex: 1,
            boxSizing: 'border-box'
          }}
        >
          {/* Movie Title */}
          <Typography 
            variant="body2" 
            fontWeight={700} 
            color="#FFFFFF"
            sx={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              lineHeight: 1.15,
              mb: 0.2,
              fontSize: '13px',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            {movie.title}
          </Typography>
          {/* Movie Year */}
          <Typography 
            variant="bodySmall" 
            color="rgba(255, 255, 255, 0.75)"
            sx={{ 
              fontWeight: 600,
              fontSize: '11px',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)'
            }}
          >
            {movie.year}
          </Typography>
        </Box>

        {/* Status Badge */}
        {status && (
          <Box sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            bgcolor: 'rgba(0, 0, 0, 0.75)', 
            borderRadius: '50%',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 2,
            animation: 'scaleIn 0.3s ease-out both',
            animationDelay: `${animDelay + 0.15}s`,
          }}>
            {getStatusIcon()}
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
}
