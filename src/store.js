import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_SECTIONS = [
  { id: 'recommended', label: 'Recommended For You', enabled: true },
  { id: 'genre1', label: 'Because You Like [Genre]', enabled: true },
  { id: 'genre2', label: 'More [Genre]', enabled: true },
  { id: 'trending', label: 'Trending Now', enabled: true },
  { id: 'popular', label: 'Popular in Your Taste', enabled: true },
  { id: 'newReleases', label: 'New Releases', enabled: true },
];

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

      // === Customization State ===
      accentColor: '#E50914', // Default Netflix Red
      floatingNavBar: true, // true = floating pill, false = fixed bottom
      homeSections: DEFAULT_SECTIONS,
      animationsEnabled: true, // Master toggle for all animations
      navBarAnimationEnabled: true, // Toggle for just navbar water ripple
      navSearchEnabled: true, // Toggle for Search tab visibility in NavBar
      navSettingsEnabled: true, // Toggle for Settings tab visibility in NavBar

      // === Customization Actions ===
      setAccentColor: (color) => set({ accentColor: color }),
      setFloatingNavBar: (val) => set({ floatingNavBar: val }),
      setAnimationsEnabled: (val) => set({ animationsEnabled: val }),
      setNavBarAnimationEnabled: (val) => set({ navBarAnimationEnabled: val }),
      setNavSearchEnabled: (val) => set({ navSearchEnabled: val }),
      setNavSettingsEnabled: (val) => set({ navSettingsEnabled: val }),

      toggleHomeSection: (id) => set((state) => ({
        homeSections: state.homeSections.map(s =>
          s.id === id ? { ...s, enabled: !s.enabled } : s
        )
      })),

      reorderHomeSections: (fromIndex, toIndex) => set((state) => {
        const sections = [...state.homeSections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        return { homeSections: sections };
      }),

      resetHomeSections: () => set({ homeSections: DEFAULT_SECTIONS }),

      // === Existing Actions ===
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
          // Auto-remove from watchlist when marked as watched
          watchlist: state.watchlist.filter((m) => m.id !== movie.id),
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
