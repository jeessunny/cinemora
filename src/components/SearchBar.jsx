import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import useStore from '../store';

export default function SearchBar({ value, onChange, onClear, onClick, placeholder = "Search movies, genres...", readOnly = false }) {
  const glassmorphismEnabled = useStore(state => state.glassmorphismEnabled);
  const themeMode = useStore(state => state.themeMode);

  const glassStyle = glassmorphismEnabled ? {
    bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.55)' : 'rgba(30,30,30,0.40)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
  } : {
    bgcolor: 'surface.surfaceContainerHigh',
  };

  return (
    <Paper
      elevation={glassmorphismEnabled ? 0 : 2}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: 50,
        transition: 'all 250ms ease',
        ...glassStyle,
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
