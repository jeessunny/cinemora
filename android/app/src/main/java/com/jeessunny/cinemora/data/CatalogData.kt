package com.jeessunny.cinemora.data

import com.jeessunny.cinemora.model.CastMember
import com.jeessunny.cinemora.model.Episode
import com.jeessunny.cinemora.model.Language
import com.jeessunny.cinemora.model.Movie
import com.jeessunny.cinemora.model.Season

object CatalogData {

    val GENRE_MAP: Map<Int, String> = mapOf(
        28 to "Action",
        12 to "Adventure",
        16 to "Animation",
        35 to "Comedy",
        80 to "Crime",
        99 to "Documentary",
        18 to "Drama",
        10751 to "Family",
        14 to "Fantasy",
        36 to "History",
        27 to "Horror",
        10402 to "Music",
        9648 to "Mystery",
        10749 to "Romance",
        878 to "Sci-Fi",
        10770 to "TV Movie",
        53 to "Thriller",
        10752 to "War",
        37 to "Western"
    )

    val GENRE_NAME_TO_ID: Map<String, Int> = GENRE_MAP.entries.associate { (k, v) -> v to k }

    val ALL_GENRES: List<String> = listOf(
        "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller",
        "Romance", "Animation", "Documentary", "Fantasy", "Mystery", "Adventure"
    )

    val ALL_LANGUAGES: List<Language> = listOf(
        Language("English", "en"),
        Language("Spanish", "es"),
        Language("French", "fr"),
        Language("German", "de"),
        Language("Japanese", "ja"),
        Language("Korean", "ko"),
        Language("Chinese", "zh"),
        Language("Hindi", "hi"),
        Language("Italian", "it"),
        Language("Portuguese", "pt"),
        Language("Russian", "ru"),
        Language("Arabic", "ar"),
        Language("Dutch", "nl"),
        Language("Swedish", "sv"),
        Language("Turkish", "tr"),
        Language("Polish", "pl"),
        Language("Greek", "el"),
        Language("Thai", "th"),
        Language("Vietnamese", "vi"),
        Language("Indonesian", "id"),
        Language("Malayalam", "ml"),
        Language("Tamil", "ta"),
        Language("Telugu", "te")
    )

    val POPULAR_SEARCHES: List<String> = listOf(
        "Interstellar",
        "Cyberpunk Neo-Tokyo",
        "The Dark Sentinel",
        "Chronicles of Silicon",
        "Animation Fantasy",
        "Thriller Mystery"
    )

