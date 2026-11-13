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
      selectedLanguages: [],
      watchlist: [],
      favorites: [],
      history: [],
      themeMode: 'system', // 'system' | 'dark' | 'light' | 'black'
      amoledBlack: false, // Pure pitch black mode
      isOnboarded: false,
      recentSearches: [],

      // === Customization State ===
      accentColor: '#E50914', // Default Netflix Red
      floatingNavBar: true, // true = floating pill, false = fixed bottom
      homeSections: DEFAULT_SECTIONS,
      animationsEnabled: true, // Master toggle for all animations
      navLibraryEnabled: true, // Toggle for Library tab visibility in NavBar
      navSearchEnabled: true, // Backwards-compatible alias
      navSettingsEnabled: true, // Toggle for Settings tab visibility in NavBar

      // === Customization Actions ===
      setAccentColor: (color) => set({ accentColor: color }),
      setAmoledBlack: (val) => set({ amoledBlack: val }),
      setFloatingNavBar: (val) => set({ floatingNavBar: val }),
      setAnimationsEnabled: (val) => set({ animationsEnabled: val }),
      setNavLibraryEnabled: (val) => set({ navLibraryEnabled: val, navSearchEnabled: val }),
      setNavSearchEnabled: (val) => set({ navLibraryEnabled: val, navSearchEnabled: val }),
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

      // === Profile & Data Actions ===
      clearAllData: () => set({
        avatar: null,
        userName: '',
        selectedGenres: [],
        selectedLanguages: [],
        watchlist: [],
        favorites: [],
        history: [],
        isOnboarded: false,
        recentSearches: [],
        themeMode: 'system',
        amoledBlack: false,
        accentColor: '#E50914',
        floatingNavBar: true,
        homeSections: DEFAULT_SECTIONS,
        animationsEnabled: true,
        navLibraryEnabled: true,
        navSearchEnabled: true,
        navSettingsEnabled: true
      }),
      setAvatar: (url) => set({ avatar: url }),
      setUserName: (name) => set({ userName: name }),
      toggleGenre: (genre) => set((state) => {
        const newGenres = state.selectedGenres.includes(genre)
          ? state.selectedGenres.filter((g) => g !== genre)
          : [...state.selectedGenres, genre];
        return { selectedGenres: newGenres };
      }),
      setGenres: (genres) => set({ selectedGenres: genres }),
      setSelectedLanguages: (languages) => set({ selectedLanguages: languages.slice(0, 3) }),
      
      addToWatchlist: (movie) => {
        set((state) => ({
          watchlist: state.watchlist.some(m => m.id === movie.id) ? state.watchlist : [...state.watchlist, movie]
        }));
      },
      removeFromWatchlist: (id) => {
        set((state) => ({ watchlist: state.watchlist.filter((m) => m.id !== id) }));
      },
      
      addToFavorites: (movie) => {
        set((state) => ({
          favorites: state.favorites.some(m => m.id === movie.id) ? state.favorites : [...state.favorites, movie]
        }));
      },
      removeFromFavorites: (id) => {
        set((state) => ({ favorites: state.favorites.filter((m) => m.id !== id) }));
      },
      
      addToHistory: (movie) => {
        set((state) => {
          const filtered = state.history.filter((m) => m.id !== movie.id);
          return {
            history: [{ ...movie, watchedDate: new Date().toISOString() }, ...filtered],
            watchlist: state.watchlist.filter((m) => m.id !== movie.id),
          };
        });
      },
      removeFromHistory: (id) => {
        set((state) => ({ history: state.history.filter((m) => m.id !== id) }));
      },
      
      trackMovieView: (movie, source) => {
        // Local view tracking no-op
      },
      
      setThemeMode: (mode) => set({ themeMode: mode }),
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
