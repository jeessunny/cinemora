package com.jeessunny.cinemora.data

object RecommendationEngine {

    fun getRecommendationData(prefs: PreferencesManager): Pair<List<String>, List<String>> {
        val selectedGenres = prefs.getSelectedGenres().toList()
        val selectedLanguages = prefs.getSelectedLanguages().toList()
        val history = prefs.getHistory()
        val favorites = prefs.getFavorites()
        val watchlist = prefs.getWatchlist()

        val genreScores = mutableMapOf<String, Int>()
        val languageScores = mutableMapOf<String, Int>()

        fun processMovie(movie: com.jeessunny.cinemora.model.Movie, weight: Int) {
            movie.genres.forEach { g ->
                genreScores[g] = (genreScores[g] ?: 0) + weight
            }
            if (movie.originalLanguage.isNotBlank()) {
                languageScores[movie.originalLanguage] = (languageScores[movie.originalLanguage] ?: 0) + weight
            }
        }

        history.forEach { processMovie(it, 5) }
        favorites.forEach { processMovie(it, 4) }
        watchlist.forEach { processMovie(it, 2) }

        val sortedGenres = genreScores.entries.sortedByDescending { it.value }.map { it.key }
        val sortedLanguages = languageScores.entries.sortedByDescending { it.value }.map { it.key }

        val topGenres = if (sortedGenres.isNotEmpty()) {
            (sortedGenres.take(3) + selectedGenres).distinct()
        } else {
            if (selectedGenres.isNotEmpty()) selectedGenres else listOf("Action")
        }

        val topLanguages = (sortedLanguages.take(3) + selectedLanguages).distinct()

        return Pair(topGenres, topLanguages)
    }
}
