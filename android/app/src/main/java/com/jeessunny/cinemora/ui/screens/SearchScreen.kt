package com.jeessunny.cinemora.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.DeleteSweep
import androidx.compose.material.icons.rounded.History
import androidx.compose.material.icons.rounded.SearchOff
import androidx.compose.material.icons.rounded.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jeessunny.cinemora.data.CatalogData
import com.jeessunny.cinemora.data.PreferencesManager
import com.jeessunny.cinemora.model.Movie
import com.jeessunny.cinemora.ui.components.EmptyState
import com.jeessunny.cinemora.ui.components.PosterCard
import com.jeessunny.cinemora.ui.components.SearchBar
import com.jeessunny.cinemora.ui.components.SegmentedButton
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SearchScreen(
    prefs: PreferencesManager,
    onMovieClick: (Movie) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current
    var query by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("movies") } // "movies" or "tv"

    val recentSearches by prefs.recentSearches.collectAsState()
    val watchlist by prefs.watchlist.collectAsState()
    val favorites by prefs.favorites.collectAsState()
    val history by prefs.history.collectAsState()

    val watchlistIds = remember(watchlist) { watchlist.map { it.id }.toSet() }
    val favoriteIds = remember(favorites) { favorites.map { it.id }.toSet() }
    val historyIds = remember(history) { history.map { it.id }.toSet() }

    val results = remember(query, selectedType) {
        if (query.isBlank()) emptyList()
        else CatalogData.searchMovies(query, selectedType)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .statusBarsPadding()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Search",
            fontSize = 28.sp,
            fontWeight = FontWeight.ExtraBold,
            color = colors.textPrimary
        )

        Spacer(modifier = Modifier.height(14.dp))

        SearchBar(
            query = query,
            onQueryChange = { query = it },
            placeholder = "Search movies, genres...",
            onSubmit = {
                if (query.isNotBlank()) prefs.addRecentSearch(query.trim())
            },
            onClear = { query = "" }
        )

        Spacer(modifier = Modifier.height(12.dp))

        SegmentedButton(
            options = listOf("Movies" to "movies", "TV Shows" to "tv"),
            selectedValue = selectedType,
            onSelect = { selectedType = it }
        )

        Spacer(modifier = Modifier.height(14.dp))

        if (query.isNotBlank()) {
            if (results.isEmpty()) {
                EmptyState(
                    icon = Icons.Rounded.SearchOff,
                    title = "No results found",
                    subtitle = if (selectedType == "tv")
                        "No TV shows match your search. Try switching to Movies."
                    else "Try adjusting your search to find what you're looking for.",
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 100.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(results, key = { it.id }) { movie ->
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            PosterCard(
                                movie = movie,
                                isWatchlist = watchlistIds.contains(movie.id),
                                isFavorite = favoriteIds.contains(movie.id),
                                isHistory = historyIds.contains(movie.id),
                                onClick = {
                                    prefs.addRecentSearch(query.trim())
                                    onMovieClick(movie)
                                }
                            )
                        }
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(top = 16.dp),
                horizontalAlignment = Alignment.Start
            ) {
                if (recentSearches.isNotEmpty()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.History,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = "Search History",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.textPrimary
                            )
                        }

                        // Themed Clear Button
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { prefs.clearRecentSearches() }
                                .padding(horizontal = 8.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.DeleteSweep,
                                contentDescription = "Clear History",
                                tint = colors.primary,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Clear History",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.primary
                            )
                        }
                    }

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        recentSearches.forEach { term ->
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(colors.surfaceContainerLow)
                                    .border(1.dp, colors.divider, RoundedCornerShape(8.dp))
                                    .clickable {
                                        query = term
                                        prefs.addRecentSearch(term)
                                    }
                                    .padding(start = 12.dp, end = 8.dp, top = 8.dp, bottom = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.History,
                                    contentDescription = null,
                                    tint = colors.textSecondary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = term,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = colors.textPrimary
                                )
                                Icon(
                                    imageVector = Icons.Rounded.Close,
                                    contentDescription = "Remove",
                                    tint = colors.textSecondary.copy(alpha = 0.6f),
                                    modifier = Modifier
                                        .size(16.dp)
                                        .clip(CircleShape)
                                        .clickable { prefs.removeRecentSearch(term) }
                                )
                            }
                        }
                    }
                } else {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 48.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(colors.surfaceContainerHighest),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.History,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No Search History",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Your recent searches will appear here dynamically.",
                            fontSize = 13.sp,
                            color = colors.textSecondary,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }
    }
}
