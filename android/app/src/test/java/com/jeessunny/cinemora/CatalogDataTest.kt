package com.jeessunny.cinemora

import com.jeessunny.cinemora.data.CatalogData
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CatalogDataTest {

    @Test
    fun testCatalogNotEmpty() {
        assertTrue(CatalogData.LOCAL_CATALOG.isNotEmpty())
    }

    @Test
    fun testGenreData() {
        val movies = CatalogData.getMoviesByGenreId(28) // Action
        assertFalse(movies.isEmpty())
    }

    @Test
    fun testSearchCatalog() {
        val results = CatalogData.searchMovies("interstellar")
        assertTrue(results.any { it.title.contains("Interstellar", ignoreCase = true) })
    }

    @Test
    fun testSeriesCatalogNotEmpty() {
        val series = CatalogData.getSeries()
        assertTrue(series.size >= 10)
        assertTrue(series.all { it.type == "tv" })
    }

    @Test
    fun testMoviesOnlyFilter() {
        val movies = CatalogData.getMoviesOnly()
        assertTrue(movies.isNotEmpty())
        assertTrue(movies.all { it.type == "movie" })
    }

    @Test
    fun testTrendingSeries() {
        val trendingSeries = CatalogData.getTrendingSeries()
        assertTrue(trendingSeries.isNotEmpty())
        assertTrue(trendingSeries.all { it.type == "tv" })
    }

    @Test
    fun testSearchSeries() {
        val results = CatalogData.searchMovies("stranger", type = "tv")
        assertTrue(results.isNotEmpty())
        assertTrue(results.all { it.type == "tv" })
    }

    @Test
    fun testAllowSeriesToggle() {
        val allItems = CatalogData.getTrending(allowSeries = true)
        val moviesOnly = CatalogData.getTrending(allowSeries = false)
        assertTrue(allItems.any { it.type == "tv" })
        assertTrue(moviesOnly.none { it.type == "tv" })
    }
}
