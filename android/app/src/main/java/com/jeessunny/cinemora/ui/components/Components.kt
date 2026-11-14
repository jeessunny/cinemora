package com.jeessunny.cinemora.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.graphics.drawable.ColorDrawable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.ui.window.DialogWindowProvider
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.jeessunny.cinemora.model.Movie
import com.jeessunny.cinemora.model.UpdateState
import com.jeessunny.cinemora.service.UpdateManager
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors

// ═══════════════════════════════════════════════════════════════════════════
// 1. Navigation Bar (Capsule Floating or Fixed)
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun CinemoraNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    floating: Boolean = true,
    showSettingsTab: Boolean = true,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current
    val allTabs = listOf(
        Triple("home", "Home", Icons.Rounded.Home),
        Triple("search", "Search", Icons.Rounded.Search),
        Triple("library", "Library", Icons.Rounded.VideoLibrary),
        Triple("settings", "Settings", Icons.Rounded.Settings)
    )
    val tabs = if (showSettingsTab) allTabs else allTabs.filter { it.first != "settings" }

    val navShape = if (floating) RoundedCornerShape(32.dp) else RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
    val navBg = if (colors.isPitchBlack) Color(0xFF000000) else colors.surfaceContainer
    val paddingModifier = if (floating) {
        Modifier
            .padding(horizontal = 20.dp, vertical = 14.dp)
            .shadow(elevation = 12.dp, shape = navShape)
    } else {
        Modifier.fillMaxWidth()
    }

    Box(
        modifier = modifier
            .then(paddingModifier)
            .clip(navShape)
            .background(navBg)
            .border(1.dp, colors.divider, navShape)
            .height(if (floating) 64.dp else 72.dp)
            .fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            tabs.forEach { (route, label, icon) ->
                val selected = currentRoute == route
                val scale by animateFloatAsState(
                    targetValue = if (selected) 1.1f else 1.0f,
                    animationSpec = spring(dampingRatio = 0.6f, stiffness = 400f)
                )

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clickable { onNavigate(route) }
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = label,
                        tint = if (selected) colors.primary else colors.textSecondary.copy(alpha = 0.85f),
                        modifier = Modifier
                            .size(25.dp)
                            .scale(scale)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = label,
                        fontSize = if (selected) 12.sp else 11.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.SemiBold,
                        color = if (selected) colors.primary else colors.textSecondary.copy(alpha = 0.85f)
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Poster Card (150 x 225 dp)
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun PosterCard(
    movie: Movie,
    isWatchlist: Boolean = false,
    isFavorite: Boolean = false,
    isHistory: Boolean = false,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current

    Box(
        modifier = modifier
            .width(150.dp)
            .height(225.dp)
            .shadow(4.dp, RoundedCornerShape(12.dp))
            .clip(RoundedCornerShape(12.dp))
            .background(colors.surfaceContainerLow)
            .clickable { onClick() }
    ) {
        // Full Card Background Image
        AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
                .data(movie.posterUrl)
                .crossfade(true)
                .build(),
            contentDescription = movie.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Gradient Scrim Overlay at the bottom (65% height)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.65f)
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Transparent,
                            Color(0x99000000),
                            Color(0xF2000000)
                        )
                    )
                )
        )

        // Status Badges at top right
        Row(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            if (isFavorite) {
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .clip(CircleShape)
                        .background(Color(0xBF000000)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Favorite,
                        contentDescription = "Favorite",
                        tint = Color(0xFFE50914),
                        modifier = Modifier.size(15.dp)
                    )
                }
            }
            if (isWatchlist) {
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .clip(CircleShape)
                        .background(Color(0xBF000000)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Bookmark,
                        contentDescription = "Watchlist",
                        tint = colors.primary,
                        modifier = Modifier.size(15.dp)
                    )
                }
            }
            if (isHistory) {
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .clip(CircleShape)
                        .background(Color(0xBF000000)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = "Watched",
                        tint = Color(0xFF46D369),
                        modifier = Modifier.size(15.dp)
                    )
                }
            }
        }

        // Title and Year info at bottom
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp)
        ) {
            Text(
                text = movie.title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                lineHeight = 16.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${movie.year}",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xBFFFFFFF)
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Hero Card (400 dp, View Details button)
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun HeroCard(
    movie: Movie,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current
    val scrimEnd = if (colors.isPitchBlack) Color(0xF2000000) else Color(0xF20F0D0D)

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(400.dp)
            .shadow(6.dp, RoundedCornerShape(28.dp))
            .clip(RoundedCornerShape(28.dp))
            .background(colors.surfaceContainerLow)
            .clickable { onClick() }
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

        // Gradient Scrim to top
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        0.0f to Color.Transparent,
                        0.35f to Color.Transparent,
                        1.0f to scrimEnd
                    )
                )
        )

        // Content
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth()
                .padding(24.dp)
        ) {
            // Genre and Match Chips
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 10.dp)
            ) {
                movie.genres.take(2).forEach { g ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0x33FFFFFF))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = g,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White
                        )
                    }
                }

                val match = movie.matchPercentage ?: 99
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(colors.primary)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "$match% Match",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                }
            }

            Text(
                text = movie.title,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                lineHeight = 32.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(14.dp))

            Button(
                onClick = onClick,
                colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                contentPadding = PaddingValues(vertical = 10.dp)
            ) {
                Text(
                    text = "View Details",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Scroll Rail
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun ScrollRail(
    title: String,
    movies: List<Movie>,
    watchlistIds: Set<Int>,
    favoriteIds: Set<Int>,
    historyIds: Set<Int>,
    onMovieClick: (Movie) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current
    if (movies.isEmpty()) return

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 18.dp)
    ) {
        Text(
            text = title,
            fontSize = 22.sp,
            fontWeight = FontWeight.ExtraBold,
            color = colors.textPrimary,
            letterSpacing = (-0.3).sp,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
        )

        LazyRow(
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(movies, key = { it.id }) { movie ->
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

// ═══════════════════════════════════════════════════════════════════════════
// 5. Search Bar
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    placeholder: String = "Search movies, genres...",
    onSubmit: () -> Unit = {},
    onClear: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current

    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(50.dp))
            .background(colors.surfaceContainerHigh)
            .border(1.dp, colors.divider, RoundedCornerShape(50.dp))
            .padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = Icons.Rounded.Search,
            contentDescription = "Search",
            tint = colors.textSecondary,
            modifier = Modifier.size(22.dp)
        )

        Spacer(modifier = Modifier.width(10.dp))

        Box(modifier = Modifier.weight(1f)) {
            if (query.isEmpty()) {
                Text(
                    text = placeholder,
                    color = colors.textSecondary,
                    fontSize = 14.sp
                )
            }
            BasicTextField(
                value = query,
                onValueChange = onQueryChange,
                textStyle = TextStyle(
                    color = colors.textPrimary,
                    fontSize = 14.sp
                ),
                cursorBrush = SolidColor(colors.primary),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = { onSubmit() }),
                modifier = Modifier.fillMaxWidth()
            )
        }

        if (query.isNotEmpty()) {
            IconButton(
                onClick = onClear,
                modifier = Modifier.size(24.dp)
            ) {
                Icon(
                    imageVector = Icons.Rounded.Clear,
                    contentDescription = "Clear",
                    tint = colors.textSecondary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Segmented Button (Capsule Style)
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun SegmentedButton(
    options: List<Pair<String, String>>, // label, value
    selectedValue: String,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current

    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .background(colors.surfaceContainerLow)
            .border(1.dp, colors.divider, RoundedCornerShape(28.dp))
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        options.forEach { (label, value) ->
            val selected = selectedValue == value
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(24.dp))
                    .background(if (selected) colors.primary else Color.Transparent)
                    .clickable { onSelect(value) }
                    .padding(vertical = 9.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = label,
                    fontSize = 14.sp,
                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                    color = if (selected) Color.White else colors.textSecondary
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. Genre Chips (Horizontal List)
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun GenreChipsRow(
    genres: List<String>,
    selected: Set<String>,
    onToggle: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current

    LazyRow(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        items(genres) { genre ->
            val isSelected = selected.contains(genre)
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(if (isSelected) colors.primary else colors.surfaceContainer)
                    .border(
                        1.dp,
                        if (isSelected) colors.primary else colors.divider,
                        RoundedCornerShape(6.dp)
                    )
                    .clickable { onToggle(genre) }
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = genre,
                    fontSize = 13.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) Color.White else colors.textPrimary
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. Empty State
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun EmptyState(
    icon: ImageVector,
    title: String,
    subtitle: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val colors = LocalCinemoraColors.current

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
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
                imageVector = icon,
                contentDescription = null,
                tint = colors.primary,
                modifier = Modifier.size(36.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = subtitle,
            fontSize = 13.sp,
            color = colors.textSecondary,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp
        )

        if (actionLabel != null && onAction != null) {
            Spacer(modifier = Modifier.height(20.dp))
            Button(
                onClick = onAction,
                colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                shape = RoundedCornerShape(50.dp),
                contentPadding = PaddingValues(horizontal = 24.dp, vertical = 10.dp)
            ) {
                Text(text = actionLabel, color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. Update Dialog
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun UpdateDialogView() {
    val context = LocalContext.current
    val colors = LocalCinemoraColors.current
    val showDialog by UpdateManager.showDialog.collectAsState()
    val state by UpdateManager.updateState.collectAsState()

    if (!showDialog) return

    Dialog(
        onDismissRequest = { UpdateManager.dismissDialog() },
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
            dismissOnClickOutside = true
        )
    ) {
        (LocalView.current.parent as? DialogWindowProvider)?.window?.let { window ->
            window.setBackgroundDrawable(ColorDrawable(android.graphics.Color.TRANSPARENT))
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.65f))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { UpdateManager.dismissDialog() },
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.90f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(20.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { /* prevent dismissal on dialog card click */ }
                    .padding(20.dp)
            ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "App Update",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    IconButton(
                        onClick = { UpdateManager.dismissDialog() },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Close,
                            contentDescription = "Close",
                            tint = colors.textSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                when (val current = state) {
                    is UpdateState.Checking -> {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = colors.primary,
                                strokeWidth = 2.dp
                            )
                            Text(
                                text = "Checking for updates...",
                                color = colors.textSecondary,
                                fontSize = 14.sp
                            )
                        }
                    }

                    is UpdateState.Available -> {
                        Text(
                            text = "New Version ${current.info.tagName} Available!",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.primary
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(max = 160.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(colors.surfaceContainerLow)
                                .border(1.dp, colors.divider, RoundedCornerShape(8.dp))
                                .padding(10.dp)
                        ) {
                            Text(
                                text = current.info.releaseNotes,
                                fontSize = 12.sp,
                                color = colors.textSecondary,
                                lineHeight = 16.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = { UpdateManager.startDownload(context, current.info) },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "Update Now", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }

                    is UpdateState.Downloading -> {
                        Text(
                            text = "Downloading Update... ${current.progressPercent}%",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        LinearProgressIndicator(
                            progress = current.progressPercent / 100f,
                            color = colors.primary,
                            trackColor = colors.surfaceContainerHighest,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                        )
                    }

                    is UpdateState.Ready -> {
                        Text(
                            text = "Update Downloaded!",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF46D369)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Ready to install Cinemora ${current.info.tagName}.",
                            fontSize = 13.sp,
                            color = colors.textSecondary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { UpdateManager.installApk(context, current.apkFile) },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "Install Now", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }

                    is UpdateState.UpToDate -> {
                        Text(
                            text = "You're All Up to Date!",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "You are currently running the latest version of Cinemora.",
                            fontSize = 13.sp,
                            color = colors.textSecondary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { UpdateManager.dismissDialog() },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "Got It", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }

                    is UpdateState.Error -> {
                        Text(
                            text = "Update Check Failed",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE50914)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = current.message,
                            fontSize = 13.sp,
                            color = colors.textSecondary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { UpdateManager.checkForUpdates(context, true) },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "Retry", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }

                    else -> {}
                }
            }
        }
    }
}
}
