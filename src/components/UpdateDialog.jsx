import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  SystemUpdate,
  CloudDownload,
  InstallMobile,
  CheckCircle,
  ErrorOutline,
  Close,
  Download
} from '@mui/icons-material';
import updateManager, { CURRENT_VERSION } from '../services/updater';

/**
 * Clean renderer for GitHub release notes.
 * Automatically strips markdown symbols (###, **, *, etc.) and structures
 * lines cleanly with native typography and bullet dots.
 */
function CleanReleaseNotesView({ rawNotes }) {
  if (!rawNotes) return null;

  const lines = rawNotes.split('\n');

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        p: 2,
        maxHeight: 220,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
        }
      }}
    >
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return null;

        const isHeading = line.startsWith('#');
        const isBullet = line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ');

        const cleanText = line
          .replace(/^#+\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/__/g, '')
          .replace(/`/g, '')
          .trim();

        if (isHeading) {
          return (
            <Typography
              key={idx}
              variant="titleSmall"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mt: idx > 0 ? 1 : 0
              }}
            >
              {cleanText}
            </Typography>
          );
        } else if (isBullet) {
          const bulletText = cleanText.replace(/^[-*•]\s*/, '').trim();
          return (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography
                component="span"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                •
              </Typography>
              <Typography
                variant="bodySmall"
                sx={{
                  color: 'text.secondary',
                  fontSize: '13px',
                  lineHeight: '20px'
                }}
              >
                {bulletText}
              </Typography>
            </Box>
          );
        } else {
          return (
            <Typography
              key={idx}
              variant="bodySmall"
              sx={{
                color: 'text.secondary',
                fontSize: '13px',
                lineHeight: '20px'
              }}
            >
              {cleanText}
            </Typography>
          );
        }
      })}
    </Box>
  );
}

export default function UpdateDialog() {
  const [updaterState, setUpdaterState] = useState(updateManager.state);

  useEffect(() => {
    const unsubscribe = updateManager.subscribe(setUpdaterState);
    return unsubscribe;
  }, []);

  const { status, updateInfo, progress, errorMessage, showDialog } = updaterState;

  if (!showDialog && status !== 'downloading' && status !== 'ready') {
    return null;
  }

  const isDownloading = status === 'downloading';
  const isAvailable = status === 'available';
  const isReady = status === 'ready';
  const isChecking = status === 'checking';
  const isUpToDate = status === 'uptodate';
  const isError = status === 'error';

  const formatMb = (bytes) => {
    if (!bytes || bytes <= 0) return '0.00 MB';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog
      open={showDialog || isDownloading || isReady}
      onClose={() => {
        if (!isDownloading) updateManager.dismissDialog();
      }}
      PaperProps={{
        sx: {
          bgcolor: 'surface.surfaceContainer',
          borderRadius: '20px',
          p: 1,
          maxWidth: 420,
          width: '90%',
          backgroundImage: 'none',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isDownloading && (
            <CloudDownload sx={{ color: 'primary.main', fontSize: 28 }} />
          )}
          {isReady && (
            <InstallMobile sx={{ color: 'success.main', fontSize: 28 }} />
          )}
          {isAvailable && (
            <SystemUpdate sx={{ color: 'primary.main', fontSize: 28 }} />
          )}
          {isChecking && (
            <CircularProgress size={24} sx={{ color: 'primary.main' }} />
          )}
          {isUpToDate && (
            <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
          )}
          {isError && (
            <ErrorOutline sx={{ color: 'error.main', fontSize: 28 }} />
          )}

          <Typography variant="titleMedium" sx={{ fontWeight: 700, fontSize: '18px' }}>
            {isChecking && 'Checking for Updates'}
            {isAvailable && `Update Available (${updateInfo?.versionName})`}
            {isDownloading && 'Downloading Update'}
            {isReady && 'Download Complete'}
            {isUpToDate && "You're Up to Date"}
            {isError && 'Update Check Failed'}
          </Typography>
        </Box>

        {!isDownloading && (
          <IconButton
            size="small"
            onClick={() => updateManager.dismissDialog()}
            sx={{ color: 'text.secondary' }}
          >
            <Close fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2 }}>
        {isChecking && (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="bodyMedium" color="text.secondary">
              Connecting to GitHub release servers...
            </Typography>
          </Box>
        )}

        {isAvailable && updateInfo && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="bodySmall" color="text.secondary">
                Current: v{CURRENT_VERSION}
              </Typography>
              {updateInfo.fileSize > 0 && (
                <Chip
                  size="small"
                  label={formatMb(updateInfo.fileSize)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '11px'
                  }}
                />
              )}
            </Box>

            <Typography variant="bodyMedium" sx={{ color: 'text.primary', fontSize: '14px', lineHeight: 1.4 }}>
              A new version of Cinemora is ready to install with latest improvements and bug fixes.
            </Typography>

            <Typography variant="labelMedium" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.5 }}>
              What's New:
            </Typography>

            <CleanReleaseNotesView rawNotes={updateInfo.releaseNotes} />
          </Box>
        )}

        {isDownloading && (
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="bodySmall" color="text.secondary">
                {progress.percent >= 0 ? `${progress.percent}%` : 'Connecting...'}
              </Typography>
              <Typography variant="bodySmall" color="text.secondary">
                {progress.totalBytes > 0
                  ? `${formatMb(progress.bytesDownloaded)} / ${formatMb(progress.totalBytes)}`
                  : formatMb(progress.bytesDownloaded)}
              </Typography>
            </Box>

            <LinearProgress
              variant={progress.percent >= 0 ? 'determinate' : 'indeterminate'}
              value={progress.percent >= 0 ? progress.percent : undefined}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'primary.main',
                  borderRadius: 4
                }
              }}
            />

            <Typography variant="bodySmall" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '12px', mt: 0.5 }}>
              Please keep Cinemora open while the APK is downloading.
            </Typography>
          </Box>
        )}

        {isReady && (
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'center' }}>
            <Typography variant="bodyMedium" sx={{ color: 'text.primary', fontSize: '14px' }}>
              Cinemora update is downloaded and ready to install. Tap below to launch the Android package installer.
            </Typography>
          </Box>
        )}

        {isUpToDate && (
          <Box sx={{ py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="bodyMedium" sx={{ color: 'text.primary', fontSize: '14px', textAlign: 'center' }}>
              Cinemora <strong>v{CURRENT_VERSION}</strong> is the latest version available. No updates needed!
            </Typography>

            {updateInfo?.releaseNotes && (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="labelMedium" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  What's New:
                </Typography>
                <CleanReleaseNotesView rawNotes={updateInfo.releaseNotes} />
              </Box>
            )}
          </Box>
        )}

        {isError && (
          <Box sx={{ py: 2 }}>
            <Typography variant="bodyMedium" sx={{ color: 'error.main', fontSize: '14px' }}>
              {errorMessage || 'Failed to check for updates. Please verify your internet connection.'}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1.5, pt: 0, gap: 1 }}>
        {isAvailable && (
          <>
            <Button
              variant="text"
              onClick={() => updateManager.dismissDialog()}
              sx={{ color: 'text.secondary' }}
            >
              Later
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => updateManager.startDownload()}
              sx={{
                bgcolor: 'primary.main',
                color: '#fff',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Update Now
            </Button>
          </>
        )}

        {isReady && (
          <Button
            fullWidth
            variant="contained"
            startIcon={<InstallMobile />}
            onClick={() => updateManager.installApk()}
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Install Now
          </Button>
        )}

        {isUpToDate && (
          <Button
            fullWidth
            variant="contained"
            onClick={() => updateManager.dismissDialog()}
            sx={{
              bgcolor: 'primary.main',
              color: '#fff'
            }}
          >
            Got It
          </Button>
        )}

        {isError && (
          <>
            <Button
              variant="text"
              onClick={() => updateManager.dismissDialog()}
              sx={{ color: 'text.secondary' }}
            >
              Dismiss
            </Button>
            <Button
              variant="contained"
              onClick={() => updateManager.checkForUpdates(true)}
              sx={{
                bgcolor: 'primary.main',
                color: '#fff'
              }}
            >
              Retry
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
