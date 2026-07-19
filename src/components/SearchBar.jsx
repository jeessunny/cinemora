import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

export default function SearchBar({ value, onChange, onClear, onClick, placeholder = "Search movies, genres...", readOnly = false }) {
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
      <IconButton sx={{ p: '10px' }} aria-label="search">
        <Search />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        readOnly={readOnly}
      />
      {value && (
        <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={onClear}>
          <Clear />
        </IconButton>
      )}
    </Paper>
  );
}
