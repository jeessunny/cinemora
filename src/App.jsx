import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import useStore from './store';
import NavBar from './components/NavBar';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import SavedScreen from './screens/SavedScreen';
import SettingsScreen from './screens/SettingsScreen';
import MovieDetailsScreen from './screens/MovieDetailsScreen';

const ProtectedRoute = ({ children }) => {
  const isOnboarded = useStore(state => state.isOnboarded);
  if (!isOnboarded) return <Navigate to="/" replace />;
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  // Support hiding navigation on both /settings and /setting routes
  const hideNav = ['/', '/settings', '/setting'].includes(location.pathname) || location.pathname.includes('/movie/');
  
  return (
    <>
      {children}
      {!hideNav && <NavBar />}
    </>
  );
};

export default function App() {
  const themeMode = useStore(state => state.themeMode);
  
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

  const theme = getTheme(resolvedMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchScreen /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><SavedScreen /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
            <Route path="/setting" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
            <Route path="/movie/:id" element={<ProtectedRoute><MovieDetailsScreen /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
