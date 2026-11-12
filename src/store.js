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
      session: null,
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
      navSearchEnabled: true, // Toggle for Search tab visibility in NavBar
      navSettingsEnabled: true, // Toggle for Settings tab visibility in NavBar

      // === Customization Actions ===
      hydrateSettings: (profile) => set((state) => ({
        userName: profile.user_name || state.userName,
        avatar: profile.avatar_url || state.avatar,
        themeMode: profile.theme_mode || state.themeMode,
        amoledBlack: profile.amoled_black !== undefined ? profile.amoled_black : state.amoledBlack,
        accentColor: profile.accent_color || state.accentColor,
        animationsEnabled: profile.animations_enabled !== null ? profile.animations_enabled : state.animationsEnabled,
        navSettingsEnabled: profile.nav_settings_enabled !== null ? profile.nav_settings_enabled : state.navSettingsEnabled,
        selectedGenres: (profile.selected_genres && profile.selected_genres.length > 0) ? profile.selected_genres : state.selectedGenres,
        selectedLanguages: (profile.selected_languages && profile.selected_languages.length > 0) ? profile.selected_languages : state.selectedLanguages,
        floatingNavBar: profile.floating_nav_bar !== null ? profile.floating_nav_bar : state.floatingNavBar,
        navSearchEnabled: profile.nav_search_enabled !== null ? profile.nav_search_enabled : state.navSearchEnabled,
        homeSections: profile.home_sections || state.homeSections,
      })),
      setAccentColor: (color) => set({ accentColor: color }),
      setAmoledBlack: (val) => set({ amoledBlack: val }),
      setFloatingNavBar: (val) => set({ floatingNavBar: val }),
      setAnimationsEnabled: (val) => set({ animationsEnabled: val }),
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
      clearAllData: () => set({
        session: null,
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
        navSearchEnabled: true,
        navSettingsEnabled: true
      }),
      setSession: (session) => set({ session }),
      setHydratedMovies: (movies) => set({
        watchlist: movies.filter(m => m.status === 'watchlist').map(m => m.movie_data).filter(Boolean),
        favorites: movies.filter(m => m.status === 'favorite').map(m => m.movie_data).filter(Boolean),
        history: movies.filter(m => m.status === 'history').map(m => m.movie_data).filter(Boolean)
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
        // Track locally if needed or no-op
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
