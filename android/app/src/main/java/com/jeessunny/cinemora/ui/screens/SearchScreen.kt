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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Recent Searches
                if (recentSearches.isNotEmpty()) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    ) {
                        Text(
                            text = "Recent Searches",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = colors.textPrimary,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Clear All",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary,
                            modifier = Modifier.clickable { prefs.clearRecentSearches() }
                        )
                    }

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 24.dp)
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
                                    .padding(horizontal = 14.dp, vertical = 9.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.History,
                                    contentDescription = null,
                                    tint = colors.textSecondary,
                                    modifier = Modifier.size(17.dp)
                                )
                                Text(
                                    text = term,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = colors.textPrimary
                                )
                            }
                        }
                    }
                }

                // Popular Searches (Centered Title & Centered FlowRow of Chips matching OG)
                Text(
                    text = "Popular Searches",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.textPrimary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                )

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    CatalogData.POPULAR_SEARCHES.forEach { term ->
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(colors.surfaceContainerLow)
                                .border(1.dp, colors.divider, RoundedCornerShape(8.dp))
                                .clickable {
                                    query = term
                                    prefs.addRecentSearch(term)
                                }
                                .padding(horizontal = 14.dp, vertical = 9.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.TrendingUp,
                                contentDescription = null,
                                tint = colors.textSecondary,
                                modifier = Modifier.size(17.dp)
                            )
                            Text(
                                text = term,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                color = colors.textPrimary
                            )
                        }
                    }
                }
            }
        }
    }
}
