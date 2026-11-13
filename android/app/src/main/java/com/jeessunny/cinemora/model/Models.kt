package com.jeessunny.cinemora.model

data class CastMember(
    val name: String,
    val character: String,
    val photoUrl: String
)

data class Season(
    val id: Int,
    val seasonNumber: Int,
    val name: String,
    val episodeCount: Int,
    val airDate: String
)

data class Episode(
    val id: Int,
    val episodeNumber: Int,
    val name: String,
    val overview: String,
    val airDate: String,
    val runtime: Int,
    val rating: Float,
    val stillUrl: String
)

data class Movie(
    val id: Int,
    val type: String = "movie", // "movie" or "tv"
    val title: String,
    val year: Int = 2024,
    val rating: Float = 8.5f,
    val runtime: String = "2h 15m",
    val genres: List<String> = listOf("Action"),
    val genreIds: List<Int> = listOf(28),
    val originalLanguage: String = "en",
    val posterUrl: String,
    val backdropUrl: String,
    val synopsis: String,
    val matchPercentage: Int = 94,
    val cast: List<CastMember> = emptyList(),
    val similar: List<Movie> = emptyList(),
    val numberOfSeasons: Int? = null,
    val numberOfEpisodes: Int? = null,
    val status: String? = null,
    val networks: List<String>? = null,
    val seasons: List<Season>? = null
)

data class Language(
    val label: String,
    val value: String
)

data class HomeSection(
    val id: String,
    val label: String,
    var enabled: Boolean = true
)

data class UpdateInfo(
    val version: String,
    val tagName: String,
    val releaseNotes: String,
    val downloadUrl: String,
    val fileSize: Long
)

sealed class UpdateState {
    object Idle : UpdateState()
    object Checking : UpdateState()
    data class Available(val info: UpdateInfo) : UpdateState()
    data class Downloading(val progressPercent: Int, val bytesDownloaded: Long, val totalBytes: Long) : UpdateState()
    data class Ready(val apkFile: java.io.File, val info: UpdateInfo) : UpdateState()
    object UpToDate : UpdateState()
    data class Error(val message: String) : UpdateState()
}
