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
}
