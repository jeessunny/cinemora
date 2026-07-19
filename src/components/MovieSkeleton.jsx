import React from 'react';
import { Skeleton, Box } from '@mui/material';

export default function MovieSkeleton({ type = 'poster' }) {
  if (type === 'hero') {
    return (
      <Skeleton 
        variant="rectangular" 
        height={400} 
        sx={{ borderRadius: '24px', mb: 2 }} // matched extraLarge shape border radius
      />
    );
  }

  return (
    <Box sx={{ width: 150, flexShrink: 0 }}> {/* matched PosterCard width */}
      <Skeleton 
        variant="rectangular" 
        height={225} // matched PosterCard height
        sx={{ borderRadius: '12px', mb: 1.2 }} // matched PosterCard border radius
      />
    </Box>
  );
}
