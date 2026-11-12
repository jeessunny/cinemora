import { createTheme } from '@mui/material/styles';

// Helper to darken a hex color by a percentage
const darkenHex = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

// Helper to lighten a hex color
const lightenHex = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * percent));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

const getDarkPalette = (accent, isPitchBlack = false) => ({
  mode: 'dark',
  primary: {
    main: accent,
    light: lightenHex(accent, 0.3),
    dark: darkenHex(accent, 0.3),
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: isPitchBlack ? '#121212' : '#2F2F2F',
    light: '#4F4F4F',
    dark: '#1A1A1A',
    contrastText: '#FFFFFF',
  },
  tertiary: {
    main: '#E7C08D',
  },
  error: {
    main: '#E50914',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#46D369',
    contrastText: '#FFFFFF',
  },
  background: {
    default: isPitchBlack ? '#000000' : '#0F0D0D',
    paper: isPitchBlack ? '#000000' : '#181818',
  },
  surface: {
    main: isPitchBlack ? '#000000' : '#0F0D0D',
    surfaceContainerLow: isPitchBlack ? '#050505' : '#141414',
    surfaceContainer: isPitchBlack ? '#0A0A0A' : '#181818',
    surfaceContainerHigh: isPitchBlack ? '#121212' : '#202020',
    surfaceContainerHighest: isPitchBlack ? '#1A1A1A' : '#282828',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    disabled: '#7F7F7F',
  },
  divider: isPitchBlack ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.1)',
});

const getLightPalette = (accent) => ({
  mode: 'light',
  primary: {
    main: accent,
    light: lightenHex(accent, 0.3),
    dark: darkenHex(accent, 0.3),
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#E0E0E0',
    light: '#F5F5F5',
    dark: '#AEAEAE',
    contrastText: '#0F0D0D',
  },
  tertiary: {
    main: '#765930',
  },
  error: {
    main: '#BA1A1A',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#006D1C',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F8F9FA',
  },
  surface: {
    main: '#FFFFFF',
    surfaceContainerLow: '#F8F9FA',
    surfaceContainer: '#F1F3F5',
    surfaceContainerHigh: '#E9ECEF',
    surfaceContainerHighest: '#DEE2E6',
  },
  text: {
    primary: '#121212',
    secondary: '#495057',
    disabled: '#868E96',
  },
  divider: 'rgba(0, 0, 0, 0.1)',
});

const typography = {
  fontFamily: '"Roboto Flex", "Helvetica", "Arial", sans-serif',
  displayLarge: { fontSize: '57px', fontWeight: 700, lineHeight: 1.12 },
  displayMedium: { fontSize: '45px', fontWeight: 700, lineHeight: 1.15 },
  displaySmall: { fontSize: '36px', fontWeight: 700, lineHeight: 1.22 },
  headlineLarge: { fontSize: '32px', fontWeight: 600, lineHeight: 1.25 },
  headlineMedium: { fontSize: '28px', fontWeight: 600, lineHeight: 1.28 },
  headlineSmall: { fontSize: '24px', fontWeight: 600, lineHeight: 1.33 },
  titleLarge: { fontSize: '22px', fontWeight: 600, lineHeight: 1.27 },
  titleMedium: { fontSize: '16px', fontWeight: 600, lineHeight: 1.5 },
  titleSmall: { fontSize: '14px', fontWeight: 500, lineHeight: 1.43 },
  bodyLarge: { fontSize: '16px', fontWeight: 400, lineHeight: 1.5 },
  bodyMedium: { fontSize: '14px', fontWeight: 400, lineHeight: 1.43 },
  bodySmall: { fontSize: '12px', fontWeight: 400, lineHeight: 1.33 },
  labelLarge: { fontSize: '14px', fontWeight: 500, lineHeight: 1.43 },
  labelMedium: { fontSize: '12px', fontWeight: 500, lineHeight: 1.33 },
  labelSmall: { fontSize: '11px', fontWeight: 500, lineHeight: 1.45 },
};

const shape = {
  borderRadius: 12,
  extraLarge: 24,
  large: 16,
  medium: 12,
  small: 8,
};

export const getTheme = (mode, accentColor = '#E50914', isPitchBlack = false) => {
  const isDark = mode === 'dark' || mode === 'black';
  const effectivePitchBlack = isPitchBlack || mode === 'black';

  return createTheme({
    palette: isDark ? getDarkPalette(accentColor, effectivePitchBlack) : getLightPalette(accentColor),
    typography,
    shape,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: effectivePitchBlack ? '#000000' : (isDark ? '#0F0D0D' : '#FFFFFF'),
            color: isDark ? '#FFFFFF' : '#121212',
            transition: 'background-color 0.2s ease, color 0.2s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            padding: '10px 24px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            boxShadow: 'none !important',
          },
          contained: {
            boxShadow: 'none !important',
            '&:hover': {
              boxShadow: 'none !important',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none !important',
            boxShadow: 'none !important',
            border: 'none !important',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none !important',
            boxShadow: 'none !important',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5) !important',
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: effectivePitchBlack ? '#000000' : (isDark ? '#141414' : '#F1F3F5'),
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });
};
