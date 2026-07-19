import { createTheme } from '@mui/material/styles';

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#E50914', // Netflix Red
    light: '#FF3333',
    dark: '#B20710',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#2F2F2F',
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
    default: '#0F0D0D', // Netflix style black
    paper: '#181818',
  },
  surface: {
    main: '#0F0D0D',
    surfaceContainerLow: '#141414',
    surfaceContainer: '#181818',
    surfaceContainerHigh: '#202020',
    surfaceContainerHighest: '#282828',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    disabled: '#7F7F7F',
  },
  divider: 'rgba(255, 255, 255, 0.1)',
};

const lightPalette = {
  mode: 'light',
  primary: {
    main: '#E50914', // Netflix Red
    light: '#FF3333',
    dark: '#B20710',
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
    default: '#FFFFFF', // Pure clean white
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
    primary: '#121212', // Sharp dark text
    secondary: '#495057',
    disabled: '#868E96',
  },
  divider: 'rgba(0, 0, 0, 0.1)',
};

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

export const getTheme = (mode) => createTheme({
  palette: mode === 'dark' ? darkPalette : lightPalette,
  typography,
  shape,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'dark' ? '#0F0D0D' : '#FFFFFF',
          color: mode === 'dark' ? '#FFFFFF' : '#121212',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Netflix style slightly rounded but clean corners
          textTransform: 'none',
          padding: '10px 24px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          boxShadow: 'none !important', // Force flat buttons in both modes
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
          boxShadow: 'none !important', // Force flat cards in all themes (light & dark)
          border: 'none !important',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none !important',
          boxShadow: 'none !important', // Force flat paper elements (cards, rails) to match flat look
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.5) !important', // keep shadows on modal dialogs for separation
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#141414' : '#F1F3F5',
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
