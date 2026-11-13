package com.jeessunny.cinemora.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.jeessunny.cinemora.data.CatalogData
import com.jeessunny.cinemora.data.PreferencesManager
import com.jeessunny.cinemora.data.RecommendationEngine
import com.jeessunny.cinemora.model.Movie
import com.jeessunny.cinemora.ui.components.HeroCard
import com.jeessunny.cinemora.ui.components.ScrollRail
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors
import java.util.Calendar

@Composable
fun HomeScreen(
    prefs: PreferencesManager,
    onMovieClick: (Movie) -> Unit,
    onAvatarClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current
    val userName by prefs.userName.collectAsState()
    val avatar by prefs.avatar.collectAsState()
    val homeSections by prefs.homeSections.collectAsState()
    val watchlist by prefs.watchlist.collectAsState()
    val favorites by prefs.favorites.collectAsState()
    val history by prefs.history.collectAsState()

    val watchlistIds = remember(watchlist) { watchlist.map { it.id }.toSet() }
    val favoriteIds = remember(favorites) { favorites.map { it.id }.toSet() }
    val historyIds = remember(history) { history.map { it.id }.toSet() }

    val (topGenres, _) = remember(history, favorites, watchlist) {
        RecommendationEngine.getRecommendationData(prefs)
    }

    val g1 = topGenres.getOrNull(0) ?: "Action"
    val g2 = topGenres.getOrNull(1) ?: "Sci-Fi"
    val g1Id = CatalogData.GENRE_NAME_TO_ID[g1] ?: 28
    val g2Id = CatalogData.GENRE_NAME_TO_ID[g2] ?: 878

    val greeting = remember {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        when {
            hour < 12 -> "Good morning"
            hour < 18 -> "Good afternoon"
            else -> "Good evening"
        }
    }

    val heroMovie = remember { CatalogData.LOCAL_CATALOG.firstOrNull() }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // Top Header
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = if (userName.isNotBlank()) userName else "Movie Lover",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = colors.textPrimary,
                        maxLines = 1
                    )
                    Text(
                        text = greeting,
                        fontSize = 14.sp,
                        color = colors.textSecondary,
                        fontWeight = FontWeight.Medium
                    )
                }

                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(avatar)
                        .crossfade(true)
                        .build(),
                    contentDescription = "Profile",
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceContainerHigh)
                        .border(1.5.dp, colors.primary, CircleShape)
                        .clickable { onAvatarClick() }
                )
            }
        }

        // Hero Card
        if (heroMovie != null) {
            item {
                Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)) {
                    HeroCard(
                        movie = heroMovie,
                        onClick = { onMovieClick(heroMovie) }
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
            }
        }

        // Dynamic Rails
        homeSections.filter { it.enabled }.forEach { section ->
            item(key = section.id) {
                when (section.id) {
                    "recommended" -> {
                        ScrollRail(
                            title = "Recommended For You",
                            movies = CatalogData.getRecommended(listOf(g1Id, g2Id)),
                            watchlistIds = watchlistIds,
                            favoriteIds = favoriteIds,
                            historyIds = historyIds,
                            onMovieClick = onMovieClick,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    "genre1" -> {
                        ScrollRail(
                            title = "Because You Like $g1",
                            movies = CatalogData.getMoviesByGenreId(g1Id),
                            watchlistIds = watchlistIds,
                            favoriteIds = favoriteIds,
                            historyIds = historyIds,
                            onMovieClick = onMovieClick,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    "genre2" -> {
                        ScrollRail(
                            title = "More $g2",
                            movies = CatalogData.getMoviesByGenreId(g2Id),
                            watchlistIds = watchlistIds,
                            favoriteIds = favoriteIds,
                            historyIds = historyIds,
                            onMovieClick = onMovieClick,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    "trending" -> {
                        ScrollRail(
                            title = "Trending Now",
                            movies = CatalogData.getTrending(),
                            watchlistIds = watchlistIds,
                            favoriteIds = favoriteIds,
                            historyIds = historyIds,
                            onMovieClick = onMovieClick,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    "popular" -> {
                        ScrollRail(
                            title = "Popular in Your Taste",
                            movies = CatalogData.getPopular(),
                            watchlistIds = watchlistIds,
                            favoriteIds = favoriteIds,
                            historyIds = historyIds,
                            onMovieClick = onMovieClick,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    "newReleases" -> {
                        ScrollRail(
                            title = "New Releases",
                            movies = CatalogData.getNewReleases(),
                            watchlistIds = watchlistIds,
                            favoriteIds = favoriteIds,
                            historyIds = historyIds,
                            onMovieClick = onMovieClick,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                }
            }
        }
    }
}
