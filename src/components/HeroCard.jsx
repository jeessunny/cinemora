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
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${movie.backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
          {movie.genres.slice(0, 2).map((g) => (
            <Chip 
              key={g} 
              label={g} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(4px)'
              }} 
            />
          ))}
          {movie.matchPercentage && (
            <Chip 
              label={`${movie.matchPercentage}% Match`} 
              size="small"
              color="primary"
            />
          )}
        </Box>
        <Typography variant="headlineMedium" color="white" fontWeight={700} gutterBottom>
          {movie.title}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{ mt: 1 }}
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
