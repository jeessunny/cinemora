import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      avatar: null,
      userName: '',
      selectedGenres: [],
      watchlist: [],
      favorites: [],
      history: [],
      themeMode: 'system', // Default to system theme
      isOnboarded: false,
      recentSearches: [],

      setAvatar: (url) => set({ avatar: url }),
      setUserName: (name) => set({ userName: name }),
      toggleGenre: (genre) => set((state) => ({
        selectedGenres: state.selectedGenres.includes(genre)
          ? state.selectedGenres.filter((g) => g !== genre)
          : [...state.selectedGenres, genre],
      })),
      
      addToWatchlist: (movie) => set((state) => ({
        watchlist: state.watchlist.some(m => m.id === movie.id) 
          ? state.watchlist 
          : [...state.watchlist, movie]
      })),
      removeFromWatchlist: (id) => set((state) => ({
        watchlist: state.watchlist.filter((m) => m.id !== id),
      })),
      
      addToFavorites: (movie) => set((state) => ({
        favorites: state.favorites.some(m => m.id === movie.id)
          ? state.favorites
          : [...state.favorites, movie]
      })),
      removeFromFavorites: (id) => set((state) => ({
        favorites: state.favorites.filter((m) => m.id !== id),
      })),
      
      addToHistory: (movie) => set((state) => {
        const filtered = state.history.filter((m) => m.id !== movie.id);
        return {
          history: [{ ...movie, watchedDate: new Date().toISOString() }, ...filtered],
        };
      }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((m) => m.id !== id),
      })),
      
      setThemeMode: (mode) => set({ themeMode: mode }), // Solid theme setting (light, dark, system)
      setOnboarded: (status) => set({ isOnboarded: status }),
      
      addRecentSearch: (query) => set((state) => ({
        recentSearches: [query, ...state.recentSearches.filter((q) => q !== query)].slice(0, 5),
      })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      clearHistory: () => set({ history: [] }),
      
      resetRecommendations: () => set({
        selectedGenres: [],
        watchlist: [],
        favorites: [],
        history: [],
      }),
    }),
    {
      name: 'cinemora-storage',
    }
  )
);

export default useStore;
