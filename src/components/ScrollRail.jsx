import React from 'react';
import { Box, Typography } from '@mui/material';
import PosterCard from './PosterCard';
import MovieSkeleton from './MovieSkeleton';

export default function ScrollRail({ title, movies, isLoading, getStatus }) {
  return (
    <Box sx={{ mt: 2.2, mb: 0, width: '100%' }}>
      <Typography 
        variant="titleLarge" 
        sx={{ 
          mb: 1.5, // 12px space to the cards below
          px: 2, 
          fontWeight: 800,
          color: 'text.primary',
          textAlign: 'left',
          letterSpacing: '-0.3px',
          textTransform: 'none',
          display: 'block',
          width: '100%'
        }}
      >
        {title}
      </Typography>
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto', 
          px: 2,
          pt: 1.2, // pt: 1.2 (approx 10px) top padding to prevent card top scaling hover clipping
          pb: 2, 
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <MovieSkeleton key={i} type="poster" />
          ))
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <PosterCard 
              key={movie.id} 
              movie={movie} 
              status={getStatus ? getStatus(movie.id) : null} 
            />
          ))
        ) : (
          <Typography variant="bodyMedium" color="text.secondary" sx={{ px: 2, py: 1, width: '100%', textAlign: 'left' }}>
            No movies found.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
