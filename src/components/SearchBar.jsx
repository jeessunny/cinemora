import React from 'react';
import { Paper, InputBase, IconButton, Box } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

export default function SearchBar({ value, onChange, onClear, onClick, onSubmit, placeholder = "Search movies, genres...", readOnly = false }) {

  return (
    <Paper
      elevation={0}
      sx={{
        p: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: 50,
        bgcolor: 'surface.surfaceContainerHigh',
        border: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
    >
      <IconButton sx={{ p: '8px', color: 'text.secondary' }} aria-label="search" onClick={() => onSubmit && onSubmit(value)}>
        <Search />
      </IconButton>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(value); }} sx={{ ml: 1, flex: 1, display: 'flex', alignItems: 'center' }}>
        <InputBase
          sx={{ 
            flex: 1, 
            color: 'text.primary',
            '& .MuiInputBase-input': {
              color: 'text.primary',
              '&::placeholder': {
                color: 'text.secondary',
                opacity: 0.8
              }
            }
          }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
        />
      </Box>
      {value && (
        <IconButton sx={{ p: '8px', color: 'text.secondary' }} aria-label="clear" onClick={onClear}>
          <Clear />
        </IconButton>
      )}
    </Paper>
  );
}
