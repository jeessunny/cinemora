package com.jeessunny.cinemora.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.jeessunny.cinemora.data.CatalogData
import com.jeessunny.cinemora.data.PreferencesManager
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors
import kotlin.random.Random

@Composable
fun LoginScreen(
    prefs: PreferencesManager,
    onComplete: () -> Unit
) {
    val colors = LocalCinemoraColors.current
    var name by remember { mutableStateOf(prefs.getUserName()) }
    var seed by remember { mutableStateOf(Random.nextInt(1000, 9999)) }
    var avatarUrl by remember {
        mutableStateOf(
            if (prefs.getAvatar().isNotBlank()) prefs.getAvatar()
            else "https://api.dicebear.com/7.x/bottts/svg?seed=$seed"
        )
    }

    val selectedGenres = remember { mutableStateListOf<String>().apply { addAll(prefs.getSelectedGenres()) } }
    val selectedLanguages = remember { mutableStateListOf<String>().apply { addAll(prefs.getSelectedLanguages()) } }
    var showLanguageDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = "Welcome to Cinemora",
                fontSize = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                color = colors.textPrimary
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Personalize your movie universe",
                fontSize = 14.sp,
                color = colors.textSecondary
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Avatar & Randomizer
            Box(contentAlignment = Alignment.BottomEnd) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(avatarUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = "Avatar",
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceContainerHigh)
                        .border(2.dp, colors.primary, CircleShape)
                )

                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(colors.primary)
                        .clickable {
                            seed = Random.nextInt(1000, 9999)
                            avatarUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=$seed"
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Refresh,
                        contentDescription = "Randomize",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Name Input
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Your Name or Alias") },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = colors.primary,
                    unfocusedBorderColor = colors.divider,
                    focusedTextColor = colors.textPrimary,
                    unfocusedTextColor = colors.textPrimary,
                    focusedLabelColor = colors.primary,
                    unfocusedLabelColor = colors.textSecondary
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Genres Section
            Row(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Select Preferred Genres",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Genre Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                CatalogData.ALL_GENRES.chunked(3).forEach { rowGenres ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        rowGenres.forEach { genre ->
                            val selected = selectedGenres.contains(genre)
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selected) colors.primary else colors.surfaceContainerLow)
                                    .border(
                                        1.dp,
                                        if (selected) colors.primary else colors.divider,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable {
                                        if (selected) selectedGenres.remove(genre)
                                        else selectedGenres.add(genre)
                                    }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = genre,
                                    fontSize = 12.sp,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (selected) Color.White else colors.textPrimary
                                )
                            }
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))

            // Language Selector Button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(colors.surfaceContainerLow)
                    .border(1.dp, colors.divider, RoundedCornerShape(12.dp))
                    .clickable { showLanguageDialog = true }
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Preferred Languages",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textPrimary
                    )
                    Text(
                        text = if (selectedLanguages.isEmpty()) "English" else selectedLanguages.joinToString(", ").uppercase(),
                        fontSize = 12.sp,
                        color = colors.textSecondary
                    )
                }
                Text(
                    text = "Edit",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary
                )
            }

            Spacer(modifier = Modifier.height(36.dp))

            // Continue Button
            Button(
                onClick = {
                    prefs.setUserName(if (name.isBlank()) "Movie Lover" else name)
                    prefs.setAvatar(avatarUrl)
                    prefs.setSelectedGenres(if (selectedGenres.isEmpty()) setOf("Action", "Sci-Fi") else selectedGenres.toSet())
                    prefs.setSelectedLanguages(if (selectedLanguages.isEmpty()) setOf("en") else selectedLanguages.toSet())
                    prefs.setOnboarded(true)
                    onComplete()
                },
                colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(
                    text = "Get Started",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }

    // Language Search Modal Dialog
    if (showLanguageDialog) {
        var query by remember { mutableStateOf("") }
        val filtered = CatalogData.ALL_LANGUAGES.filter {
            it.label.contains(query, ignoreCase = true) || it.value.contains(query, ignoreCase = true)
        }

        Dialog(onDismissRequest = { showLanguageDialog = false }) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .fillMaxHeight(0.75f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(colors.surfaceContainer)
                    .border(1.dp, colors.divider, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(modifier = Modifier.fillMaxSize()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Choose Languages",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        IconButton(onClick = { showLanguageDialog = false }) {
                            Icon(Icons.Rounded.Close, contentDescription = "Close", tint = colors.textSecondary)
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = query,
                        onValueChange = { query = it },
                        placeholder = { Text("Search languages...", color = colors.textSecondary) },
                        leadingIcon = { Icon(Icons.Rounded.Search, contentDescription = null, tint = colors.textSecondary) },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    LazyColumn(modifier = Modifier.weight(1f)) {
                        items(filtered) { lang ->
                            val selected = selectedLanguages.contains(lang.value)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        if (selected) selectedLanguages.remove(lang.value)
                                        else selectedLanguages.add(lang.value)
                                    }
                                    .padding(vertical = 12.dp, horizontal = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = lang.label,
                                    fontSize = 14.sp,
                                    color = if (selected) colors.primary else colors.textPrimary,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                )
                                if (selected) {
                                    Icon(
                                        imageVector = Icons.Rounded.Check,
                                        contentDescription = "Selected",
                                        tint = colors.primary,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { showLanguageDialog = false },
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Done", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
