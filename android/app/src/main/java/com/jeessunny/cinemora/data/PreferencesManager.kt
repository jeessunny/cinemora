package com.jeessunny.cinemora.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.jeessunny.cinemora.model.HomeSection
import com.jeessunny.cinemora.model.Movie
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class PreferencesManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("cinemora_native_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    private val defaultSections = listOf(
        HomeSection("recommended", "Recommended For You", true),
        HomeSection("genre1", "Because You Like Action", true),
        HomeSection("genre2", "More Sci-Fi", true),
        HomeSection("trending", "Trending Now", true),
        HomeSection("popular", "Popular in Your Taste", true),
        HomeSection("newReleases", "New Releases", true)
    )

    // Flow states for reactive Compose observation
    private val _themeMode = MutableStateFlow(getThemeMode())
    val themeMode: StateFlow<String> = _themeMode.asStateFlow()

    private val _amoledBlack = MutableStateFlow(getAmoledBlack())
    val amoledBlack: StateFlow<Boolean> = _amoledBlack.asStateFlow()

    private val _accentColor = MutableStateFlow(getAccentColor())
    val accentColor: StateFlow<String> = _accentColor.asStateFlow()

    private val _floatingNavBar = MutableStateFlow(getFloatingNavBar())
    val floatingNavBar: StateFlow<Boolean> = _floatingNavBar.asStateFlow()

    private val _animationsEnabled = MutableStateFlow(getAnimationsEnabled())
    val animationsEnabled: StateFlow<Boolean> = _animationsEnabled.asStateFlow()

    private val _navSettingsEnabled = MutableStateFlow(getNavSettingsEnabled())
    val navSettingsEnabled: StateFlow<Boolean> = _navSettingsEnabled.asStateFlow()

    private val _isOnboarded = MutableStateFlow(getIsOnboarded())
    val isOnboarded: StateFlow<Boolean> = _isOnboarded.asStateFlow()

    private val _userName = MutableStateFlow(getUserName())
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _avatar = MutableStateFlow(getAvatar())
    val avatar: StateFlow<String> = _avatar.asStateFlow()

    private val _watchlist = MutableStateFlow(getWatchlist())
    val watchlist: StateFlow<List<Movie>> = _watchlist.asStateFlow()

    private val _favorites = MutableStateFlow(getFavorites())
    val favorites: StateFlow<List<Movie>> = _favorites.asStateFlow()

    private val _history = MutableStateFlow(getHistory())
    val history: StateFlow<List<Movie>> = _history.asStateFlow()

    private val _recentSearches = MutableStateFlow(getRecentSearches())
    val recentSearches: StateFlow<List<String>> = _recentSearches.asStateFlow()

    private val _homeSections = MutableStateFlow(getHomeSections())
    val homeSections: StateFlow<List<HomeSection>> = _homeSections.asStateFlow()

    // --- Onboarding & Profile ---
    fun getIsOnboarded(): Boolean = prefs.getBoolean("is_onboarded", false)
    fun setOnboarded(value: Boolean) {
        prefs.edit().putBoolean("is_onboarded", value).apply()
        _isOnboarded.value = value
    }

    fun getUserName(): String = prefs.getString("user_name", "") ?: ""
    fun setUserName(name: String) {
        prefs.edit().putString("user_name", name).apply()
        _userName.value = name
    }

    fun getAvatar(): String = prefs.getString("user_avatar", "https://api.dicebear.com/7.x/avataaars/png?seed=MovieLover") ?: "https://api.dicebear.com/7.x/avataaars/png?seed=MovieLover"
    fun setAvatar(url: String) {
        prefs.edit().putString("user_avatar", url).apply()
        _avatar.value = url
    }

    fun getSelectedGenres(): Set<String> =
        prefs.getStringSet("selected_genres", setOf("Action", "Sci-Fi", "Drama")) ?: setOf("Action", "Sci-Fi", "Drama")
    fun setSelectedGenres(genres: Set<String>) {
        prefs.edit().putStringSet("selected_genres", genres).apply()
    }

    fun getSelectedLanguages(): Set<String> =
        prefs.getStringSet("selected_languages", setOf("en")) ?: setOf("en")
    fun setSelectedLanguages(langs: Set<String>) {
        prefs.edit().putStringSet("selected_languages", langs).apply()
    }

    // --- Appearance ---
    fun getThemeMode(): String = prefs.getString("theme_mode", "system") ?: "system"
    fun setThemeMode(mode: String) {
        val cleanMode = if (mode == "black") "dark" else mode
        prefs.edit().putString("theme_mode", cleanMode).apply()
        _themeMode.value = cleanMode
    }

    fun getAmoledBlack(): Boolean = prefs.getBoolean("amoled_black", false)
    fun setAmoledBlack(enabled: Boolean) {
        prefs.edit().putBoolean("amoled_black", enabled).apply()
        _amoledBlack.value = enabled
    }

    fun getAccentColor(): String = prefs.getString("accent_color", "#E50914") ?: "#E50914"
    fun setAccentColor(hex: String) {
        prefs.edit().putString("accent_color", hex).apply()
        _accentColor.value = hex
    }

    fun getFloatingNavBar(): Boolean = prefs.getBoolean("floating_nav_bar", true)
    fun setFloatingNavBar(floating: Boolean) {
        prefs.edit().putBoolean("floating_nav_bar", floating).apply()
        _floatingNavBar.value = floating
    }

    fun getAnimationsEnabled(): Boolean = prefs.getBoolean("animations_enabled", true)
    fun setAnimationsEnabled(enabled: Boolean) {
        prefs.edit().putBoolean("animations_enabled", enabled).apply()
        _animationsEnabled.value = enabled
    }

    fun getNavSettingsEnabled(): Boolean = prefs.getBoolean("nav_settings_enabled", true)
    fun setNavSettingsEnabled(enabled: Boolean) {
        prefs.edit().putBoolean("nav_settings_enabled", enabled).apply()
        _navSettingsEnabled.value = enabled
    }

    // --- Collections (Watchlist, Favorites, History) ---
    private fun getMovieList(key: String): List<Movie> {
        val json = prefs.getString(key, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<Movie>>() {}.type
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun saveMovieList(key: String, list: List<Movie>) {
        val json = gson.toJson(list)
        prefs.edit().putString(key, json).apply()
    }

    fun getWatchlist(): List<Movie> = getMovieList("watchlist")
    fun toggleWatchlist(movie: Movie) {
        val current = getWatchlist().toMutableList()
        val index = current.indexOfFirst { it.id == movie.id }
        if (index >= 0) {
            current.removeAt(index)
        } else {
            current.add(movie)
        }
        saveMovieList("watchlist", current)
        _watchlist.value = current
    }

    fun getFavorites(): List<Movie> = getMovieList("favorites")
    fun toggleFavorite(movie: Movie) {
        val current = getFavorites().toMutableList()
        val index = current.indexOfFirst { it.id == movie.id }
        if (index >= 0) {
            current.removeAt(index)
        } else {
            current.add(movie)
        }
        saveMovieList("favorites", current)
        _favorites.value = current
    }

    fun getHistory(): List<Movie> = getMovieList("history")
    fun toggleHistory(movie: Movie) {
        val current = getHistory().toMutableList()
        val index = current.indexOfFirst { it.id == movie.id }
        if (index >= 0) {
            current.removeAt(index)
        } else {
            current.add(movie)
        }
        saveMovieList("history", current)
        _history.value = current
    }

    fun clearHistory() {
        saveMovieList("history", emptyList())
        _history.value = emptyList()
    }

    // --- Recent Searches ---
    fun getRecentSearches(): List<String> {
        val json = prefs.getString("recent_searches", null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<String>>() {}.type
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun addRecentSearch(query: String) {
        if (query.isBlank()) return
        val current = getRecentSearches().toMutableList()
        current.remove(query)
        current.add(0, query)
        val trimmed = current.take(10)
        prefs.edit().putString("recent_searches", gson.toJson(trimmed)).apply()
        _recentSearches.value = trimmed
    }

    fun clearRecentSearches() {
        prefs.edit().putString("recent_searches", gson.toJson(emptyList<String>())).apply()
        _recentSearches.value = emptyList()
    }

    // --- Home Sections ---
    fun getHomeSections(): List<HomeSection> {
        val json = prefs.getString("home_sections", null) ?: return defaultSections
        return try {
            val type = object : TypeToken<List<HomeSection>>() {}.type
            gson.fromJson(json, type) ?: defaultSections
        } catch (e: Exception) {
            defaultSections
        }
    }

    fun saveHomeSections(sections: List<HomeSection>) {
        prefs.edit().putString("home_sections", gson.toJson(sections)).apply()
        _homeSections.value = sections
    }

    fun toggleHomeSection(id: String) {
        val current = getHomeSections().map {
            if (it.id == id) it.copy(enabled = !it.enabled) else it
        }
        saveHomeSections(current)
    }

    fun resetHomeSections() {
        saveHomeSections(defaultSections)
    }

    fun clearAllData() {
        prefs.edit().clear().apply()
        _isOnboarded.value = false
        _userName.value = ""
        _avatar.value = "https://api.dicebear.com/7.x/avataaars/png?seed=MovieLover"
        _watchlist.value = emptyList()
        _favorites.value = emptyList()
        _history.value = emptyList()
        _recentSearches.value = emptyList()
        _themeMode.value = "system"
        _amoledBlack.value = false
        _accentColor.value = "#E50914"
        _floatingNavBar.value = true
        _animationsEnabled.value = true
        _navSettingsEnabled.value = true
        _homeSections.value = defaultSections
    }
}
