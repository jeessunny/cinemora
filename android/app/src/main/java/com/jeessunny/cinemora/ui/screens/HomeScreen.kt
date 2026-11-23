package com.jeessunny.cinemora.ui.screens

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
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
    scrollToTopTrigger: Int = 0,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current
    val listState = rememberLazyListState()

    LaunchedEffect(scrollToTopTrigger) {
        if (scrollToTopTrigger > 0) {
            listState.animateScrollToItem(0)
        }
    }

    val userName by prefs.userName.collectAsState()
    val avatar by prefs.avatar.collectAsState()
    val homeSections by prefs.homeSections.collectAsState()
    val disableSeries by prefs.disableSeries.collectAsState()
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

    val heroItems = remember(disableSeries) { CatalogData.getHeroItems(allowSeries = !disableSeries) }
    val heroPagerState = rememberPagerState(pageCount = { heroItems.size })
    val activeSections = remember(homeSections, disableSeries) {
        homeSections.filter { it.enabled && (!disableSeries || (it.id != "trendingSeries" && it.id != "popularSeries")) }
    }
    val railAnimSpec = remember { spring<androidx.compose.ui.unit.IntOffset>(dampingRatio = 0.8f, stiffness = 400f) }

    LazyColumn(
        state = listState,
        modifier = modifier
            .fillMaxSize()
            .background(colors.background),
        contentPadding = PaddingValues(bottom = 100.dp)
    ) {
        // Top Header
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 16.dp)
                ) {
                    Text(
                        text = if (userName.isNotBlank()) userName else "Movie Lover",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = colors.textPrimary,
                        lineHeight = 32.sp,
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = greeting,
                        fontSize = 16.sp,
                        color = colors.textSecondary,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                val avatarUrl = if (avatar.isNotBlank()) avatar else "https://api.dicebear.com/7.x/avataaars/png?seed=${if (userName.isNotBlank()) userName else "MovieLover"}"
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(avatarUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = "Profile",
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceContainerHigh)
                        .clickable { onAvatarClick() }
                )
            }
        }

        // Hero Card Pager (features both movies and series when enabled)
        if (heroItems.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp, bottom = 12.dp)
                ) {
                    HorizontalPager(
                        state = heroPagerState,
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        pageSpacing = 12.dp,
                        modifier = Modifier.fillMaxWidth()
                    ) { page ->
                        val item = heroItems[page]
                        HeroCard(
                            movie = item,
                            onClick = { onMovieClick(item) }
                        )
                    }

                    if (heroItems.size > 1) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            repeat(heroItems.size) { index ->
                                val isSelected = heroPagerState.currentPage == index
                                val indicatorWidth by animateDpAsState(
                                    targetValue = if (isSelected) 22.dp else 6.dp,
                                    label = "hero_dot_w"
                                )
                                val indicatorColor by animateColorAsState(
                                    targetValue = if (isSelected) colors.primary else colors.divider,
                                    label = "hero_dot_c"
                                )
                                Box(
                                    modifier = Modifier
                                        .padding(horizontal = 3.dp)
                                        .height(6.dp)
                                        .width(indicatorWidth)
                                        .clip(CircleShape)
                                        .background(indicatorColor)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Dynamic Rails (Strict separation: movie rails only movies, series rails only series)
        activeSections.forEach { section ->
            item(key = section.id) {
                Box(
                    modifier = Modifier
                        .animateItemPlacement(railAnimSpec)
                        .padding(vertical = 10.dp)
                ) {
                    when (section.id) {
                        "trending" -> {
                            ScrollRail(
                                title = "Trending Movies",
                                movies = CatalogData.getTrendingMovies(),
                                watchlistIds = watchlistIds,
                                favoriteIds = favoriteIds,
                                historyIds = historyIds,
                                onMovieClick = onMovieClick
                            )
                        }
                        "trendingSeries" -> {
                            if (!disableSeries) {
                                ScrollRail(
                                    title = "Trending Series",
                                    movies = CatalogData.getTrendingSeries(),
                                    watchlistIds = watchlistIds,
                                    favoriteIds = favoriteIds,
                                    historyIds = historyIds,
                                    onMovieClick = onMovieClick
                                )
                            }
                        }
                        "popular" -> {
                            ScrollRail(
                                title = "Popular Movies",
                                movies = CatalogData.getPopularMovies(),
                                watchlistIds = watchlistIds,
                                favoriteIds = favoriteIds,
                                historyIds = historyIds,
                                onMovieClick = onMovieClick
                            )
                        }
                        "popularSeries" -> {
                            if (!disableSeries) {
                                ScrollRail(
                                    title = "Popular Series",
                                    movies = CatalogData.getPopularSeries(),
                                    watchlistIds = watchlistIds,
                                    favoriteIds = favoriteIds,
                                    historyIds = historyIds,
                                    onMovieClick = onMovieClick
                                )
                            }
                        }
                        "recommended" -> {
                            ScrollRail(
                                title = "Recommended Movies",
                                movies = CatalogData.getRecommended(listOf(g1Id, g2Id), allowSeries = false),
                                watchlistIds = watchlistIds,
                                favoriteIds = favoriteIds,
                                historyIds = historyIds,
                                onMovieClick = onMovieClick
                            )
                        }
                        "genre1" -> {
                            ScrollRail(
                                title = "Because You Like $g1",
                                movies = CatalogData.getMoviesByGenreId(g1Id, allowSeries = false),
                                watchlistIds = watchlistIds,
                                favoriteIds = favoriteIds,
                                historyIds = historyIds,
                                onMovieClick = onMovieClick
                            )
                        }
                        "newReleases" -> {
                            ScrollRail(
                                title = "New Movie Releases",
                                movies = CatalogData.getNewReleaseMovies(),
                                watchlistIds = watchlistIds,
                                favoriteIds = favoriteIds,
                                historyIds = historyIds,
                                onMovieClick = onMovieClick
                            )
                        }
                        "genre2" -> {
                            ScrollRail(
                                title = "More $g2",
                                movies = CatalogData.getMoviesByGenreId(g2Id, allowSeries = false),
                                watchlistIds = watchlistIds,
                                favoriteIds = favoriteIds,
                                historyIds = historyIds,
                                onMovieClick = onMovieClick
                            )
                        }
                    }
                }
            }
        }
    }
}
