import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './services/supabaseClient';

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
      hydrateSettings: (profile) => set({
        userName: profile.user_name || '',
        avatar: profile.avatar_url || null,
        themeMode: profile.theme_mode || 'system',
        accentColor: profile.accent_color || '#E50914',
        animationsEnabled: profile.animations_enabled !== null ? profile.animations_enabled : true,
        navSettingsEnabled: profile.nav_settings_enabled !== null ? profile.nav_settings_enabled : true,
        selectedGenres: profile.selected_genres || [],
      }),
      setAccentColor: (color) => {
        set({ accentColor: color });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ accent_color: color }).eq('id', session.user.id);
      },
      setFloatingNavBar: (val) => set({ floatingNavBar: val }),
      setAnimationsEnabled: (val) => {
        set({ animationsEnabled: val });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ animations_enabled: val }).eq('id', session.user.id);
      },
      setNavBarAnimationEnabled: (val) => set({ navBarAnimationEnabled: val }),
      setNavSearchEnabled: (val) => set({ navSearchEnabled: val }),
      setNavSettingsEnabled: (val) => {
        set({ navSettingsEnabled: val });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ nav_settings_enabled: val }).eq('id', session.user.id);
      },

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
      setSession: (session) => set({ session }),
      setHydratedMovies: (movies) => set({
        watchlist: movies.filter(m => m.status === 'watchlist').map(m => m.movie_data),
        favorites: movies.filter(m => m.status === 'favorite').map(m => m.movie_data),
        history: movies.filter(m => m.status === 'history').map(m => m.movie_data)
      }),
      setAvatar: (url) => {
        set({ avatar: url });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ avatar_url: url }).eq('id', session.user.id);
      },
      setUserName: (name) => {
        set({ userName: name });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ user_name: name }).eq('id', session.user.id);
      },
      toggleGenre: (genre) => set((state) => {
        const newGenres = state.selectedGenres.includes(genre)
          ? state.selectedGenres.filter((g) => g !== genre)
          : [...state.selectedGenres, genre];
        
        const { session } = useStore.getState();
        if (session?.user) {
          supabase.from('profiles').update({ selected_genres: newGenres }).eq('id', session.user.id);
        }
        return { selectedGenres: newGenres };
      }),
      
      addToWatchlist: async (movie) => {
        set((state) => ({
          watchlist: state.watchlist.some(m => m.id === movie.id) ? state.watchlist : [...state.watchlist, movie]
        }));
        const { session } = useStore.getState();
        if (session?.user) {
          await supabase.from('user_movies').upsert({ user_id: session.user.id, movie_id: movie.id, status: 'watchlist', movie_data: movie, movie_type: movie.media_type || 'movie' });
          await supabase.from('user_activity').insert({ user_id: session.user.id, movie_id: movie.id, genres: movie.genre_ids || [], action_type: 'added_watchlist', weight: 2 });
        }
      },
      removeFromWatchlist: async (id) => {
        set((state) => ({ watchlist: state.watchlist.filter((m) => m.id !== id) }));
        const { session } = useStore.getState();
        if (session?.user) await supabase.from('user_movies').delete().match({ user_id: session.user.id, movie_id: id, status: 'watchlist' });
      },
      
      addToFavorites: async (movie) => {
        set((state) => ({
          favorites: state.favorites.some(m => m.id === movie.id) ? state.favorites : [...state.favorites, movie]
        }));
        const { session } = useStore.getState();
        if (session?.user) {
          await supabase.from('user_movies').upsert({ user_id: session.user.id, movie_id: movie.id, status: 'favorite', movie_data: movie, movie_type: movie.media_type || 'movie' });
          await supabase.from('user_activity').insert({ user_id: session.user.id, movie_id: movie.id, genres: movie.genre_ids || [], action_type: 'added_favorite', weight: 4 });
        }
      },
      removeFromFavorites: async (id) => {
        set((state) => ({ favorites: state.favorites.filter((m) => m.id !== id) }));
        const { session } = useStore.getState();
        if (session?.user) await supabase.from('user_movies').delete().match({ user_id: session.user.id, movie_id: id, status: 'favorite' });
      },
      
      addToHistory: async (movie) => {
        set((state) => {
          const filtered = state.history.filter((m) => m.id !== movie.id);
          return {
            history: [{ ...movie, watchedDate: new Date().toISOString() }, ...filtered],
            watchlist: state.watchlist.filter((m) => m.id !== movie.id),
          };
        });
        const { session } = useStore.getState();
        if (session?.user) {
          const watchedDate = new Date().toISOString();
          await supabase.from('user_movies').upsert({ user_id: session.user.id, movie_id: movie.id, status: 'history', movie_data: movie, movie_type: movie.media_type || 'movie', watched_date: watchedDate });
          await supabase.from('user_movies').delete().match({ user_id: session.user.id, movie_id: movie.id, status: 'watchlist' });
          await supabase.from('user_activity').insert({ user_id: session.user.id, movie_id: movie.id, genres: movie.genre_ids || [], action_type: 'marked_history', weight: 5 });
        }
      },
      removeFromHistory: async (id) => {
        set((state) => ({ history: state.history.filter((m) => m.id !== id) }));
        const { session } = useStore.getState();
        if (session?.user) await supabase.from('user_movies').delete().match({ user_id: session.user.id, movie_id: id, status: 'history' });
      },
      
      setThemeMode: (mode) => {
        set({ themeMode: mode });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ theme_mode: mode }).eq('id', session.user.id);
      },
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
