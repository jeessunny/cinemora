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
          border: '1px solid',
          borderColor: 'divider',
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
            transition: 'background-color 0.3s ease, color 0.3s ease',
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 700,
              '&:hover, &:focus, &:active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }
            }
          }
        }}
      >
        {options.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value} disableRipple>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
