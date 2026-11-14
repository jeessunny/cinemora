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
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.HistoryToggleOff
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jeessunny.cinemora.data.PreferencesManager
import com.jeessunny.cinemora.model.Movie
import com.jeessunny.cinemora.ui.components.EmptyState
import com.jeessunny.cinemora.ui.components.PosterCard
import com.jeessunny.cinemora.ui.components.SearchBar
import com.jeessunny.cinemora.ui.components.SegmentedButton
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors

@Composable
fun LibraryScreen(
    prefs: PreferencesManager,
    onMovieClick: (Movie) -> Unit,
    onFindMovies: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current
    var currentTab by remember { mutableStateOf("watchlist") } // "watchlist", "favorites", "history"
    var selectedCategory by remember { mutableStateOf("all") } // "all", "movie", "tv"
    var historySearch by remember { mutableStateOf("") }

    val watchlist by prefs.watchlist.collectAsState()
    val favorites by prefs.favorites.collectAsState()
    val history by prefs.history.collectAsState()

    val watchlistIds = remember(watchlist) { watchlist.map { it.id }.toSet() }
    val favoriteIds = remember(favorites) { favorites.map { it.id }.toSet() }
    val historyIds = remember(history) { history.map { it.id }.toSet() }

    val rawList = when (currentTab) {
        "favorites" -> favorites
        "history" -> history
        else -> watchlist
    }

    val categoryFiltered = remember(rawList, selectedCategory) {
        if (selectedCategory == "all") rawList
        else rawList.filter { it.type == selectedCategory }
    }

    val displayedList = remember(categoryFiltered, currentTab, historySearch) {
        if (currentTab == "history" && historySearch.isNotBlank()) {
            val q = historySearch.trim().lowercase()
            categoryFiltered.filter { it.title.lowercase().contains(q) }
        } else {
            categoryFiltered
        }
    }

    val counts = remember(rawList) {
        val allCount = rawList.size
        val movieCount = rawList.count { it.type == "movie" }
        val tvCount = rawList.count { it.type == "tv" }
        Triple(allCount, movieCount, tvCount)
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
            text = "Library",
            fontSize = 28.sp,
            fontWeight = FontWeight.ExtraBold,
            color = colors.textPrimary
        )

        Spacer(modifier = Modifier.height(14.dp))

        SegmentedButton(
            options = listOf(
                "Watchlist" to "watchlist",
                "Favorites" to "favorites",
                "History" to "history"
            ),
            selectedValue = currentTab,
            onSelect = {
                currentTab = it
                selectedCategory = "all"
                historySearch = ""
            }
        )

        Spacer(modifier = Modifier.height(18.dp))

        // Category Filter Chips (All, Movies, Series)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 18.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val chips = listOf(
                Triple("All (${counts.first})", "all", counts.first),
                Triple("Movies (${counts.second})", "movie", counts.second),
                Triple("Series (${counts.third})", "tv", counts.third)
            )

            chips.forEach { (label, value, _) ->
                val selected = selectedCategory == value
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (selected) colors.primary else colors.surfaceContainerLow)
                        .border(
                            1.dp,
                            if (selected) colors.primary else colors.divider,
                            RoundedCornerShape(16.dp)
                        )
                        .clickable { selectedCategory = value }
                        .padding(horizontal = 16.dp, vertical = 7.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (selected) Color.White else colors.textSecondary
                    )
                }
            }
        }

        // History Search Bar (full standard 52dp thickness matching other elements)
        if (currentTab == "history" && history.isNotEmpty()) {
            SearchBar(
                query = historySearch,
                onQueryChange = { historySearch = it },
                placeholder = "Search history...",
                onClear = { historySearch = "" },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            )
        }

        if (displayedList.isEmpty()) {
            val emptyInfo = when (currentTab) {
                "favorites" -> Triple(
                    Icons.Outlined.FavoriteBorder,
                    "No favorites yet",
                    "Heart the movies you love to see them here."
                )
                "history" -> Triple(
                    Icons.Outlined.HistoryToggleOff,
                    "No watch history",
                    "Movies you mark as watched will appear here."
                )
                else -> Triple(
                    Icons.Outlined.BookmarkBorder,
                    "Your watchlist is empty",
                    "Save movies you want to watch later."
                )
            }

            EmptyState(
                icon = emptyInfo.first,
                title = emptyInfo.second,
                subtitle = emptyInfo.third,
                actionLabel = when (currentTab) {
                    "watchlist" -> "Find Movies"
                    "favorites" -> "Discover"
                    else -> null
                },
                onAction = when (currentTab) {
                    "watchlist" -> onFindMovies
                    "favorites" -> onFindMovies // Navigates to find/discover
                    else -> null
                },
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
                items(displayedList, key = { it.id }) { movie ->
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        PosterCard(
                            movie = movie,
                            isWatchlist = watchlistIds.contains(movie.id),
                            isFavorite = favoriteIds.contains(movie.id),
                            isHistory = historyIds.contains(movie.id),
                            onClick = { onMovieClick(movie) }
                        )
                    }
                }
            }
        }
    }
}
