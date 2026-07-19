import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';

export default function SegmentedButton({ value, onChange, options, fullWidth = false }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: fullWidth ? 'center' : 'flex-start', width: '100%' }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(e, val) => val !== null && onChange(val)}
        aria-label="segmented button"
        fullWidth={fullWidth}
        sx={{
          bgcolor: 'surface.surfaceContainerLow',
          borderRadius: 8,
          p: 0.5,
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: '24px !important',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-selected': {
              bgcolor: 'primary.primaryContainer',
              color: 'primary.onPrimaryContainer',
              '&:hover': {
                bgcolor: 'primary.primaryContainer',
              }
            }
          }
        }}
      >
        {options.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
