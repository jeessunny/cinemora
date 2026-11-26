package com.jeessunny.cinemora

import com.jeessunny.cinemora.service.UpdateManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdateManagerTest {

    @Test
    fun testVersionComparison() {
        assertFalse(UpdateManager.isNewer("v2.3.18", "2.3.18"))
        assertFalse(UpdateManager.isNewer("v2.3.17", "2.3.18"))
        assertTrue(UpdateManager.isNewer("v2.3.19", "2.3.18"))
        assertTrue(UpdateManager.isNewer("v2.4.0", "2.3.18"))
        assertTrue(UpdateManager.isNewer("3.0.0", "2.3.18"))
    }

    @Test
    fun testSanitizeReleaseUrlAllowsOfficialGitHubReleaseHttps() {
        val validUrl = "https://github.com/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/releases/tag/v2.3.18"
        assertEquals(validUrl, UpdateManager.sanitizeReleaseUrl(validUrl))
    }

    @Test
    fun testSanitizeReleaseUrlRejectsCleartextAndUntrustedHosts() {
        val expectedFallback = "https://github.com/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/releases/latest"

        assertEquals(
            expectedFallback,
            UpdateManager.sanitizeReleaseUrl("http://github.com/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/releases/tag/v2.3.18")
        )
        assertEquals(
            expectedFallback,
            UpdateManager.sanitizeReleaseUrl("https://evil.example.com/fake.apk")
        )
        assertEquals(
            expectedFallback,
            UpdateManager.sanitizeReleaseUrl("https://github.com/untrusted/repo/releases/tag/v2.3.18")
        )
        assertEquals(expectedFallback, UpdateManager.sanitizeReleaseUrl(""))
    }
}
