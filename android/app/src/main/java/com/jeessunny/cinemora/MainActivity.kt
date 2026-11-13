package com.jeessunny.cinemora

import android.os.Build
import android.os.Bundle
import android.view.Window
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.jeessunny.cinemora.data.PreferencesManager
import com.jeessunny.cinemora.service.UpdateManager
import com.jeessunny.cinemora.ui.components.CinemoraNavBar
import com.jeessunny.cinemora.ui.components.UpdateDialogView
import com.jeessunny.cinemora.ui.screens.*
import com.jeessunny.cinemora.ui.theme.CinemoraTheme
import com.jeessunny.cinemora.ui.theme.LocalCinemoraColors

class MainActivity : ComponentActivity() {

    private lateinit var prefs: PreferencesManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = PreferencesManager(this)

        enableEdgeToEdgeFullscreen()

        // Background update check on launch
        UpdateManager.checkForUpdates(this, isManual = false)

        setContent {
            val themeMode by prefs.themeMode.collectAsState()
            val amoledBlack by prefs.amoledBlack.collectAsState()
            val accentColor by prefs.accentColor.collectAsState()

            CinemoraTheme(
                themeMode = themeMode,
                amoledBlack = amoledBlack,
                accentHex = accentColor
            ) {
                CinemoraApp(prefs = prefs)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        enableEdgeToEdgeFullscreen()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            enableEdgeToEdgeFullscreen()
        }
    }

    private fun enableEdgeToEdgeFullscreen() {
        try {
            val window: Window = window

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val layoutParams = window.attributes
                layoutParams.layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                window.attributes = layoutParams
            }

            WindowCompat.setDecorFitsSystemWindows(window, false)

            window.statusBarColor = android.graphics.Color.TRANSPARENT
            window.navigationBarColor = android.graphics.Color.TRANSPARENT

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                window.isNavigationBarContrastEnforced = false
                window.isStatusBarContrastEnforced = false
            }

            val insetsController = WindowInsetsControllerCompat(window, window.decorView)
            insetsController.hide(WindowInsetsCompat.Type.systemBars())
            insetsController.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } catch (e: Exception) {
            // Edge-to-edge fallback
        }
    }
}

@Composable
fun CinemoraApp(prefs: PreferencesManager) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "home"

    val floatingNavBar by prefs.floatingNavBar.collectAsState()
    val isOnboarded by prefs.isOnboarded.collectAsState()

    val startDestination = if (isOnboarded) "home" else "login"

    val isTopLevelRoute = currentRoute in listOf("home", "search", "library", "settings")
    val colors = LocalCinemoraColors.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.fillMaxSize()
        ) {
            composable("login") {
                LoginScreen(
                    prefs = prefs,
                    onComplete = {
                        navController.navigate("home") {
                            popUpTo("login") { inclusive = true }
                        }
                    }
                )
            }

            composable("home") {
                HomeScreen(
                    prefs = prefs,
                    onMovieClick = { movie ->
                        val route = if (movie.type == "tv") "series/${movie.id}" else "movie/${movie.id}"
                        navController.navigate(route)
                    },
                    onAvatarClick = { navController.navigate("settings") }
                )
            }

            composable("search") {
                SearchScreen(
                    prefs = prefs,
                    onMovieClick = { movie ->
                        val route = if (movie.type == "tv") "series/${movie.id}" else "movie/${movie.id}"
                        navController.navigate(route)
                    }
                )
            }

            composable("library") {
                LibraryScreen(
                    prefs = prefs,
                    onMovieClick = { movie ->
                        val route = if (movie.type == "tv") "series/${movie.id}" else "movie/${movie.id}"
                        navController.navigate(route)
                    },
                    onFindMovies = { navController.navigate("search") }
                )
            }

            composable("settings") {
                SettingsScreen(
                    prefs = prefs,
                    onEditProfile = {
                        navController.navigate("login")
                    },
                    onLogout = {
                        navController.navigate("login") {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            composable(
                route = "movie/{id}",
                arguments = listOf(navArgument("id") { type = NavType.IntType })
            ) { backStackEntry ->
                val movieId = backStackEntry.arguments?.getInt("id") ?: 101
                MovieDetailsScreen(
                    movieId = movieId,
                    prefs = prefs,
                    onBack = { navController.popBackStack() },
                    onMovieClick = { sim ->
                        val route = if (sim.type == "tv") "series/${sim.id}" else "movie/${sim.id}"
                        navController.navigate(route)
                    }
                )
            }

            composable(
                route = "series/{id}",
                arguments = listOf(navArgument("id") { type = NavType.IntType })
            ) { backStackEntry ->
                val seriesId = backStackEntry.arguments?.getInt("id") ?: 107
                SeriesDetailsScreen(
                    seriesId = seriesId,
                    prefs = prefs,
                    onBack = { navController.popBackStack() },
                    onMovieClick = { sim ->
                        val route = if (sim.type == "tv") "series/${sim.id}" else "movie/${sim.id}"
                        navController.navigate(route)
                    }
                )
            }
        }

        // Floating / Fixed Capsule Navigation Bar
        if (isTopLevelRoute) {
            CinemoraNavBar(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    if (route != currentRoute) {
                        navController.navigate(route) {
                            popUpTo("home") { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                floating = floatingNavBar,
                modifier = Modifier.align(Alignment.BottomCenter)
            )
        }

        // Global Update Modal Dialog
        UpdateDialogView()
    }
}
