package com.jeessunny.cinemora.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.jeessunny.cinemora.BuildConfig
import com.jeessunny.cinemora.data.PreferencesManager
import com.jeessunny.cinemora.service.UpdateManager
import com.jeessunny.cinemora.ui.components.SegmentedButton
import com.jeessunny.cinemora.ui.theme.ACCENT_COLORS
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors
import com.jeessunny.cinemora.ui.theme.parseColor

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
    val animationsEnabled by prefs.animationsEnabled.collectAsState()
    val homeSections by prefs.homeSections.collectAsState()

    var showClearHistoryDialog by remember { mutableStateOf(false) }
    var showResetDialog by remember { mutableStateOf(false) }

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

            // Profile Card
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainerLow)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(avatar)
                        .crossfade(true)
                        .build(),
                    contentDescription = "Avatar",
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceContainerHigh)
                        .border(1.5.dp, colors.primary, CircleShape)
                )

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = if (userName.isNotBlank()) userName else "Movie Lover",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary,
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Edit Profile",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary,
                            modifier = Modifier.clickable { onEditProfile() }
                        )
                        Text(text = "•", color = colors.textSecondary)
                        Text(
                            text = "Log Out",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE50914),
                            modifier = Modifier.clickable {
                                prefs.clearAllData()
                                onLogout()
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Appearance Section
            SectionHeader(title = "Appearance")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Theme Mode Segmented Button
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(Icons.Rounded.Palette, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
                        Text(text = "Theme Mode", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
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
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(
                            Icons.Rounded.Brightness2,
                            contentDescription = null,
                            tint = if (amoledDisabled) colors.textSecondary else colors.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Column {
                            Text(
                                text = "Pure Pitch Black (AMOLED)",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (amoledDisabled) colors.textSecondary else colors.textPrimary
                            )
                            Text(
                                text = if (amoledDisabled) "Available in Dark or System mode"
                                else "Pure #000000 black surfaces for OLED battery saving",
                                fontSize = 11.sp,
                                color = colors.textSecondary
                            )
                        }
                    }

                    Switch(
                        checked = amoledBlack && !amoledDisabled,
                        onCheckedChange = { prefs.setAmoledBlack(it) },
                        enabled = !amoledDisabled,
                        colors = SwitchDefaults.colors(checkedThumbColor = colors.primary, checkedTrackColor = colors.primary.copy(alpha = 0.5f))
                    )
                }

                HorizontalDivider(color = colors.divider)

                // Accent Colors
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(Icons.Rounded.ColorLens, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
                        Text(text = "Accent Color", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
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

            Spacer(modifier = Modifier.height(24.dp))

            // Navigation Section
            SectionHeader(title = "Navigation")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(Icons.Rounded.ViewDay, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
                        Column {
                            Text(text = "Floating Navigation Bar", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                            Text(text = "Floating capsule style bottom bar", fontSize = 11.sp, color = colors.textSecondary)
                        }
                    }

                    Switch(
                        checked = floatingNavBar,
                        onCheckedChange = { prefs.setFloatingNavBar(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = colors.primary, checkedTrackColor = colors.primary.copy(alpha = 0.5f))
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Animation Section
            SectionHeader(title = "Animation")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(Icons.Rounded.Animation, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
                        Column {
                            Text(text = "All Animations", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
                            Text(text = "Smooth page transitions and scale effects", fontSize = 11.sp, color = colors.textSecondary)
                        }
                    }

                    Switch(
                        checked = animationsEnabled,
                        onCheckedChange = { prefs.setAnimationsEnabled(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = colors.primary, checkedTrackColor = colors.primary.copy(alpha = 0.5f))
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Home Feed Customization
            SectionHeader(title = "Home Feed Sections")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
            ) {
                homeSections.forEachIndexed { index, section ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = section.label,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textPrimary
                        )
                        IconButton(
                            onClick = { prefs.toggleHomeSection(section.id) },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = if (section.enabled) Icons.Rounded.Visibility else Icons.Rounded.VisibilityOff,
                                contentDescription = "Toggle",
                                tint = if (section.enabled) colors.primary else colors.textSecondary
                            )
                        }
                    }
                    if (index < homeSections.size - 1) {
                        HorizontalDivider(color = colors.divider)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Data & Storage
            SectionHeader(title = "Data & Storage")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
            ) {
                SettingsActionRow(
                    icon = Icons.Rounded.DeleteSweep,
                    title = "Clear Watch History",
                    onClick = { showClearHistoryDialog = true }
                )
                HorizontalDivider(color = colors.divider)
                SettingsActionRow(
                    icon = Icons.Rounded.RestartAlt,
                    title = "Reset Recommendations",
                    onClick = { showResetDialog = true }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // App Updates & Version
            SectionHeader(title = "App Info")

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Cinemora Native", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                        Text(text = "Version ${BuildConfig.APP_VERSION}", fontSize = 12.sp, color = colors.textSecondary)
                    }

                    Button(
                        onClick = { UpdateManager.checkForUpdates(context, isManual = true) },
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Icon(Icons.Rounded.SystemUpdate, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Check Updates", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }

    // Clear History Dialog
    if (showClearHistoryDialog) {
        AlertDialog(
            onDismissRequest = { showClearHistoryDialog = false },
            title = { Text("Clear Watch History") },
            text = { Text("Are you sure you want to clear your entire watch history? This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    prefs.clearHistory()
                    showClearHistoryDialog = false
                }) {
                    Text("Clear", color = Color(0xFFE50914), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearHistoryDialog = false }) {
                    Text("Cancel", color = colors.textSecondary)
                }
            }
        )
    }

    // Reset Recommendations Dialog
    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("Reset Recommendations") },
            text = { Text("This will reset your taste profile and restart onboarding.") },
            confirmButton = {
                TextButton(onClick = {
                    prefs.clearAllData()
                    showResetDialog = false
                    onLogout()
                }) {
                    Text("Reset", color = colors.primary, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetDialog = false }) {
                    Text("Cancel", color = colors.textSecondary)
                }
            }
        )
    }
}

@Composable
private fun SectionHeader(title: String) {
    val colors = LocalCinemoraColors.current
    Text(
        text = title.uppercase(),
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        color = colors.primary,
        letterSpacing = 0.5.sp,
        modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)
    )
}

@Composable
private fun SettingsActionRow(
    icon: ImageVector,
    title: String,
    onClick: () -> Unit
) {
    val colors = LocalCinemoraColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Icon(icon, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
        Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = colors.textPrimary)
    }
}

@Composable
private fun ColorCircle(
    hex: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    val color = parseColor(hex)
    Box(
        modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(color)
            .border(
                width = if (selected) 3.dp else 1.dp,
                color = if (selected) Color.White else Color.Transparent,
                shape = CircleShape
            )
            .clickable { onClick() }
    )
}
