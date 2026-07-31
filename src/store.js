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
      selectedLanguages: [],
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
      navSearchEnabled: true, // Toggle for Search tab visibility in NavBar
      navSettingsEnabled: true, // Toggle for Settings tab visibility in NavBar

      // === Customization Actions ===
      hydrateSettings: (profile) => set((state) => ({
        userName: profile.user_name || state.userName,
        avatar: profile.avatar_url || state.avatar,
        themeMode: profile.theme_mode || state.themeMode,
        accentColor: profile.accent_color || state.accentColor,
        animationsEnabled: profile.animations_enabled !== null ? profile.animations_enabled : state.animationsEnabled,
        navSettingsEnabled: profile.nav_settings_enabled !== null ? profile.nav_settings_enabled : state.navSettingsEnabled,
        selectedGenres: (profile.selected_genres && profile.selected_genres.length > 0) ? profile.selected_genres : state.selectedGenres,
        selectedLanguages: (profile.selected_languages && profile.selected_languages.length > 0) ? profile.selected_languages : state.selectedLanguages,
        floatingNavBar: profile.floating_nav_bar !== null ? profile.floating_nav_bar : state.floatingNavBar,
        navSearchEnabled: profile.nav_search_enabled !== null ? profile.nav_search_enabled : state.navSearchEnabled,
        homeSections: profile.home_sections || state.homeSections,
      })),
      setAccentColor: (color) => {
        set({ accentColor: color });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ accent_color: color }).eq('id', session.user.id);
      },
      setFloatingNavBar: (val) => {
        set({ floatingNavBar: val });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ floating_nav_bar: val }).eq('id', session.user.id);
      },
      setAnimationsEnabled: (val) => {
        set({ animationsEnabled: val });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ animations_enabled: val }).eq('id', session.user.id);
      },
      setNavSearchEnabled: (val) => {
        set({ navSearchEnabled: val });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ nav_search_enabled: val }).eq('id', session.user.id);
      },
      setNavSettingsEnabled: (val) => {
        set({ navSettingsEnabled: val });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ nav_settings_enabled: val }).eq('id', session.user.id);
      },

      toggleHomeSection: (id) => set((state) => {
        const newSections = state.homeSections.map(s =>
          s.id === id ? { ...s, enabled: !s.enabled } : s
        );
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ home_sections: newSections }).eq('id', session.user.id);
        return { homeSections: newSections };
      }),

      reorderHomeSections: (fromIndex, toIndex) => set((state) => {
        const sections = [...state.homeSections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ home_sections: sections }).eq('id', session.user.id);
        return { homeSections: sections };
      }),

      resetHomeSections: () => {
        set({ homeSections: DEFAULT_SECTIONS });
        const { session } = useStore.getState();
        if (session?.user) supabase.from('profiles').update({ home_sections: DEFAULT_SECTIONS }).eq('id', session.user.id);
      },

      // === Existing Actions ===
      setSession: (session) => set({ session }),
      setHydratedMovies: (movies) => set({
        watchlist: movies.filter(m => m.status === 'watchlist').map(m => m.movie_data).filter(Boolean),
        favorites: movies.filter(m => m.status === 'favorite').map(m => m.movie_data).filter(Boolean),
        history: movies.filter(m => m.status === 'history').map(m => m.movie_data).filter(Boolean)
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
      setSelectedLanguages: (languages) => set((state) => {
        // Enforce max 3 logic here as a safeguard
        const newLanguages = languages.slice(0, 3);
        const { session } = useStore.getState();
        if (session?.user) {
          supabase.from('profiles').update({ selected_languages: newLanguages }).eq('id', session.user.id);
        }
        return { selectedLanguages: newLanguages };
      }),
      
      addToWatchlist: async (movie) => {
        set((state) => ({
          watchlist: state.watchlist.some(m => m.id === movie.id) ? state.watchlist : [...state.watchlist, movie]
        }));
        const { session } = useStore.getState();
        if (session?.user) {
          await supabase.from('user_movies').upsert({ user_id: session.user.id, movie_id: movie.id, status: 'watchlist', movie_data: movie, movie_type: movie.media_type || 'movie' });
          await supabase.from('user_activity').insert({ 
            user_id: session.user.id, 
            movie_id: movie.id, 
            genres: movie.genre_ids || [], 
            action_type: 'added_watchlist', 
            weight: 2,
            original_language: movie.original_language || 'en'
          });
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
          await supabase.from('user_activity').insert({ 
            user_id: session.user.id, 
            movie_id: movie.id, 
            genres: movie.genre_ids || [], 
            action_type: 'added_favorite', 
            weight: 4,
            original_language: movie.original_language || 'en'
          });
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
          await supabase.from('user_activity').insert({ 
            user_id: session.user.id, 
            movie_id: movie.id, 
            genres: movie.genre_ids || [], 
            action_type: 'marked_history', 
            weight: 5,
            original_language: movie.original_language || 'en'
          });
        }
      },
      removeFromHistory: async (id) => {
        set((state) => ({ history: state.history.filter((m) => m.id !== id) }));
        const { session } = useStore.getState();
        if (session?.user) await supabase.from('user_movies').delete().match({ user_id: session.user.id, movie_id: id, status: 'history' });
      },
      
      trackMovieView: async (movie, source) => {
        const { session } = useStore.getState();
        if (session?.user) {
          await supabase.from('user_activity').insert({
            user_id: session.user.id,
            movie_id: movie.id,
            genres: movie.genre_ids || [],
            action_type: `viewed_from_${source}`,
            weight: source === 'search' ? 2 : 1, // Search clicks mean higher intent
            original_language: movie.original_language || 'en'
          });
        }
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
