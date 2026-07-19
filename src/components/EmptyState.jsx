import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        p: 2,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Box 
        sx={{ 
          bgcolor: 'surface.surfaceContainerHighest', 
          p: 2.5, 
          borderRadius: '50%',
          mb: 2.5,
          display: 'flex',
          color: 'primary.main',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Icon sx={{ fontSize: 40 }} />
      </Box>
      <Typography variant="titleLarge" gutterBottom fontWeight={700} color="text.primary">
        {title}
      </Typography>
      <Typography variant="bodyMedium" color="text.secondary" sx={{ mb: 3.5, maxWidth: 280, lineHeight: 1.4 }}>
        {subtitle}
      </Typography>
      {actionLabel && onAction && (
        <Button 
          variant="contained" 
          color="primary"
          onClick={onAction} 
          sx={{ 
            borderRadius: '50px',
            px: 4,
            py: 1.2,
            fontSize: '14px',
            textTransform: 'none'
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
