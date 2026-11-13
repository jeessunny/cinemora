package com.jeessunny.cinemora.ui.screens

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.CheckCircleOutline
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Bookmark
import androidx.compose.material.icons.rounded.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.jeessunny.cinemora.data.CatalogData
import com.jeessunny.cinemora.data.PreferencesManager
import com.jeessunny.cinemora.model.Movie
import com.jeessunny.cinemora.ui.components.PosterCard
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors

@Composable
fun SeriesDetailsScreen(
    seriesId: Int,
    prefs: PreferencesManager,
    onBack: () -> Unit,
    onMovieClick: (Movie) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val colors = LocalCinemoraColors.current
    val series = remember(seriesId) { CatalogData.getSeriesDetails(seriesId) }

    val watchlist by prefs.watchlist.collectAsState()
    val favorites by prefs.favorites.collectAsState()
    val history by prefs.history.collectAsState()

    val isWatchlist = watchlist.any { it.id == series.id }
    val isFavorite = favorites.any { it.id == series.id }
    val isHistory = history.any { it.id == series.id }

    val watchlistIds = remember(watchlist) { watchlist.map { it.id }.toSet() }
    val favoriteIds = remember(favorites) { favorites.map { it.id }.toSet() }
    val historyIds = remember(history) { history.map { it.id }.toSet() }

    var selectedSeasonNumber by remember { mutableStateOf(1) }
    val episodes = remember(selectedSeasonNumber) {
        CatalogData.getEpisodesForSeason(selectedSeasonNumber)
    }

    val scrimColor = when {
        colors.isPitchBlack -> Color(0xFF000000)
        colors.isDark -> Color(0xFF0F0D0D)
        else -> Color(0xFFFFFFFF)
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        // Backdrop Image & Scrim
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(340.dp)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(series.backdropUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = series.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                // Back Button
                Box(
                    modifier = Modifier
                        .statusBarsPadding()
                        .padding(16.dp)
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color(0x99000000))
                        .clickable { onBack() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Dynamic Gradient Scrim
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .align(Alignment.BottomCenter)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    scrimColor.copy(alpha = 0.65f),
                                    scrimColor
                                )
                            )
                        )
                )
            }
        }

        // Poster + Title + Meta Section
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .offset(y = (-40).dp)
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(series.posterUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = series.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .width(120.dp)
                        .height(180.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, colors.divider, RoundedCornerShape(12.dp))
                )

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(top = 48.dp)
                ) {
                    Text(
                        text = series.title,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = colors.textPrimary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.Star,
                                contentDescription = null,
                                tint = Color(0xFFFFC107),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Text(
                                text = "${series.rating}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                        }

                        Text(text = "•", color = colors.textSecondary)
                        Text(text = "${series.year}", fontSize = 13.sp, color = colors.textSecondary)
                        Text(text = "•", color = colors.textSecondary)
                        Text(text = "${series.numberOfSeasons ?: 2} Seasons", fontSize = 13.sp, color = colors.textSecondary)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    if (series.status != null) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Color(0xFF46D369).copy(alpha = 0.2f))
                                .border(1.dp, Color(0xFF46D369), RoundedCornerShape(4.dp))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = series.status,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF46D369)
                            )
                        }
                    }
                }
            }
        }

        // Action Buttons Row (Watchlist, Favorite, Watched, Share)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SeriesActionButton(
                    icon = if (isWatchlist) Icons.Rounded.Bookmark else Icons.Outlined.BookmarkBorder,
                    label = if (isWatchlist) "Added" else "Watchlist",
                    active = isWatchlist,
                    activeColor = colors.primary,
                    onClick = { prefs.toggleWatchlist(series) }
                )

                SeriesActionButton(
                    icon = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                    label = if (isFavorite) "Liked" else "Favorite",
                    active = isFavorite,
                    activeColor = Color(0xFFE50914),
                    onClick = { prefs.toggleFavorite(series) }
                )

                SeriesActionButton(
                    icon = if (isHistory) Icons.Filled.CheckCircle else Icons.Outlined.CheckCircleOutline,
                    label = if (isHistory) "Watched" else "Mark Seen",
                    active = isHistory,
                    activeColor = Color(0xFF46D369),
                    onClick = { prefs.toggleHistory(series) }
                )

                SeriesActionButton(
                    icon = Icons.Rounded.Share,
                    label = "Share",
                    active = false,
                    activeColor = colors.primary,
                    onClick = {
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_SUBJECT, series.title)
                            putExtra(Intent.EXTRA_TEXT, "Check out ${series.title} on Cinemora!")
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Share Series"))
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Synopsis
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "Storyline",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = series.synopsis,
                    fontSize = 13.sp,
                    color = colors.textSecondary,
                    lineHeight = 20.sp
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Seasons Tab Selector
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Episodes",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                val seasons = series.seasons ?: listOf(
                    com.jeessunny.cinemora.model.Season(1, 1, "Season 1", 8, "2023-09-10"),
                    com.jeessunny.cinemora.model.Season(2, 2, "Season 2", 8, "2024-04-12")
                )

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(seasons) { season ->
                        val selected = selectedSeasonNumber == season.seasonNumber
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (selected) colors.primary else colors.surfaceContainerLow)
                                .border(
                                    1.dp,
                                    if (selected) colors.primary else colors.divider,
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable { selectedSeasonNumber = season.seasonNumber }
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = season.name,
                                fontSize = 12.sp,
                                fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                                color = if (selected) Color.White else colors.textPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))
            }
        }

        // Episodes List
        items(episodes, key = { it.id }) { ep ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(colors.surfaceContainerLow)
                    .border(1.dp, colors.divider, RoundedCornerShape(10.dp))
                    .padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(ep.stillUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = ep.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .width(90.dp)
                        .height(60.dp)
                        .clip(RoundedCornerShape(6.dp))
                )

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "E${ep.episodeNumber}: ${ep.name}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${ep.runtime}m • Rating ${ep.rating}",
                        fontSize = 11.sp,
                        color = colors.textSecondary
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = ep.overview,
                        fontSize = 11.sp,
                        color = colors.textSecondary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Cast Rail
        if (series.cast.isNotEmpty()) {
            item {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Top Cast",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        items(series.cast) { member ->
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.width(80.dp)
                            ) {
                                AsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(member.photoUrl)
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = member.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(64.dp)
                                        .clip(CircleShape)
                                        .background(colors.surfaceContainerHigh)
                                        .border(1.dp, colors.divider, CircleShape)
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = member.name,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = member.character,
                                    fontSize = 10.sp,
                                    color = colors.textSecondary,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }

        // Similar Series
        if (series.similar.isNotEmpty()) {
            item {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "More Like This",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(series.similar) { sim ->
                            PosterCard(
                                movie = sim,
                                isWatchlist = watchlistIds.contains(sim.id),
                                isFavorite = favoriteIds.contains(sim.id),
                                isHistory = historyIds.contains(sim.id),
                                onClick = { onMovieClick(sim) }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(48.dp))
            }
        }
    }
}

@Composable
private fun SeriesActionButton(
    icon: ImageVector,
    label: String,
    active: Boolean,
    activeColor: Color,
    onClick: () -> Unit
) {
    val colors = LocalCinemoraColors.current
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(8.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = if (active) activeColor else colors.textSecondary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = if (active) FontWeight.Bold else FontWeight.Medium,
            color = if (active) activeColor else colors.textSecondary
        )
    }
}
