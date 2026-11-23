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
            runtime = "2 Seasons",
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
        ),
        Movie(
            id = 201,
            type = "tv",
            title = "Stranger Shadows",
            year = 2024,
            rating = 9.2f,
            runtime = "4 Seasons",
            genres = listOf("Sci-Fi", "Drama", "Mystery"),
            genreIds = listOf(878, 18, 9648),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
            synopsis = "When a young boy vanishes from a tranquil Midwestern town, a secret laboratory and alternate dimension tear open secrets buried deep beneath the town.",
            matchPercentage = 98,
            numberOfSeasons = 4,
            numberOfEpisodes = 34,
            status = "Returning Series",
            networks = listOf("Netflix"),
            seasons = listOf(
                Season(101, 1, "Season 1", 8, "2021-07-15"),
                Season(102, 2, "Season 2", 9, "2022-10-27"),
                Season(103, 3, "Season 3", 8, "2023-07-04"),
                Season(104, 4, "Season 4", 9, "2024-05-27")
            ),
            cast = listOf(
                CastMember("Millie Brown", "Eleven", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"),
                CastMember("David Harbour", "Jim Hopper", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80")
            )
        ),
        Movie(
            id = 202,
            type = "tv",
            title = "Breaking Bad: Chemist's Fall",
            year = 2023,
            rating = 9.5f,
            runtime = "5 Seasons",
            genres = listOf("Crime", "Drama", "Thriller"),
            genreIds = listOf(80, 18, 53),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
            synopsis = "A high school chemistry teacher diagnosed with terminal lung cancer transforms into a ruthless empire mastermind to secure his family's financial future.",
            matchPercentage = 99,
            numberOfSeasons = 5,
            numberOfEpisodes = 62,
            status = "Ended",
            networks = listOf("AMC"),
            seasons = listOf(
                Season(201, 1, "Season 1", 7, "2019-01-20"),
                Season(202, 2, "Season 2", 13, "2020-03-08"),
                Season(203, 3, "Season 3", 13, "2021-03-21"),
                Season(204, 4, "Season 4", 13, "2022-07-17"),
                Season(205, 5, "Season 5", 16, "2023-08-11")
            ),
            cast = listOf(
                CastMember("Bryan Cranston", "Walter White", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"),
                CastMember("Aaron Paul", "Jesse Pinkman", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80")
            )
        ),
        Movie(
            id = 203,
            type = "tv",
            title = "The Last Frontier",
            year = 2024,
            rating = 9.2f,
            runtime = "2 Seasons",
            genres = listOf("Action", "Adventure", "Drama"),
            genreIds = listOf(28, 12, 18),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
            synopsis = "Twenty years after modern civilization was destroyed, a hardened survivor is hired to smuggle a 14-year-old girl out of an oppressive quarantine zone.",
            matchPercentage = 97,
            numberOfSeasons = 2,
            numberOfEpisodes = 18,
            status = "Returning Series",
            networks = listOf("HBO"),
            seasons = listOf(
                Season(301, 1, "Season 1", 9, "2023-01-15"),
                Season(302, 2, "Season 2", 9, "2024-04-20")
            ),
            cast = listOf(
                CastMember("Pedro Pascal", "Joel", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"),
                CastMember("Bella Ramsey", "Ellie", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80")
            )
        ),
        Movie(
            id = 204,
            type = "tv",
            title = "Dynasty of Silicon",
            year = 2024,
            rating = 8.9f,
            runtime = "4 Seasons",
            genres = listOf("Drama"),
            genreIds = listOf(18),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
            synopsis = "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world will change when their aging father steps down.",
            matchPercentage = 95,
            numberOfSeasons = 4,
            numberOfEpisodes = 39,
            status = "Ended",
            networks = listOf("HBO"),
            seasons = listOf(
                Season(401, 1, "Season 1", 10, "2021-06-03"),
                Season(402, 2, "Season 2", 10, "2022-08-11"),
                Season(403, 3, "Season 3", 9, "2023-10-17"),
                Season(404, 4, "Season 4", 10, "2024-03-26")
            ),
            cast = listOf(
                CastMember("Brian Cox", "Logan Roy", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"),
                CastMember("Jeremy Strong", "Kendall Roy", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80")
            )
        ),
        Movie(
            id = 205,
            type = "tv",
            title = "Severance: Lumon Files",
            year = 2024,
            rating = 9.3f,
            runtime = "2 Seasons",
            genres = listOf("Sci-Fi", "Mystery", "Thriller"),
            genreIds = listOf(878, 9648, 53),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1200&q=80",
            synopsis = "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives until a mysterious colleague reveals the dark truth.",
            matchPercentage = 98,
            numberOfSeasons = 2,
            numberOfEpisodes = 19,
            status = "Returning Series",
            networks = listOf("Apple TV+"),
            seasons = listOf(
                Season(501, 1, "Season 1", 9, "2023-02-18"),
                Season(502, 2, "Season 2", 10, "2024-06-12")
            ),
            cast = listOf(
                CastMember("Adam Scott", "Mark Scout", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"),
                CastMember("Patricia Arquette", "Harmony Cobel", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80")
            )
        ),
        Movie(
            id = 206,
            type = "tv",
            title = "Dark: Cycles of Winden",
            year = 2023,
            rating = 9.3f,
            runtime = "3 Seasons",
            genres = listOf("Sci-Fi", "Mystery", "Drama"),
            genreIds = listOf(878, 9648, 18),
            originalLanguage = "de",
            posterUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80",
            synopsis = "A family saga with a supernatural twist set in a German town, where the disappearance of two young children exposes relationships across three generations.",
            matchPercentage = 96,
            numberOfSeasons = 3,
            numberOfEpisodes = 26,
            status = "Ended",
            networks = listOf("Netflix"),
            seasons = listOf(
                Season(601, 1, "Season 1", 10, "2021-12-01"),
                Season(602, 2, "Season 2", 8, "2022-06-21"),
                Season(603, 3, "Season 3", 8, "2023-06-27")
            ),
            cast = listOf(
                CastMember("Louis Hofmann", "Jonas Kahnwald", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80")
            )
        ),
        Movie(
            id = 207,
            type = "tv",
            title = "Arcane: Twin Cities",
            year = 2024,
            rating = 9.4f,
            runtime = "2 Seasons",
            genres = listOf("Animation", "Action", "Fantasy"),
            genreIds = listOf(16, 28, 14),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
            synopsis = "Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic champions and the power that tears them apart.",
            matchPercentage = 99,
            numberOfSeasons = 2,
            numberOfEpisodes = 18,
            status = "Ended",
            networks = listOf("Netflix"),
            seasons = listOf(
                Season(701, 1, "Season 1", 9, "2022-11-06"),
                Season(702, 2, "Season 2", 9, "2024-11-09")
            ),
            cast = listOf(
                CastMember("Hailee Steinfeld", "Vi", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"),
                CastMember("Ella Purnell", "Jinx", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80")
            )
        ),
        Movie(
            id = 208,
            type = "tv",
            title = "Peaky Syndicate",
            year = 2023,
            rating = 9.0f,
            runtime = "6 Seasons",
            genres = listOf("Crime", "Drama", "History"),
            genreIds = listOf(80, 18, 36),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
            synopsis = "An epic gangster family saga set in Birmingham, England, centered on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby.",
            matchPercentage = 95,
            numberOfSeasons = 6,
            numberOfEpisodes = 36,
            status = "Ended",
            networks = listOf("BBC"),
            seasons = listOf(
                Season(801, 1, "Season 1", 6, "2018-09-12"),
                Season(802, 2, "Season 2", 6, "2019-10-02"),
                Season(803, 3, "Season 3", 6, "2020-05-05"),
                Season(804, 4, "Season 4", 6, "2021-11-15"),
                Season(805, 5, "Season 5", 6, "2022-08-25"),
                Season(806, 6, "Season 6", 6, "2023-02-27")
            ),
            cast = listOf(
                CastMember("Cillian Murphy", "Thomas Shelby", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"),
                CastMember("Paul Anderson", "Arthur Shelby", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80")
            )
        ),
        Movie(
            id = 209,
            type = "tv",
            title = "The Culinary Order",
            year = 2024,
            rating = 8.9f,
            runtime = "3 Seasons",
            genres = listOf("Drama", "Comedy"),
            genreIds = listOf(18, 35),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80",
            synopsis = "A young fine-dining chef comes home to Chicago to run his family Italian beef sandwich shop after a heartbreaking death, battling kitchen chaos and personal trauma.",
            matchPercentage = 94,
            numberOfSeasons = 3,
            numberOfEpisodes = 28,
            status = "Returning Series",
            networks = listOf("FX"),
            seasons = listOf(
                Season(901, 1, "Season 1", 8, "2022-06-23"),
                Season(902, 2, "Season 2", 10, "2023-06-22"),
                Season(903, 3, "Season 3", 10, "2024-06-27")
            ),
            cast = listOf(
                CastMember("Jeremy Allen White", "Carmy", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"),
                CastMember("Ayo Edebiri", "Sydney", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80")
            )
        ),
        Movie(
            id = 210,
            type = "tv",
            title = "Chernobyl: Hour Zero",
            year = 2023,
            rating = 9.4f,
            runtime = "1 Season",
            genres = listOf("Drama", "History", "Thriller"),
            genreIds = listOf(18, 36, 53),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
            synopsis = "In April 1986, an explosion at the Chernobyl nuclear power plant becomes one of the world's worst man-made catastrophes, telling the untold stories of heroic sacrifices.",
            matchPercentage = 98,
            numberOfSeasons = 1,
            numberOfEpisodes = 5,
            status = "Miniseries",
            networks = listOf("HBO"),
            seasons = listOf(
                Season(1001, 1, "Miniseries", 5, "2023-05-06")
            ),
            cast = listOf(
                CastMember("Jared Harris", "Valery Legasov", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"),
                CastMember("Stellan Skarsgård", "Boris Shcherbina", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80")
            )
        ),
        Movie(
            id = 211,
            type = "tv",
            title = "Better Call Saul: Albuquerque Law",
            year = 2023,
            rating = 9.1f,
            runtime = "6 Seasons",
            genres = listOf("Crime", "Drama"),
            genreIds = listOf(80, 18),
            originalLanguage = "en",
            posterUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
            backdropUrl = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
            synopsis = "The trials and tribulations of criminal defense attorney Jimmy McGill in the years prior to his fateful encounter with Walter White.",
            matchPercentage = 96,
            numberOfSeasons = 6,
            numberOfEpisodes = 63,
            status = "Ended",
            networks = listOf("AMC"),
            seasons = listOf(
                Season(1101, 1, "Season 1", 10, "2018-02-08"),
                Season(1102, 2, "Season 2", 10, "2019-02-15"),
                Season(1103, 3, "Season 3", 10, "2020-04-10"),
                Season(1104, 4, "Season 4", 10, "2021-08-06"),
                Season(1105, 5, "Season 5", 10, "2022-02-23"),
                Season(1106, 6, "Season 6", 13, "2023-04-18")
            ),
            cast = listOf(
                CastMember("Bob Odenkirk", "Jimmy McGill", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"),
                CastMember("Rhea Seehorn", "Kim Wexler", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80")
            )
        )
    )

    fun getMoviesOnly(): List<Movie> = LOCAL_CATALOG.filter { it.type == "movie" }

    fun getSeries(): List<Movie> = LOCAL_CATALOG.filter { it.type == "tv" }

    fun getTrendingSeries(): List<Movie> = getSeries()

    fun getPopularSeries(): List<Movie> = getSeries().sortedByDescending { it.rating }

    fun getTrendingMovies(): List<Movie> = getMoviesOnly()

    fun getPopularMovies(): List<Movie> = getMoviesOnly().sortedByDescending { it.rating }

    fun getNewReleaseMovies(): List<Movie> = getMoviesOnly().reversed()

    fun getTrending(allowSeries: Boolean = true): List<Movie> =
        if (allowSeries) LOCAL_CATALOG else getMoviesOnly()

    fun getNewReleases(allowSeries: Boolean = true): List<Movie> =
        if (allowSeries) LOCAL_CATALOG.reversed() else getNewReleaseMovies()

    fun getPopular(allowSeries: Boolean = true): List<Movie> =
        if (allowSeries) LOCAL_CATALOG.sortedByDescending { it.rating } else getPopularMovies()

    fun getRecommended(genreIds: List<Int>, allowSeries: Boolean = true): List<Movie> {
        val base = if (allowSeries) LOCAL_CATALOG else getMoviesOnly()
        if (genreIds.isEmpty()) return base
        val filtered = base.filter { movie ->
            movie.genreIds.any { gid -> genreIds.contains(gid) }
        }
        return if (filtered.isNotEmpty()) filtered else base
    }

    fun getMoviesByGenreId(genreId: Int, allowSeries: Boolean = true): List<Movie> {
        val base = if (allowSeries) LOCAL_CATALOG else getMoviesOnly()
        val filtered = base.filter { it.genreIds.contains(genreId) }
        return if (filtered.isNotEmpty()) filtered else base
    }

    fun getHeroItem(allowSeries: Boolean = true): Movie? {
        val items = getHeroItems(allowSeries)
        return items.firstOrNull()
    }

    fun getHeroItems(allowSeries: Boolean = true): List<Movie> {
        val movies = getMoviesOnly()
        if (!allowSeries) return movies.take(5)

        val series = getSeries()
        val combined = mutableListOf<Movie>()
        val topMovies = movies.take(3)
        val topSeries = series.take(3)
        val maxLen = maxOf(topMovies.size, topSeries.size)
        for (i in 0 until maxLen) {
            if (i < topMovies.size) combined.add(topMovies[i])
            if (i < topSeries.size) combined.add(topSeries[i])
        }
        return combined
    }

    fun searchMovies(query: String, type: String = "movies"): List<Movie> {
        if (query.isBlank()) return emptyList()
        val q = query.trim().lowercase()
        return LOCAL_CATALOG.filter { movie ->
            val matchType = when (type) {
                "tv" -> movie.type == "tv"
                "all" -> true
                else -> movie.type == "movie"
            }
            val matchText = movie.title.lowercase().contains(q) ||
                    movie.genres.any { it.lowercase().contains(q) } ||
                    movie.synopsis.lowercase().contains(q)
            matchText && matchType
        }
    }

    fun getMovieDetails(id: Int): Movie {
        val found = LOCAL_CATALOG.find { it.id == id && it.type == "movie" }
            ?: LOCAL_CATALOG.find { it.type == "movie" }
            ?: LOCAL_CATALOG[0]
        val similar = LOCAL_CATALOG.filter { it.id != found.id && it.type == "movie" }.take(6)
        return found.copy(similar = similar)
    }

    fun getSeriesDetails(id: Int): Movie {
        val found = LOCAL_CATALOG.find { it.id == id && it.type == "tv" }
            ?: LOCAL_CATALOG.find { it.type == "tv" }
            ?: LOCAL_CATALOG[0]
        val similar = LOCAL_CATALOG.filter { it.id != found.id && it.type == "tv" }.take(6)
        return found.copy(similar = similar)
    }

    fun getEpisodesForSeason(seriesId: Int, seasonNumber: Int): List<Episode> {
        val series = LOCAL_CATALOG.find { it.id == seriesId }
        val season = series?.seasons?.find { it.seasonNumber == seasonNumber }
        val count = season?.episodeCount ?: 8
        val baseYear = series?.year ?: 2024
        val seasonYear = baseYear - ((series?.numberOfSeasons ?: 1) - seasonNumber).coerceAtLeast(0)

        val season1Titles = listOf(
            "Pilot: Genesis", "Point of Divergence", "Shadow Protocol",
            "Threshold of Doubt", "The Blind Spot", "Fallen Vectors",
            "Critical Mass", "The Singularity", "Aftershocks", "Zero Point"
        )
        val season2Titles = listOf(
            "The Aftermath", "Fragmented Memory", "Architects of Deceit",
            "Ghosts in the Grid", "Zero-Day Vulnerability", "Subterranean Whispers",
            "The Quorum Falls", "Convergence", "Fallout", "New Horizon"
        )
        val season3Titles = listOf(
            "New World Order", "The Defector", "Fractured Realities",
            "Echo Chamber", "A King's Ransom", "Counter-Offensive",
            "Ashes of the Past", "Resurrection", "Retaliation", "Checkmate"
        )
        val season4Titles = listOf(
            "Ascension", "Sins of the Fathers", "The Long March",
            "Dark Horizon", "Retribution", "Sanctuary",
            "The Reckoning", "Finality", "Collateral", "Redemption"
        )
        val season5Titles = listOf(
            "Blood Money", "The Empire Business", "Say My Name",
            "Gliding Over All", "To'hajiilee", "Ozymandias",
            "Granite State", "Felina", "Live Free or Die", "Madrigal"
        )
        val season6Titles = listOf(
            "Wine and Roses", "Carrot and Stick", "Rock and Hard Place",
            "Hit and Run", "Black and Blue", "Plan and Execution",
            "Point and Shoot", "Saul Gone", "Nippy", "Waterworks"
        )

        val titles = when (seasonNumber) {
            1 -> season1Titles
            2 -> season2Titles
            3 -> season3Titles
            4 -> season4Titles
            5 -> season5Titles
            6 -> season6Titles
            else -> season2Titles
        }

        val overviews = when (seasonNumber) {
            1 -> listOf(
                "An unexpected discovery sets events in motion as secrets from the past threaten the present.",
                "Tensions rise within the inner circle when a routine operation takes a perilous turn.",
                "An unlikely ally offers critical intelligence, leading down a dangerous rabbit hole.",
                "A confrontation forces tough choices that test loyalty and moral boundaries.",
                "Crucial revelations surface, shifting alliances and setting up a dangerous gamble.",
                "The stakes escalate drastically as hidden enemies step out into the open.",
                "A daring counter-strike is launched with everything hanging in the balance.",
                "A dramatic showdown leaves enduring consequences that will alter the future forever."
            )
            2 -> listOf(
                "In the wake of recent catastrophe, a fragmented syndicate struggles to rebuild.",
                "New evidence exposes deep-seated deception reaching into the upper echelon.",
                "A desperate race against time begins when an operative disappears without a trace.",
                "A high-stakes encounter at an isolated summit uncovers a devastating betrayal.",
                "Power dynamics shift unexpectedly as an ambitious rival makes their move.",
                "A fragile truce is threatened by an explosive truth buried for a decade.",
                "Backs against the wall, extreme measures become the only viable option.",
                "The season reaches a heart-stopping climax where sacrifices must be made."
            )
            3 -> listOf(
                "Rising from the ashes, a new chapter begins with higher stakes and deadlier adversaries.",
                "Secrets from across the border trigger an international crisis.",
                "Old grudges resurface as former comrades find themselves on opposite sides.",
                "A covert extraction mission encounters catastrophic complications.",
                "The psychological toll takes center stage as trusted bonds begin to splinter.",
                "A strategic chess move corners their enemies, but at a tremendous price.",
                "The countdown begins to a point of no return for all involved.",
                "An unforgettable turning point shatters expectations and alters every destiny."
            )
            else -> listOf(
                "The conflict reaches fever pitch as all lingering accounts must be settled.",
                "Hidden motives are finally laid bare in a tense confrontation.",
                "A desperate gambit turns the tide when defeat seemed all but certain.",
                "A sacrifice is demanded to preserve what remains of the inner circle.",
                "The final pieces fall into place as judgment day arrives.",
                "All paths converge in a momentous finale that defines their legacy."
            )
        }

        val stills = listOf(
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
            "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1200&q=80",
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80"
        )

        return List(count) { i ->
            val epNum = i + 1
            val titleName = titles.getOrElse(i) { "Episode $epNum: The Reckoning" }
            val epOverview = overviews.getOrElse(i % overviews.size) { "Key events unfold with lasting consequences." }
            val still = stills[(i + seasonNumber) % stills.size]
            val runtime = 46 + ((i * 3 + seasonNumber * 2) % 18)
            val rating = 8.4f + (((i * 7 + seasonNumber * 3) % 14) / 10f)

            Episode(
                id = (seriesId * 1000) + (seasonNumber * 100) + epNum,
                episodeNumber = epNum,
                name = "S${seasonNumber}E${epNum}: $titleName",
                overview = epOverview,
                airDate = "$seasonYear-${(seasonNumber * 2 + i / 4).coerceIn(1, 12).toString().padStart(2, '0')}-${((i * 3 + 4) % 28 + 1).toString().padStart(2, '0')}",
                runtime = runtime,
                rating = ((rating * 10).toInt() / 10f).coerceIn(8.0f, 9.9f),
                stillUrl = still
            )
        }
    }

    fun getEpisodesForSeason(seasonNumber: Int): List<Episode> = getEpisodesForSeason(107, seasonNumber)
}
