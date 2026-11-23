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

    @Test
    fun testHeroItemsHasBothMoviesAndSeries() {
        val heroItems = CatalogData.getHeroItems(allowSeries = true)
        assertTrue(heroItems.any { it.type == "movie" })
        assertTrue(heroItems.any { it.type == "tv" })
    }

    @Test
    fun testHeroItemsMoviesOnly() {
        val heroItems = CatalogData.getHeroItems(allowSeries = false)
        assertTrue(heroItems.isNotEmpty())
        assertTrue(heroItems.all { it.type == "movie" })
    }

    @Test
    fun testEpisodesChangeAcrossSeasons() {
        val season1 = CatalogData.getEpisodesForSeason(201, 1)
        val season2 = CatalogData.getEpisodesForSeason(201, 2)
        assertTrue(season1.isNotEmpty())
        assertTrue(season2.isNotEmpty())
        // Titles and IDs must differ
        assertFalse(season1.first().name == season2.first().name)
        assertFalse(season1.first().id == season2.first().id)
    }
}
