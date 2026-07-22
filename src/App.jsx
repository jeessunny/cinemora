import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { getTheme } from './theme';
import useStore from './store';
import NavBar from './components/NavBar';
import { Analytics } from '@vercel/analytics/react';

// Lazy-loaded screens — each is a separate JS chunk loaded on demand
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const SearchScreen = lazy(() => import('./screens/SearchScreen'));
const SavedScreen = lazy(() => import('./screens/SavedScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const MovieDetailsScreen = lazy(() => import('./screens/MovieDetailsScreen'));
const SeriesDetailsScreen = lazy(() => import('./screens/SeriesDetailsScreen'));

// Fallback spinner while a lazy chunk loads
const LazyFallback = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <CircularProgress size={32} />
  </Box>
);

const ProtectedRoute = ({ children }) => {
  const isOnboarded = useStore(state => state.isOnboarded);
  if (!isOnboarded) return <Navigate to="/" replace />;
  return children;
};

// Animated page wrapper — uses pathname as key to force remount and replay the fadeSlideUp animation on every screen switch
const AnimatedPage = ({ children }) => {
  const location = useLocation();
  const animationsEnabled = useStore(state => state.animationsEnabled);

  return (
    <Box
      key={location.pathname}
      className={animationsEnabled ? 'anim-page-enter' : undefined}
      sx={{ minHeight: '100vh' }}
    >
      {children}
    </Box>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  // Support hiding navigation on Login (/) and MovieDetails routes
  const hideNav = ['/'].includes(location.pathname) || location.pathname.includes('/movie/') || location.pathname.includes('/series/');
  
  return (
    <>
      <AnimatedPage>{children}</AnimatedPage>
      {!hideNav && <NavBar />}
    </>
  );
};

export default function App() {
  const themeMode = useStore(state => state.themeMode);
  const accentColor = useStore(state => state.accentColor);
  
  // State to hold active resolved theme mode
  const [resolvedMode, setResolvedMode] = useState('dark');

  // Listen to system theme preferences when mode is 'system'
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedMode(mediaQuery.matches ? 'dark' : 'light');

      const listener = (e) => setResolvedMode(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      setResolvedMode(themeMode);
    }
  }, [themeMode]);

  // Disable all animations globally if user turns them off
  const animationsEnabled = useStore(state => state.animationsEnabled);
  useEffect(() => {
    if (!animationsEnabled) {
      document.body.classList.add('disable-animations');
    } else {
      document.body.classList.remove('disable-animations');
    }
  }, [animationsEnabled]);

  // Inject accent color as CSS variable for index.css animations
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  const theme = getTheme(resolvedMode, accentColor);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<LoginScreen />} />
              <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchScreen /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><SavedScreen /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
              <Route path="/setting" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
              <Route path="/movie/:id" element={<ProtectedRoute><MovieDetailsScreen /></ProtectedRoute>} />
              <Route path="/series/:id" element={<ProtectedRoute><SeriesDetailsScreen /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
      <Analytics />
    </ThemeProvider>
  );
}
