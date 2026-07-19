import React from 'react';
import { Box, Chip } from '@mui/material';

export default function GenreChips({ genres, selected, onChange, wrap = false }) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 1.2, 
        overflowX: wrap ? 'visible' : 'auto', 
        flexWrap: wrap ? 'wrap' : 'nowrap',
        pb: 1.5,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {genres.map((genre) => {
        const isSelected = selected.includes(genre);
        return (
          <Chip
            key={genre}
            label={genre}
            onClick={() => onChange(genre)}
            sx={{ 
              borderRadius: '6px',
              flexShrink: 0,
              fontWeight: 600,
              fontSize: '13px',
              px: 0.5,
              py: 2,
              transition: 'all 0.2s ease',
              bgcolor: isSelected ? 'primary.main' : 'surface.surfaceContainer',
              color: isSelected ? 'primary.contrastText' : 'text.primary',
              border: '1px solid',
              borderColor: isSelected ? 'primary.main' : 'divider',
              boxShadow: isSelected ? '0 2px 8px rgba(229, 9, 20, 0.3)' : 'none',
              // Override hover state
              '&:hover': {
                transform: 'scale(1.04)',
                bgcolor: isSelected ? 'primary.dark' : 'surface.surfaceContainerHigh',
              },
              // Override focus, active, and selection indicators to prevent color shift on the last clicked tile
              '&:focus, &:active, &.Mui-focusVisible, &.Mui-focused': {
                bgcolor: isSelected ? 'primary.main' : 'surface.surfaceContainer',
                color: isSelected ? 'primary.contrastText' : 'text.primary',
                borderColor: isSelected ? 'primary.main' : 'divider',
                boxShadow: isSelected ? '0 2px 8px rgba(229, 9, 20, 0.3)' : 'none',
              },
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        );
      })}
    </Box>
  );
}
