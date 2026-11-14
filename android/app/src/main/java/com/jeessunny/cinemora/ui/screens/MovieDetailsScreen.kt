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
fun MovieDetailsScreen(
    movieId: Int,
    prefs: PreferencesManager,
    onBack: () -> Unit,
    onMovieClick: (Movie) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val colors = LocalCinemoraColors.current
    val movie = remember(movieId) { CatalogData.getMovieDetails(movieId) }

    val watchlist by prefs.watchlist.collectAsState()
    val favorites by prefs.favorites.collectAsState()
    val history by prefs.history.collectAsState()

    val isWatchlist = watchlist.any { it.id == movie.id }
    val isFavorite = favorites.any { it.id == movie.id }
    val isHistory = history.any { it.id == movie.id }

    val watchlistIds = remember(watchlist) { watchlist.map { it.id }.toSet() }
    val favoriteIds = remember(favorites) { favorites.map { it.id }.toSet() }
    val historyIds = remember(history) { history.map { it.id }.toSet() }

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
                        .data(movie.backdropUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = movie.title,
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
                        .data(movie.posterUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = movie.title,
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
                        text = movie.title,
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
                                text = "${movie.rating}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                        }

                        Text(text = "•", color = colors.textSecondary)
                        Text(text = "${movie.year}", fontSize = 13.sp, color = colors.textSecondary)
                        Text(text = "•", color = colors.textSecondary)
                        Text(text = movie.runtime, fontSize = 13.sp, color = colors.textSecondary)
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Genres
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(movie.genres) { genre ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(colors.surfaceContainerHigh)
                                    .border(1.dp, colors.divider, RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = genre,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = colors.textPrimary
                                )
                            }
                        }
                    }
                }
            }
        }

        // Action Buttons Row (Watched, Favorite, Watchlist, Share matching OG)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                ActionButton(
                    icon = if (isHistory) Icons.Filled.CheckCircle else Icons.Outlined.CheckCircleOutline,
                    label = "Watched",
                    active = isHistory,
                    activeColor = Color(0xFF46D369),
                    onClick = { prefs.toggleHistory(movie) }
                )

                ActionButton(
                    icon = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                    label = "Favorite",
                    active = isFavorite,
                    activeColor = Color(0xFFE50914),
                    onClick = { prefs.toggleFavorite(movie) }
                )

                ActionButton(
                    icon = if (isWatchlist) Icons.Rounded.Bookmark else Icons.Outlined.BookmarkBorder,
                    label = "Watchlist",
                    active = isWatchlist,
                    activeColor = colors.primary,
                    onClick = { prefs.toggleWatchlist(movie) }
                )

                ActionButton(
                    icon = Icons.Rounded.Share,
                    label = "Share",
                    active = false,
                    activeColor = colors.textSecondary,
                    onClick = {
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_SUBJECT, movie.title)
                            putExtra(Intent.EXTRA_TEXT, "Check out ${movie.title} on Cinemora!")
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Share Movie"))
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Synopsis
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "Synopsis",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = movie.synopsis,
                    fontSize = 13.sp,
                    color = colors.textSecondary,
                    lineHeight = 20.sp
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Cast Rail
        if (movie.cast.isNotEmpty()) {
            item {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Cast",
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
                        items(movie.cast) { member ->
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.width(90.dp)
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
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = member.name,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = member.character,
                                    fontSize = 11.sp,
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

        // Similar Movies
        if (movie.similar.isNotEmpty()) {
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
                        items(movie.similar) { sim ->
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
private fun ActionButton(
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
