package com.jeessunny.cinemora.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.jeessunny.cinemora.BuildConfig
import com.jeessunny.cinemora.data.PreferencesManager
import com.jeessunny.cinemora.data.RecommendationEngine
import com.jeessunny.cinemora.service.UpdateManager
import com.jeessunny.cinemora.ui.components.CinemoraDialog
import com.jeessunny.cinemora.ui.components.SegmentedButton
import com.jeessunny.cinemora.ui.theme.ACCENT_COLORS
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors
import com.jeessunny.cinemora.ui.theme.parseColor
import kotlin.math.roundToInt

@Composable
fun SettingsScreen(
    prefs: PreferencesManager,
    onEditProfile: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val colors = LocalCinemoraColors.current

    val userName by prefs.userName.collectAsState()
    val avatar by prefs.avatar.collectAsState()
    val themeMode by prefs.themeMode.collectAsState()
    val amoledBlack by prefs.amoledBlack.collectAsState()
    val accentColor by prefs.accentColor.collectAsState()
    val floatingNavBar by prefs.floatingNavBar.collectAsState()
    val navSettingsEnabled by prefs.navSettingsEnabled.collectAsState()
    val showStatusBar by prefs.showStatusBar.collectAsState()
    val disableSeries by prefs.disableSeries.collectAsState()
    val homeSections by prefs.homeSections.collectAsState()
    val watchlist by prefs.watchlist.collectAsState()
    val favorites by prefs.favorites.collectAsState()
    val history by prefs.history.collectAsState()

    var localSections by remember(homeSections) { mutableStateOf(homeSections) }
    val visibleSections = remember(localSections, disableSeries) {
        if (disableSeries) localSections.filter { it.id != "trendingSeries" && it.id != "popularSeries" }
        else localSections
    }
    var draggingIndex by remember { mutableStateOf<Int?>(null) }
    var dragOffsetY by remember { mutableStateOf(0f) }
    val density = LocalDensity.current

    val (topGenres, _) = remember(history, favorites, watchlist) {
        RecommendationEngine.getRecommendationData(prefs)
    }
    val g1 = topGenres.getOrNull(0) ?: "Action"
    val g2 = topGenres.getOrNull(1) ?: "Sci-Fi"

    var showClearHistoryDialog by remember { mutableStateOf(false) }
    var showResetDialog by remember { mutableStateOf(false) }
    var showDeleteProfileDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .statusBarsPadding()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(bottom = 110.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Settings",
                fontSize = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                color = colors.textPrimary
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Profile Card (16.dp rounded container, no artificial red border on avatar)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                val avatarUrl = if (avatar.isNotBlank()) avatar else "https://api.dicebear.com/7.x/avataaars/png?seed=${if (userName.isNotBlank()) userName else "MovieLover"}"
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(avatarUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = "Avatar",
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceContainerHigh)
                )

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = if (userName.isNotBlank()) userName else "Movie Lover",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary,
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Edit Profile",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.primary,
                        modifier = Modifier.clickable { onEditProfile() }
                    )
                }
            }

            // ═══════ APPEARANCE ═══════
            SectionHeader(title = "APPEARANCE")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
            ) {
                // Theme Mode
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(Icons.Rounded.Palette, contentDescription = null, tint = colors.primary, modifier = Modifier.size(22.dp))
                        Text(text = "Theme Mode", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                    }

                    SegmentedButton(
                        options = listOf("System" to "system", "Dark" to "dark", "Light" to "light"),
                        selectedValue = themeMode,
                        onSelect = { prefs.setThemeMode(it) }
                    )
                }

                HorizontalDivider(color = colors.divider)

                // Pure Pitch Black (AMOLED)
                val amoledDisabled = themeMode == "light"
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            Icons.Rounded.Brightness2,
                            contentDescription = null,
                            tint = if (amoledDisabled) colors.textSecondary.copy(alpha = 0.5f) else colors.primary,
                            modifier = Modifier
                                .size(22.dp)
                                .graphicsLayer(scaleX = -1f, rotationZ = -25f)
                        )
                        Column {
                            Text(
                                text = "Pure Pitch Black (AMOLED)",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (amoledDisabled) colors.textSecondary.copy(alpha = 0.5f) else colors.textPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Pure #000000 black for OLED",
                                fontSize = 12.sp,
                                color = colors.textSecondary
                            )
                        }
                    }

                    Switch(
                        checked = amoledBlack && !amoledDisabled,
                        onCheckedChange = { prefs.setAmoledBlack(it) },
                        enabled = !amoledDisabled,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = colors.primary
                        )
                    )
                }

                HorizontalDivider(color = colors.divider)

                // Accent Color
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(Icons.Rounded.ColorLens, contentDescription = null, tint = colors.primary, modifier = Modifier.size(22.dp))
                        Text(text = "Accent Color", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        ACCENT_COLORS.take(5).forEach { (_, hex) ->
                            ColorCircle(hex = hex, selected = accentColor.equals(hex, ignoreCase = true)) {
                                prefs.setAccentColor(hex)
                            }
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        ACCENT_COLORS.drop(5).forEach { (_, hex) ->
                            ColorCircle(hex = hex, selected = accentColor.equals(hex, ignoreCase = true)) {
                                prefs.setAccentColor(hex)
                            }
                        }
                    }
                }
            }

            // ═══════ NAVIGATION ═══════
            SectionHeader(title = "NAVIGATION")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
            ) {
                // Floating Navigation Bar (clean row matching og1.jpg)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(Icons.Rounded.ViewDay, contentDescription = null, tint = colors.primary, modifier = Modifier.size(22.dp))
                        Text(text = "Floating Navigation Bar", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                    }

                    Switch(
                        checked = floatingNavBar,
                        onCheckedChange = { prefs.setFloatingNavBar(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = colors.primary
                        )
                    )
                }

                HorizontalDivider(color = colors.divider)

                // Show Settings Tab
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(Icons.Rounded.Settings, contentDescription = null, tint = colors.primary, modifier = Modifier.size(22.dp))
                        Text(text = "Show Settings Tab", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                    }

                    Switch(
                        checked = navSettingsEnabled,
                        onCheckedChange = { prefs.setNavSettingsEnabled(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = colors.primary
                        )
                    )
                }

                HorizontalDivider(color = colors.divider)

                // Show Status Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(Icons.Rounded.StayCurrentPortrait, contentDescription = null, tint = colors.primary, modifier = Modifier.size(22.dp))
                        Column {
                            Text(text = "Show Status Bar", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(text = "Blends seamlessly with app themes", fontSize = 12.sp, color = colors.textSecondary)
                        }
                    }

                    Switch(
                        checked = showStatusBar,
                        onCheckedChange = { prefs.setShowStatusBar(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = colors.primary
                        )
                    )
                }
            }

            // ═══════ CONTENT ═══════
            SectionHeader(title = "CONTENT")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Rounded.Movie, contentDescription = null, tint = colors.primary, modifier = Modifier.size(22.dp))
                        Column {
                            Text(text = "Disable Series", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(text = "Movies only mode • Hides all series across Cinemora", fontSize = 12.sp, color = colors.textSecondary)
                        }
                    }

                    Switch(
                        checked = disableSeries,
                        onCheckedChange = { prefs.setDisableSeries(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = colors.primary
                        )
                    )
                }
            }

            // ═══════ HOME SCREEN SECTIONS ═══════
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 4.dp, end = 4.dp, top = 24.dp, bottom = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "HOME SCREEN SECTIONS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "RESET",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary,
                    letterSpacing = 0.5.sp,
                    modifier = Modifier.clickable { prefs.resetHomeSections() }
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
            ) {
                val rowHeightPx = with(density) { 56.dp.toPx() }

                visibleSections.forEachIndexed { index, section ->
                    val isDraggingThis = draggingIndex == index

                    val dragModifier = if (isDraggingThis) {
                        Modifier
                            .zIndex(10f)
                            .graphicsLayer { translationY = dragOffsetY }
                            .shadow(8.dp, RoundedCornerShape(12.dp))
                            .background(colors.surfaceContainerHighest)
                    } else {
                        Modifier.zIndex(1f)
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .then(dragModifier)
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isDraggingThis) colors.primary.copy(alpha = 0.15f) else Color.Transparent)
                                    .pointerInput(section.id) {
                                        detectDragGestures(
                                            onDragStart = {
                                                draggingIndex = index
                                                dragOffsetY = 0f
                                            },
                                            onDrag = { change, dragAmount ->
                                                change.consume()
                                                dragOffsetY += dragAmount.y
                                            },
                                            onDragEnd = {
                                                val from = draggingIndex
                                                if (from != null && visibleSections.isNotEmpty()) {
                                                    val slots = (dragOffsetY / rowHeightPx).roundToInt()
                                                    val to = (from + slots).coerceIn(0, visibleSections.lastIndex)
                                                    if (from != to && from in visibleSections.indices && to in visibleSections.indices) {
                                                        val fromItem = visibleSections[from]
                                                        val toItem = visibleSections[to]
                                                        val fromIdx = localSections.indexOfFirst { it.id == fromItem.id }
                                                        val toIdx = localSections.indexOfFirst { it.id == toItem.id }
                                                        if (fromIdx != -1 && toIdx != -1) {
                                                            val list = localSections.toMutableList()
                                                            val item = list.removeAt(fromIdx)
                                                            list.add(toIdx, item)
                                                            localSections = list
                                                            prefs.saveHomeSections(list)
                                                        }
                                                    }
                                                }
                                                draggingIndex = null
                                                dragOffsetY = 0f
                                            },
                                            onDragCancel = {
                                                draggingIndex = null
                                                dragOffsetY = 0f
                                            }
                                        )
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.DragIndicator,
                                    contentDescription = "Drag to reorder",
                                    tint = if (isDraggingThis) colors.primary else colors.textSecondary.copy(alpha = 0.6f),
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            val displayLabel = when (section.id) {
                                "genre1" -> "Because You Like $g1"
                                "genre2" -> "More $g2"
                                else -> section.label
                            }
                            Text(
                                text = displayLabel,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textPrimary,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        // Visibility Toggle (clean icon button, no cluttering arrows)
                        IconButton(
                            onClick = {
                                val updated = localSections.map {
                                    if (it.id == section.id) it.copy(enabled = !it.enabled) else it
                                }
                                localSections = updated
                                prefs.saveHomeSections(updated)
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = if (section.enabled) Icons.Rounded.Visibility else Icons.Rounded.VisibilityOff,
                                contentDescription = "Toggle",
                                tint = if (section.enabled) colors.primary else colors.textSecondary.copy(alpha = 0.5f)
                            )
                        }
                    }
                    if (index < visibleSections.size - 1) {
                        HorizontalDivider(color = colors.divider)
                    }
                }
            }

            // ═══════ DATA ═══════
            SectionHeader(title = "DATA")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
            ) {
                // Clear Watch History
                SettingsActionRow(
                    icon = Icons.Rounded.DeleteSweep,
                    iconTint = colors.textPrimary,
                    title = "Clear Watch History",
                    textColor = colors.textPrimary,
                    onClick = { showClearHistoryDialog = true }
                )
                HorizontalDivider(color = colors.divider)
                // Reset Recommendations
                SettingsActionRow(
                    icon = Icons.Rounded.RestartAlt,
                    iconTint = Color(0xFFE50914),
                    title = "Reset Recommendations",
                    textColor = Color(0xFFE50914),
                    onClick = { showResetDialog = true }
                )
                HorizontalDivider(color = colors.divider)
                // Delete Profile
                SettingsActionRow(
                    icon = Icons.Rounded.DeleteForever,
                    iconTint = Color(0xFFE50914),
                    title = "Delete Profile",
                    textColor = Color(0xFFE50914),
                    onClick = { showDeleteProfileDialog = true }
                )
            }

            // ═══════ UPDATES & ABOUT (LAST SECTION) ═══════
            SectionHeader(title = "UPDATES & ABOUT")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
            ) {
                // Check for Updates
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { UpdateManager.checkForUpdates(context, isManual = true) }
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.SystemUpdate,
                        contentDescription = null,
                        tint = colors.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Check for Updates",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Current version: v${BuildConfig.APP_VERSION}",
                            fontSize = 12.sp,
                            color = colors.textSecondary
                        )
                    }
                }

                HorizontalDivider(color = colors.divider)

                // About Cinemora
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            val intent = Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("https://github.com/jeessunny/cinemora")
                            )
                            context.startActivity(intent)
                        }
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Info,
                        contentDescription = null,
                        tint = colors.textSecondary,
                        modifier = Modifier.size(24.dp)
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "About Cinemora",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textPrimary
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Movie Discovery • GitHub Release",
                            fontSize = 12.sp,
                            color = colors.textSecondary
                        )
                    }
                    Icon(
                        imageVector = Icons.Rounded.OpenInNew,
                        contentDescription = null,
                        tint = colors.textSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Footer Version Text
            Spacer(modifier = Modifier.height(28.dp))
            Text(
                text = "Cinemora v${BuildConfig.APP_VERSION}",
                fontSize = 12.sp,
                color = colors.textSecondary.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
    }

    // Clear History Dialog
    if (showClearHistoryDialog) {
        CinemoraDialog(
            onDismissRequest = { showClearHistoryDialog = false },
            title = "Clear Watch History?",
            message = "Are you sure you want to clear your entire watch history? This cannot be undone.",
            icon = Icons.Rounded.DeleteSweep,
            iconTint = Color(0xFFE50914),
            confirmText = "Clear",
            confirmColor = Color(0xFFE50914),
            onConfirm = {
                prefs.clearHistory()
                showClearHistoryDialog = false
            }
        )
    }

    // Reset Recommendations Dialog
    if (showResetDialog) {
        CinemoraDialog(
            onDismissRequest = { showResetDialog = false },
            title = "Reset Recommendations?",
            message = "This will clear your genres, watchlist, favorites, and history. You will be taken back to the profile setup screen.",
            icon = Icons.Rounded.RestartAlt,
            iconTint = colors.primary,
            confirmText = "Reset",
            confirmColor = colors.primary,
            onConfirm = {
                prefs.clearAllData()
                showResetDialog = false
                onLogout()
            }
        )
    }

    // Delete Profile Dialog
    if (showDeleteProfileDialog) {
        CinemoraDialog(
            onDismissRequest = { showDeleteProfileDialog = false },
            title = "Delete Profile?",
            message = "This will permanently delete your profile, saved watchlist, favorites, and preferences. This action cannot be undone.",
            icon = Icons.Rounded.DeleteForever,
            iconTint = Color(0xFFE50914),
            confirmText = "Delete",
            confirmColor = Color(0xFFE50914),
            onConfirm = {
                prefs.clearAllData()
                showDeleteProfileDialog = false
                onLogout()
            }
        )
    }
}

@Composable
private fun SectionHeader(title: String) {
    val colors = LocalCinemoraColors.current
    Text(
        text = title,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        color = colors.primary,
        letterSpacing = 0.5.sp,
        modifier = Modifier.padding(start = 4.dp, top = 24.dp, bottom = 10.dp)
    )
}

@Composable
private fun SettingsActionRow(
    icon: ImageVector,
    iconTint: Color,
    title: String,
    textColor: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(24.dp))
        Text(text = title, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = textColor)
    }
}

@Composable
private fun ColorCircle(
    hex: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    val colors = LocalCinemoraColors.current
    val color = parseColor(hex)
    Box(
        modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(color)
            .border(
                width = if (selected) 3.dp else 0.dp,
                color = if (selected) {
                    if (colors.isDark) Color.White else Color(0xFF111111)
                } else Color.Transparent,
                shape = CircleShape
            )
            .clickable { onClick() }
    )
}
