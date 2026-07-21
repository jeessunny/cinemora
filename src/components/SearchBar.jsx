import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

export default function SearchBar({ value, onChange, onClear, onClick, onSubmit, placeholder = "Search movies, genres...", readOnly = false }) {

  return (
    <Paper
      elevation={2}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: 50,
        bgcolor: 'surface.surfaceContainerHigh',
      }}
      onClick={onClick}
    >
      <IconButton sx={{ p: '10px' }} aria-label="search" onClick={() => onSubmit && onSubmit(value)}>
        <Search />
      </IconButton>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(value); }} sx={{ ml: 1, flex: 1, display: 'flex', alignItems: 'center' }}>
        <InputBase
          sx={{ flex: 1 }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
        />
      </Box>
      {value && (
        <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={onClear}>
          <Clear />
        </IconButton>
      )}
    </Paper>
  );
}
