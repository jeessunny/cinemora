package com.jeessunny.cinemora

import com.jeessunny.cinemora.service.UpdateManager
import com.jeessunny.cinemora.service.UpdateManager.ApkAssetCandidate
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class UpdateManagerTest {

    @Test
    fun testVersionComparison() {
        assertFalse(UpdateManager.isNewer("v2.3.19", "2.3.19"))
        assertFalse(UpdateManager.isNewer("v2.3.18", "2.3.19"))
        assertTrue(UpdateManager.isNewer("v2.3.20", "2.3.19"))
        assertTrue(UpdateManager.isNewer("v2.4.0", "2.3.19"))
        assertTrue(UpdateManager.isNewer("3.0.0", "2.3.19"))
        assertTrue(UpdateManager.isNewer("v2.3.19", "2.3.19-beta1"))
        assertFalse(UpdateManager.isNewer("v2.3.19-beta1", "2.3.19"))
    }

    @Test
    fun testStableReleaseFilteringIgnoresDraftsAndPrereleases() {
        assertTrue(UpdateManager.isStableRelease(draft = false, prerelease = false))
        assertFalse(UpdateManager.isStableRelease(draft = true, prerelease = false))
        assertFalse(UpdateManager.isStableRelease(draft = false, prerelease = true))
        assertFalse(UpdateManager.isStableRelease(draft = true, prerelease = true))
    }

    @Test
    fun testApkAssetSelectionPrefersSignedReleaseApk() {
        val candidates = listOf(
            ApkAssetCandidate(
                name = "cinemora-release-unsigned.apk",
                downloadUrl = "https://github.com/jeessunny/cinemora/releases/download/v2.3.19/cinemora-release-unsigned.apk",
                size = 100L
            ),
            ApkAssetCandidate(
                name = "cinemora-release.apk",
                downloadUrl = "https://github.com/jeessunny/cinemora/releases/download/v2.3.19/cinemora-release.apk",
                size = 15954534L
            ),
            ApkAssetCandidate(
                name = "cinemora-release.apk.sha256",
                downloadUrl = "https://github.com/jeessunny/cinemora/releases/download/v2.3.19/cinemora-release.apk.sha256",
                size = 87L
            )
        )

        val selected = UpdateManager.selectApkAsset(candidates)
        assertNotNull(selected)
        assertTrue(selected!!.first.endsWith("cinemora-release.apk"))
        assertEquals(15954534L, selected.second)
    }

    @Test
    fun testApkAssetSelectionRejectsCleartextAndUnsignedOnly() {
        val cleartextOnly = listOf(
            ApkAssetCandidate(
                name = "cinemora-release.apk",
                downloadUrl = "http://github.com/jeessunny/cinemora/releases/download/v2.3.19/cinemora-release.apk",
                size = 123L
            )
        )
        assertNull(UpdateManager.selectApkAsset(cleartextOnly))

        val unsignedOnly = listOf(
            ApkAssetCandidate(
                name = "cinemora-release-unsigned.apk",
                downloadUrl = "https://github.com/jeessunny/cinemora/releases/download/v2.3.19/cinemora-release-unsigned.apk",
                size = 123L
            )
        )
        assertNull(UpdateManager.selectApkAsset(unsignedOnly))
    }

    @Test
    fun testTrustedDownloadUrlValidation() {
        assertTrue(UpdateManager.isTrustedDownloadUrl("https://api.github.com/repos/jeessunny/cinemora/releases/latest"))
        assertTrue(UpdateManager.isTrustedDownloadUrl("https://github.com/jeessunny/cinemora/releases/download/v2.3.19/cinemora-release.apk"))
        assertTrue(UpdateManager.isTrustedDownloadUrl("https://objects.githubusercontent.com/github-production-release-asset/12345"))

        assertFalse(UpdateManager.isTrustedDownloadUrl("http://github.com/jeessunny/cinemora/releases/download/v2.3.19/cinemora-release.apk"))
        assertFalse(UpdateManager.isTrustedDownloadUrl("https://evil.example.com/cinemora-release.apk"))
        assertFalse(UpdateManager.isTrustedDownloadUrl("https://github.com/other/repo/releases/download/v1.0/app.apk"))
    }

    @Test
    fun testVerifyParsedApkMetadataAcceptsValidTrustedUpdate() {
        val result = UpdateManager.verifyParsedApkMetadata(
            apkPackageName = "com.jeessunny.cinemora",
            expectedPackageName = "com.jeessunny.cinemora",
            apkVersionCode = 20320L,
            installedVersionCode = 20319L,
            apkVersionName = "2.3.20",
            installedVersionName = "2.3.19",
            certFingerprintsSha256 = listOf(UpdateManager.TRUSTED_CERT_SHA256)
        )
        assertTrue(result.isSuccess)
    }

    @Test
    fun testVerifyParsedApkMetadataRejectsWrongCertificate() {
        val result = UpdateManager.verifyParsedApkMetadata(
            apkPackageName = "com.jeessunny.cinemora",
            expectedPackageName = "com.jeessunny.cinemora",
            apkVersionCode = 20320L,
            installedVersionCode = 20319L,
            apkVersionName = "2.3.20",
            installedVersionName = "2.3.19",
            certFingerprintsSha256 = listOf("DEADBEEF00000000000000000000000000000000000000000000000000000000")
        )
        assertTrue(result.isFailure)
    }

    @Test
    fun testVerifyParsedApkMetadataRejectsWrongPackageName() {
        val result = UpdateManager.verifyParsedApkMetadata(
            apkPackageName = "com.evil.impostor",
            expectedPackageName = "com.jeessunny.cinemora",
            apkVersionCode = 20320L,
            installedVersionCode = 20319L,
            apkVersionName = "2.3.20",
            installedVersionName = "2.3.19",
            certFingerprintsSha256 = listOf(UpdateManager.TRUSTED_CERT_SHA256)
        )
        assertTrue(result.isFailure)
    }

    @Test
    fun testVerifyParsedApkMetadataRejectsOutdatedOrEqualVersion() {
        val equalVersion = UpdateManager.verifyParsedApkMetadata(
            apkPackageName = "com.jeessunny.cinemora",
            expectedPackageName = "com.jeessunny.cinemora",
            apkVersionCode = 20319L,
            installedVersionCode = 20319L,
            apkVersionName = "2.3.19",
            installedVersionName = "2.3.19",
            certFingerprintsSha256 = listOf(UpdateManager.TRUSTED_CERT_SHA256)
        )
        assertTrue(equalVersion.isFailure)

        val olderVersion = UpdateManager.verifyParsedApkMetadata(
            apkPackageName = "com.jeessunny.cinemora",
            expectedPackageName = "com.jeessunny.cinemora",
            apkVersionCode = 20318L,
            installedVersionCode = 20319L,
            apkVersionName = "2.3.18",
            installedVersionName = "2.3.19",
            certFingerprintsSha256 = listOf(UpdateManager.TRUSTED_CERT_SHA256)
        )
        assertTrue(olderVersion.isFailure)
    }
}