    val LOCAL_CATALOG: List<Movie> = listOf(
        Movie(
            id = 101,
            type = "movie",
            title = "Interstellar: Beyond Horizons",
            year = 2024,
            rating = 8.9f,
            runtime = "2h 49m",
            genres = listOf("Sci-Fi", "Adventure", "Drama"),
            genreIds = listOf(878, 12, 18),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
            synopsis = "When humanity faces extinction, a daring team of explorers ventures through a newly discovered wormhole beyond our solar system in search of a new home.",
            matchPercentage = 98,
            cast = listOf(
                CastMember("Matthew McConaughey", "Cooper", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"),
                CastMember("Anne Hathaway", "Brand", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"),
                CastMember("Jessica Chastain", "Murph", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80")
            )
        ),
        Movie(
            id = 102,
            type = "movie",
            title = "The Dark Sentinel",
            year = 2024,
            rating = 8.7f,
            runtime = "2h 32m",
            genres = listOf("Action", "Crime", "Thriller"),
            genreIds = listOf(28, 80, 53),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
            synopsis = "A shadowy vigilante uncovers a deep conspiracy woven through the city's corrupt elite, testing the boundaries of justice and morality.",
            matchPercentage = 96,
            cast = listOf(
                CastMember("Christian Bale", "The Sentinel", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"),
                CastMember("Heath Ledger", "The Anarchist", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80")
            )
        ),
        Movie(
            id = 103,
            type = "movie",
            title = "Echoes of Neo-Tokyo",
            year = 2024,
            rating = 8.6f,
            runtime = "2h 08m",
            genres = listOf("Animation", "Sci-Fi", "Action"),
            genreIds = listOf(16, 878, 28),
            originalLanguage = "ja",
            posterUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80",
            synopsis = "In a rain-slicked cyberpunk metropolis, a renegade hacker and a cybernetic detective unravel memories that should not exist.",
            matchPercentage = 94,
            cast = listOf(
                CastMember("Kenji Sato", "Ren", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"),
                CastMember("Aoi Tanaka", "Kaya", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80")
            )
        ),
        Movie(
            id = 104,
            type = "movie",
            title = "Midnight in Paris: Revisited",
            year = 2023,
            rating = 8.4f,
            runtime = "1h 56m",
            genres = listOf("Romance", "Comedy", "Fantasy"),
            genreIds = listOf(10749, 35, 14),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80",
            synopsis = "A nostalgic writer wandering the cobblestone streets of Paris finds a mysterious midnight carriage that transports him to the vibrant 1920s.",
            matchPercentage = 91,
            cast = listOf(
                CastMember("Owen Wilson", "Gil", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"),
                CastMember("Marion Cotillard", "Adriana", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80")
            )
        ),
        Movie(
            id = 105,
            type = "movie",
            title = "The Crimson Protocol",
            year = 2024,
            rating = 8.5f,
            runtime = "2h 14m",
            genres = listOf("Action", "Thriller", "Mystery"),
            genreIds = listOf(28, 53, 9648),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
            synopsis = "An operative framed for high treason races against time across Europe to uncover the architect behind a global destabilization protocol.",
            matchPercentage = 93,
            cast = listOf(
                CastMember("Tom Hardy", "Agent Vance", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"),
                CastMember("Rebecca Ferguson", "Dr. Ilsa", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80")
            )
        ),
        Movie(
            id = 106,
            type = "movie",
            title = "Whispers of the Forest",
            year = 2023,
            rating = 8.8f,
            runtime = "1h 58m",
            genres = listOf("Animation", "Fantasy", "Family"),
            genreIds = listOf(16, 14, 10751),
            originalLanguage = "ja",
            posterUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1200&q=80",
            synopsis = "A spirited young girl discovers an ancient woodland spirit shrine, sparking an enchanting adventure between the spirit realm and modern humanity.",
            matchPercentage = 97,
            cast = listOf(
                CastMember("Rumi Hiiragi", "Chihiro", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80")
            )
        ),
        Movie(
            id = 107,
            type = "tv",
            title = "Chronicles of Silicon",
            year = 2024,
            rating = 9.1f,
            runtime = "8 Episodes",
            genres = listOf("Drama", "Sci-Fi"),
            genreIds = listOf(18, 878),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
            synopsis = "The inside rise and cutthroat rivalries behind the genesis of artificial intelligence and the tech titans who engineered the next century.",
            matchPercentage = 99,
            numberOfSeasons = 2,
            numberOfEpisodes = 16,
            status = "Returning Series",
            networks = listOf("Cinemora Original"),
            seasons = listOf(
                Season(1, 1, "Season 1: Inception", 8, "2023-09-10"),
                Season(2, 2, "Season 2: Convergence", 8, "2024-04-12")
            )
        ),
        Movie(
            id = 108,
            type = "movie",
            title = "The Grand Illusionist",
            year = 2023,
            rating = 8.3f,
            runtime = "2h 10m",
            genres = listOf("Mystery", "Drama", "Thriller"),
            genreIds = listOf(9648, 18, 53),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
            synopsis = "Two rival stage magicians in Victorian London engage in a competitive battle to create the ultimate teleportation trick, with fatal consequences.",
            matchPercentage = 92,
            cast = listOf(
                CastMember("Hugh Jackman", "Robert Angier", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"),
                CastMember("Christian Bale", "Alfred Borden", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80")
            )
        )
    )

    fun getTrending(): List<Movie> = LOCAL_CATALOG

    fun getNewReleases(): List<Movie> = LOCAL_CATALOG.reversed()

    fun getPopular(): List<Movie> = LOCAL_CATALOG.sortedByDescending { it.rating }

    fun getRecommended(genreIds: List<Int>): List<Movie> {
        if (genreIds.isEmpty()) return LOCAL_CATALOG
        val filtered = LOCAL_CATALOG.filter { movie ->
            movie.genreIds.any { gid -> genreIds.contains(gid) }
        }
        return if (filtered.isNotEmpty()) filtered else LOCAL_CATALOG
    }

    fun getMoviesByGenreId(genreId: Int): List<Movie> {
        val filtered = LOCAL_CATALOG.filter { it.genreIds.contains(genreId) }
        return if (filtered.isNotEmpty()) filtered else LOCAL_CATALOG
    }

    fun searchMovies(query: String, type: String = "movies"): List<Movie> {
        if (query.isBlank()) return emptyList()
        val q = query.trim().lowercase()
        return LOCAL_CATALOG.filter { movie ->
            val matchType = if (type == "tv") movie.type == "tv" else movie.type == "movie"
            val matchText = movie.title.lowercase().contains(q) ||
                    movie.genres.any { it.lowercase().contains(q) } ||
                    movie.synopsis.lowercase().contains(q)
            matchText && matchType
        }
    }

    fun getMovieDetails(id: Int): Movie {
        val found = LOCAL_CATALOG.find { it.id == id } ?: LOCAL_CATALOG[0]
        val similar = LOCAL_CATALOG.filter { it.id != found.id }.take(4)
        return found.copy(similar = similar)
    }

    fun getSeriesDetails(id: Int): Movie {
        val found = LOCAL_CATALOG.find { it.id == id && it.type == "tv" }
            ?: LOCAL_CATALOG.find { it.type == "tv" }
            ?: LOCAL_CATALOG[0]
        val similar = LOCAL_CATALOG.filter { it.id != found.id }.take(4)
        return found.copy(similar = similar)
    }

    fun getEpisodesForSeason(seasonNumber: Int): List<Episode> {
        return List(8) { i ->
            Episode(
                id = 500 + i,
                episodeNumber = i + 1,
                name = "Episode ${i + 1}: The Turning Point",
                overview = "A pivotal moment shifts the balance of power as unexpected secrets emerge.",
                airDate = "2024-01-15",
                runtime = 52,
                rating = 8.8f,
                stillUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80"
            )
        }
    }
}
