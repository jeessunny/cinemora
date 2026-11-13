import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      PaperProps={{
        sx: { borderRadius: '28px', bgcolor: 'surface.surfaceContainerHigh', border: '1px solid', borderColor: 'divider' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText color="text.secondary">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ borderRadius: 50 }}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary" sx={{ borderRadius: 50 }} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
