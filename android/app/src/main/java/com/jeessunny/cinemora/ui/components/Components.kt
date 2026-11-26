package com.jeessunny.cinemora.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.graphics.graphicsLayer
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
import android.view.View
import android.view.ViewParent
import android.view.WindowManager
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.verticalScroll
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
    val primaryTabs = listOf(
        Triple("home", "Home", Icons.Rounded.Home),
        Triple("search", "Search", Icons.Rounded.Search),
        Triple("library", "Library", Icons.Rounded.VideoLibrary)
    )

    val settingsWeight by animateFloatAsState(
        targetValue = if (showSettingsTab) 1f else 0.0001f,
        animationSpec = androidx.compose.animation.core.tween(
            durationMillis = 300,
            easing = androidx.compose.animation.core.FastOutSlowInEasing
        ),
        label = "nav_settings_weight"
    )
    val settingsAlpha by animateFloatAsState(
        targetValue = if (showSettingsTab) 1f else 0f,
        animationSpec = androidx.compose.animation.core.tween(
            durationMillis = 250,
            easing = androidx.compose.animation.core.FastOutSlowInEasing
        ),
        label = "nav_settings_alpha"
    )
    val settingsScale by animateFloatAsState(
        targetValue = if (showSettingsTab) 1f else 0.4f,
        animationSpec = androidx.compose.animation.core.tween(
            durationMillis = 300,
            easing = androidx.compose.animation.core.FastOutSlowInEasing
        ),
        label = "nav_settings_scale"
    )

    val navBarInset = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding()

    val animSpec = androidx.compose.animation.core.tween<androidx.compose.ui.unit.Dp>(
        durationMillis = 280,
        easing = androidx.compose.animation.core.FastOutSlowInEasing
    )

    val targetBottomPadding = if (floating) (14.dp + (if (navBarInset > 0.dp) navBarInset else 0.dp)) else 0.dp
    val targetNavHeight = if (floating) 64.dp else (64.dp + navBarInset)

    val horizontalPadding by animateDpAsState(
        targetValue = if (floating) 20.dp else 0.dp,
        animationSpec = animSpec,
        label = "nav_h_pad"
    )
    val bottomPadding by animateDpAsState(
        targetValue = targetBottomPadding,
        animationSpec = animSpec,
        label = "nav_b_pad"
    )
    val navHeight by animateDpAsState(
        targetValue = targetNavHeight,
        animationSpec = animSpec,
        label = "nav_height"
    )
    val topRadius by animateDpAsState(
        targetValue = if (floating) 32.dp else 0.dp,
        animationSpec = animSpec,
        label = "nav_top_radius"
    )
    val bottomRadius by animateDpAsState(
        targetValue = if (floating) 32.dp else 0.dp,
        animationSpec = animSpec,
        label = "nav_bottom_radius"
    )
    val borderAlpha by animateFloatAsState(
        targetValue = if (floating) 1f else 0f,
        animationSpec = androidx.compose.animation.core.tween(
            durationMillis = 280,
            easing = androidx.compose.animation.core.FastOutSlowInEasing
        ),
        label = "nav_border_alpha"
    )

    // Subtle grey border outline matching settings tile border (colors.divider)
    val navOutlineColor = colors.divider

    val safeTopRadius = topRadius.coerceAtLeast(0.dp)
    val safeBottomRadius = bottomRadius.coerceAtLeast(0.dp)
    val safeHorizontalPadding = horizontalPadding.coerceAtLeast(0.dp)
    val safeBottomPadding = bottomPadding.coerceAtLeast(0.dp)

    val navShape = RoundedCornerShape(
        topStart = safeTopRadius,
        topEnd = safeTopRadius,
        bottomStart = safeBottomRadius,
        bottomEnd = safeBottomRadius
    )
    val navBg = if (colors.isPitchBlack) Color(0xFF000000) else colors.surfaceContainer

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = safeHorizontalPadding)
            .padding(bottom = safeBottomPadding)
            .height(navHeight)
            .clip(navShape)
            .background(navBg)
            .then(
                if (borderAlpha > 0.01f) {
                    Modifier.border(1.dp, navOutlineColor.copy(alpha = navOutlineColor.alpha * borderAlpha), navShape)
                } else Modifier
            )
    ) {
        // Subtle top outline matching settings tile border when docked static (smoothly cross-fades with floating capsule outline)
        if (borderAlpha < 0.99f) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(navOutlineColor.copy(alpha = navOutlineColor.alpha * (1f - borderAlpha)))
                    .align(Alignment.TopCenter)
            )
        }

        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = if (!floating) navBarInset else 0.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            primaryTabs.forEach { (route, label, icon) ->
                val selected = currentRoute == route
                val scale by animateFloatAsState(
                    targetValue = if (selected) 1.1f else 1.0f,
                    animationSpec = spring(dampingRatio = 0.6f, stiffness = 400f),
                    label = "nav_item_scale_$route"
                )

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onNavigate(route) }
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

            // Settings Tab with smooth expandable weight, alpha and scale animation
            if (showSettingsTab || settingsWeight > 0.005f) {
                val selected = currentRoute == "settings"
                val scale by animateFloatAsState(
                    targetValue = if (selected) 1.1f else 1.0f,
                    animationSpec = spring(dampingRatio = 0.6f, stiffness = 400f),
                    label = "nav_item_scale_settings"
                )

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier
                        .weight(settingsWeight.coerceAtLeast(0.0001f))
                        .fillMaxHeight()
                        .graphicsLayer {
                            alpha = settingsAlpha
                            scaleX = settingsScale
                            scaleY = settingsScale
                            clip = true
                        }
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                            enabled = showSettingsTab && settingsAlpha > 0.5f
                        ) { onNavigate("settings") }
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Settings,
                        contentDescription = "Settings",
                        tint = if (selected) colors.primary else colors.textSecondary.copy(alpha = 0.85f),
                        modifier = Modifier
                            .size(25.dp)
                            .scale(scale)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Settings",
                        fontSize = if (selected) 12.sp else 11.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.SemiBold,
                        color = if (selected) colors.primary else colors.textSecondary.copy(alpha = 0.85f),
                        maxLines = 1,
                        overflow = TextOverflow.Clip
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
        modifier = modifier.fillMaxWidth()
    ) {
        Text(
            text = title,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = colors.textPrimary,
            letterSpacing = (-0.3).sp,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
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
                textStyle = LocalTextStyle.current.copy(
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
    val rawIndex = options.indexOfFirst { it.second == selectedValue }
    val selectedIndex = if (rawIndex >= 0) rawIndex else 0

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .height(46.dp)
            .clip(RoundedCornerShape(28.dp))
            .background(colors.surfaceContainerLow)
            .border(1.dp, colors.divider, RoundedCornerShape(28.dp))
            .padding(4.dp)
    ) {
        val count = options.size.coerceAtLeast(1)
        val tabWidth = maxWidth / count
        val indicatorOffset by animateDpAsState(
            targetValue = tabWidth * selectedIndex,
            animationSpec = spring(dampingRatio = 0.8f, stiffness = 400f),
            label = "segmented_indicator_offset"
        )

        // Sliding indicator pill (only 1 tab wide, properly bounds to tab)
        Box(
            modifier = Modifier
                .offset(x = indicatorOffset)
                .width(tabWidth)
                .height(38.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(colors.primary)
        )

        Row(
            modifier = Modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            options.forEachIndexed { index, (label, value) ->
                val selected = index == selectedIndex
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(24.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onSelect(value) },
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
// 8.5 Dialog Transparent Background Helper
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun DialogTransparentBackground() {
    val view = LocalView.current
    DisposableEffect(view) {
        fun makeTransparent() {
            var p: ViewParent? = view.parent
            while (p != null) {
                if (p is DialogWindowProvider) {
                    p.window.setBackgroundDrawable(ColorDrawable(android.graphics.Color.TRANSPARENT))
                    p.window.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
                    break
                }
                p = p.parent
            }
        }
        makeTransparent()
        val listener = object : View.OnAttachStateChangeListener {
            override fun onViewAttachedToWindow(v: View) { makeTransparent() }
            override fun onViewDetachedFromWindow(v: View) {}
        }
        view.addOnAttachStateChangeListener(listener)
        view.post { makeTransparent() }
        onDispose {
            view.removeOnAttachStateChangeListener(listener)
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
        DialogTransparentBackground()

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
                    .fillMaxWidth(0.92f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(20.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { /* prevent dismissal on dialog card click */ }
                    .padding(22.dp)
            ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "App Update",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    IconButton(
                        onClick = { UpdateManager.dismissDialog() },
                        modifier = Modifier.size(26.dp)
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
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        val changelogScrollState = rememberScrollState()
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 180.dp, max = 340.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(colors.surfaceContainerLow)
                                .border(1.dp, colors.divider, RoundedCornerShape(12.dp))
                                .padding(14.dp)
                                .verticalScroll(changelogScrollState)
                        ) {
                            Text(
                                text = "What's New in ${current.info.tagName}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            val cleanChangelog = remember(current.info.releaseNotes) {
                                current.info.releaseNotes
                                    .replace(Regex("^#{1,6}\\s*", RegexOption.MULTILINE), "")
                                    .replace(Regex("\\*\\*(.*?)\\*\\*"), "$1")
                                    .replace(Regex("\\*(.*?)\\*"), "$1")
                                    .replace(Regex("`([^`]+)`"), "$1")
                                    .replace(Regex("^-{3,}\\s*", RegexOption.MULTILINE), "\n")
                                    .trim()
                                    .ifBlank { "Performance improvements and bug fixes." }
                            }
                            Text(
                                text = cleanChangelog,
                                fontSize = 13.sp,
                                color = colors.textSecondary,
                                lineHeight = 19.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        Button(
                            onClick = { UpdateManager.openReleasePage(context, current.info.releaseUrl) },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp)
                        ) {
                            Text(text = "Download on GitHub", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
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

// ═══════════════════════════════════════════════════════════════════════════
// 10. Themed Optimized Cinemora Dialog
// ═══════════════════════════════════════════════════════════════════════════
@Composable
fun CinemoraDialog(
    onDismissRequest: () -> Unit,
    title: String,
    message: String,
    icon: ImageVector? = null,
    iconTint: Color? = null,
    confirmText: String = "Confirm",
    confirmColor: Color? = null,
    onConfirm: () -> Unit,
    dismissText: String = "Cancel",
    onDismiss: () -> Unit = onDismissRequest
) {
    val colors = LocalCinemoraColors.current
    val effectiveConfirmColor = confirmColor ?: colors.primary
    val effectiveIconTint = iconTint ?: colors.primary

    Dialog(
        onDismissRequest = onDismissRequest,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
            dismissOnClickOutside = true
        )
    ) {
        DialogTransparentBackground()

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.65f))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { onDismissRequest() },
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.88f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(20.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { /* prevent backdrop dismiss */ }
                    .padding(22.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (icon != null) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(effectiveIconTint.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = icon,
                                contentDescription = null,
                                tint = effectiveIconTint,
                                modifier = Modifier.size(26.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                    }

                    Text(
                        text = title,
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = message,
                        fontSize = 14.sp,
                        color = colors.textSecondary,
                        textAlign = TextAlign.Center,
                        lineHeight = 20.sp
                    )

                    Spacer(modifier = Modifier.height(22.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = onDismiss,
                            modifier = Modifier
                                .weight(1f)
                                .height(44.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, colors.divider),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = colors.textPrimary
                            )
                        ) {
                            Text(
                                text = dismissText,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textSecondary
                            )
                        }

                        Button(
                            onClick = onConfirm,
                            modifier = Modifier
                                .weight(1f)
                                .height(44.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = effectiveConfirmColor
                            )
                        ) {
                            Text(
                                text = confirmText,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}
