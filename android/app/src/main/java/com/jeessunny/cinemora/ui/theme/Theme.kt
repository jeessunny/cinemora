package com.jeessunny.cinemora.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import com.jeessunny.cinemora.R

data class CinemoraColors(
    val primary: Color,
    val background: Color,
    val surface: Color,
    val surfaceContainerLow: Color,
    val surfaceContainer: Color,
    val surfaceContainerHigh: Color,
    val surfaceContainerHighest: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val divider: Color,
    val isDark: Boolean,
    val isPitchBlack: Boolean
)

val LocalCinemoraColors = staticCompositionLocalOf {
    CinemoraColors(
        primary = Color(0xFFE50914),
        background = Color(0xFF0F0D0D),
        surface = Color(0xFF181818),
        surfaceContainerLow = Color(0xFF141414),
        surfaceContainer = Color(0xFF181818),
        surfaceContainerHigh = Color(0xFF202020),
        surfaceContainerHighest = Color(0xFF282828),
        textPrimary = Color(0xFFFFFFFF),
        textSecondary = Color(0xFFB3B3B3),
        divider = Color(0x1AFFFFFF),
        isDark = true,
        isPitchBlack = false
    )
}

fun parseColor(hex: String, default: Color = Color(0xFFE50914)): Color {
    return try {
        val clean = hex.removePrefix("#")
        val colorInt = clean.toLong(16)
        if (clean.length == 6) {
            Color(0xFF000000 or colorInt)
        } else {
            Color(colorInt)
        }
    } catch (e: Exception) {
        default
    }
}

val ACCENT_COLORS = listOf(
    Pair("Red", "#E50914"),
    Pair("Blue", "#2196F3"),
    Pair("Purple", "#9C27B0"),
    Pair("Green", "#4CAF50"),
    Pair("Orange", "#FF9800"),
    Pair("Pink", "#E91E63"),
    Pair("Teal", "#009688"),
    Pair("Amber", "#FFC107"),
    Pair("Cyan", "#00BCD4"),
    Pair("Indigo", "#3F51B5")
)

val InterFontFamily = FontFamily(
    Font(R.font.inter_regular, FontWeight.Normal),
    Font(R.font.inter_medium, FontWeight.Medium),
    Font(R.font.inter_semibold, FontWeight.SemiBold),
    Font(R.font.inter_bold, FontWeight.Bold),
    Font(R.font.inter_extrabold, FontWeight.ExtraBold)
)

private val defaultTypography = Typography()
val CinemoraTypography = Typography(
    displayLarge = defaultTypography.displayLarge.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Bold),
    displayMedium = defaultTypography.displayMedium.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Bold),
    displaySmall = defaultTypography.displaySmall.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Bold),
    headlineLarge = defaultTypography.headlineLarge.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.SemiBold),
    headlineMedium = defaultTypography.headlineMedium.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.SemiBold),
    headlineSmall = defaultTypography.headlineSmall.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.SemiBold),
    titleLarge = defaultTypography.titleLarge.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.SemiBold),
    titleMedium = defaultTypography.titleMedium.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.SemiBold),
    titleSmall = defaultTypography.titleSmall.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Medium),
    bodyLarge = defaultTypography.bodyLarge.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Normal),
    bodyMedium = defaultTypography.bodyMedium.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Normal),
    bodySmall = defaultTypography.bodySmall.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Normal),
    labelLarge = defaultTypography.labelLarge.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.SemiBold),
    labelMedium = defaultTypography.labelMedium.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Medium),
    labelSmall = defaultTypography.labelSmall.copy(fontFamily = InterFontFamily, fontWeight = FontWeight.Medium)
)

@Composable
fun CinemoraTheme(
    themeMode: String = "system",
    amoledBlack: Boolean = false,
    accentHex: String = "#E50914",
    content: @Composable () -> Unit
) {
    val systemDark = isSystemInDarkTheme()
    val isDark = when (themeMode) {
        "dark" -> true
        "light" -> false
        else -> systemDark
    }

    val isPitchBlack = isDark && amoledBlack
    val primaryColor = parseColor(accentHex)

    val customColors = when {
        isPitchBlack -> CinemoraColors(
            primary = primaryColor,
            background = Color(0xFF000000),
            surface = Color(0xFF000000),
            surfaceContainerLow = Color(0xFF000000),
            surfaceContainer = Color(0xFF000000),
            surfaceContainerHigh = Color(0xFF080808),
            surfaceContainerHighest = Color(0xFF121212),
            textPrimary = Color(0xFFFFFFFF),
            textSecondary = Color(0xFFB3B3B3),
            divider = Color(0x1FFFFFFF),
            isDark = true,
            isPitchBlack = true
        )
        isDark -> CinemoraColors(
            primary = primaryColor,
            background = Color(0xFF0F0D0D),
            surface = Color(0xFF181818),
            surfaceContainerLow = Color(0xFF141414),
            surfaceContainer = Color(0xFF181818),
            surfaceContainerHigh = Color(0xFF202020),
            surfaceContainerHighest = Color(0xFF282828),
            textPrimary = Color(0xFFFFFFFF),
            textSecondary = Color(0xFFB3B3B3),
            divider = Color(0x1AFFFFFF),
            isDark = true,
            isPitchBlack = false
        )
        else -> CinemoraColors(
            primary = primaryColor,
            background = Color(0xFFFFFFFF),
            surface = Color(0xFFF8F9FA),
            surfaceContainerLow = Color(0xFFF8F9FA),
            surfaceContainer = Color(0xFFF1F3F5),
            surfaceContainerHigh = Color(0xFFE9ECEF),
            surfaceContainerHighest = Color(0xFFDEE2E6),
            textPrimary = Color(0xFF121212),
            textSecondary = Color(0xFF495057),
            divider = Color(0x1A000000),
            isDark = false,
            isPitchBlack = false
        )
    }

    val m3ColorScheme = if (isDark) {
        darkColorScheme(
            primary = customColors.primary,
            background = customColors.background,
            surface = customColors.surface,
            onPrimary = Color.White,
            onBackground = customColors.textPrimary,
            onSurface = customColors.textPrimary
        )
    } else {
        lightColorScheme(
            primary = customColors.primary,
            background = customColors.background,
            surface = customColors.surface,
            onPrimary = Color.White,
            onBackground = customColors.textPrimary,
            onSurface = customColors.textPrimary
        )
    }

    CompositionLocalProvider(LocalCinemoraColors provides customColors) {
        MaterialTheme(
            colorScheme = m3ColorScheme,
            typography = CinemoraTypography
        ) {
            CompositionLocalProvider(
                LocalTextStyle provides LocalTextStyle.current.copy(fontFamily = InterFontFamily),
                content = content
            )
        }
    }
}
