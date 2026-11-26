package com.jeessunny.cinemora.service

import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.jeessunny.cinemora.BuildConfig
import com.jeessunny.cinemora.model.UpdateInfo
import com.jeessunny.cinemora.model.UpdateState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URI
import java.net.URL
import java.security.MessageDigest

object UpdateManager {

    internal const val EXPECTED_PACKAGE_NAME = "com.jeessunny.cinemora"
    internal const val TRUSTED_CERT_SHA256 =
        "031591007721CFF3364A0DA79C611F26BC89B5E6FB9D4BED9DC251D8465900B8"
    private const val CACHE_SUBDIR = "updates"
    private const val UPDATE_APK_FILENAME = "cinemora-update.apk"
    private const val MAX_REDIRECTS = 5

    private val TRUSTED_DOWNLOAD_HOSTS = setOf(
        "api.github.com",
        "github.com",
        "www.github.com",
        "objects.githubusercontent.com",
        "release-assets.githubusercontent.com",
        "github-releases.githubusercontent.com"
    )

    private val _updateState = MutableStateFlow<UpdateState>(UpdateState.Idle)
    val updateState: StateFlow<UpdateState> = _updateState.asStateFlow()

    private val _showDialog = MutableStateFlow(false)
    val showDialog: StateFlow<Boolean> = _showDialog.asStateFlow()

    @Volatile
    private var downloadCancelled = false

    private val fallbackReleaseUrl: String
        get() = "https://github.com/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/releases/latest"

    fun dismissDialog() {
        _showDialog.value = false
    }

    fun openDialog() {
        _showDialog.value = true
    }

    fun cancelDownload() {
        downloadCancelled = true
    }

    fun resetToAvailable(info: UpdateInfo) {
        _updateState.value = UpdateState.Available(info)
    }

    fun clearUpdateCache(context: Context) {
        CoroutineScope(Dispatchers.IO).launch {
            runCatching {
                File(context.cacheDir, CACHE_SUBDIR).listFiles()?.forEach { it.delete() }
            }
        }
    }

    private data class ParsedVersion(val parts: List<Int>, val isPreRelease: Boolean)

    private fun parseVersion(raw: String): ParsedVersion {
        val cleaned = raw.removePrefix("v").removePrefix("V").trim()
        val dashIdx = cleaned.indexOf('-')
        val base = if (dashIdx >= 0) cleaned.substring(0, dashIdx) else cleaned
        val parts = base.split(".").map { it.toIntOrNull() ?: 0 }
        return ParsedVersion(parts, dashIdx >= 0)
    }

    internal fun isNewer(remote: String, current: String): Boolean {
        val l = parseVersion(remote)
        val c = parseVersion(current)
        if (l.parts.all { it == 0 }) return false
        val maxLen = maxOf(l.parts.size, c.parts.size)
        for (i in 0 until maxLen) {
            val a = l.parts.getOrElse(i) { 0 }
            val b = c.parts.getOrElse(i) { 0 }
            if (a != b) return a > b
        }
        return c.isPreRelease && !l.isPreRelease
    }

    internal fun isStableRelease(releaseJson: JSONObject): Boolean {
        return !releaseJson.optBoolean("draft", false) &&
            !releaseJson.optBoolean("prerelease", false)
    }

    internal fun isTrustedDownloadUrl(candidateUrl: String): Boolean {
        val trimmed = candidateUrl.trim()
        if (trimmed.isEmpty()) return false
        return try {
            val parsed = URI(trimmed)
            if (!parsed.scheme.equals("https", ignoreCase = true)) return false
            val host = parsed.host?.lowercase() ?: return false
            if (!TRUSTED_DOWNLOAD_HOSTS.contains(host)) return false
            if (host == "github.com" || host == "www.github.com") {
                val path = parsed.path ?: return false
                path.startsWith("/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/")
            } else if (host == "api.github.com") {
                val path = parsed.path ?: return false
                path.startsWith("/repos/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/")
            } else {
                true
            }
        } catch (e: Exception) {
            false
        }
    }

    internal fun sanitizeReleaseUrl(candidateUrl: String): String {
        val trimmed = candidateUrl.trim()
        if (trimmed.isEmpty()) return fallbackReleaseUrl
        return try {
            val parsed = URI(trimmed)
            val schemeOk = parsed.scheme.equals("https", ignoreCase = true)
            val host = parsed.host?.lowercase() ?: ""
            val hostOk = host == "github.com" || host == "www.github.com"
            val pathOk = parsed.path?.startsWith("/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/") == true
            if (schemeOk && hostOk && pathOk) trimmed else fallbackReleaseUrl
        } catch (e: Exception) {
            fallbackReleaseUrl
        }
    }

    internal fun selectApkAsset(releaseJson: JSONObject): Pair<String, Long>? {
        val assets = releaseJson.optJSONArray("assets") ?: return null
        val candidates = mutableListOf<Triple<String, String, Long>>()
        for (i in 0 until assets.length()) {
            val asset = assets.optJSONObject(i) ?: continue
            val name = asset.optString("name", "")
            val url = asset.optString("browser_download_url", "")
            val size = asset.optLong("size", 0L)
            if (name.endsWith(".apk", ignoreCase = true) && isTrustedDownloadUrl(url)) {
                candidates.add(Triple(name, url, size))
            }
        }
        val preferred = candidates.firstOrNull { it.first.equals("cinemora-release.apk", ignoreCase = true) }
            ?: candidates.firstOrNull { it.first.contains("cinemora", ignoreCase = true) && !it.first.contains("unsigned", ignoreCase = true) }
            ?: candidates.firstOrNull { !it.first.contains("unsigned", ignoreCase = true) }
        return preferred?.let { Pair(it.second, it.third) }
    }

    internal fun sha256Hex(bytes: ByteArray): String {
        val digest = MessageDigest.getInstance("SHA-256").digest(bytes)
        return digest.joinToString("") { "%02X".format(it) }
    }

    internal fun verifyParsedApkMetadata(
        apkPackageName: String?,
        expectedPackageName: String,
        apkVersionCode: Long,
        installedVersionCode: Long,
        apkVersionName: String?,
        installedVersionName: String,
        certFingerprintsSha256: List<String>
    ): Result<Unit> {
        if (apkPackageName != expectedPackageName) {
            return Result.failure(
                SecurityException("Package name mismatch: expected $expectedPackageName but got ${apkPackageName ?: "unknown"}.")
            )
        }
        if (certFingerprintsSha256.isEmpty()) {
            return Result.failure(SecurityException("Downloaded APK has no signing certificates."))
        }
        val allTrusted = certFingerprintsSha256.any { it.equals(TRUSTED_CERT_SHA256, ignoreCase = true) }
        if (!allTrusted) {
            return Result.failure(
                SecurityException("Signing certificate fingerprint does not match Cinemora's trusted release key.")
            )
        }
        val versionNameNewer = !apkVersionName.isNullOrBlank() && isNewer(apkVersionName, installedVersionName)
        if (apkVersionCode <= installedVersionCode && !versionNameNewer) {
            return Result.failure(
                SecurityException("Downloaded APK (v${apkVersionName ?: apkVersionCode}) is not newer than installed v$installedVersionName.")
            )
        }
        return Result.success(Unit)
    }

    private fun openValidatedHttpsConnection(initialUrl: String): HttpURLConnection {
        var currentUrl = initialUrl
        for (hop in 0..MAX_REDIRECTS) {
            if (!isTrustedDownloadUrl(currentUrl)) {
                throw SecurityException("Blocked untrusted or non-HTTPS URL during update transfer.")
            }
            val conn = (URL(currentUrl).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                instanceFollowRedirects = false
                setRequestProperty("User-Agent", "Cinemora-Android")
                connectTimeout = 15000
                readTimeout = 30000
            }
            val code = conn.responseCode
            if (code in listOf(301, 302, 303, 307, 308)) {
                val location = conn.getHeaderField("Location")
                conn.disconnect()
                if (location.isNullOrBlank()) {
                    throw SecurityException("Redirect response missing Location header.")
                }
                val resolved = URI(currentUrl).resolve(location).toString()
                if (!isTrustedDownloadUrl(resolved)) {
                    throw SecurityException("Blocked redirect to untrusted or non-HTTPS destination.")
                }
                currentUrl = resolved
            } else {
                return conn
            }
        }
        throw SecurityException("Exceeded maximum HTTPS redirect hops.")
    }

    fun checkForUpdates(context: Context, isManual: Boolean = false) {
        CoroutineScope(Dispatchers.IO).launch {
            _updateState.value = UpdateState.Checking
            if (isManual) _showDialog.value = true

            var conn: HttpURLConnection? = null
            try {
                val apiUrl = "https://api.github.com/repos/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/releases/latest"
                conn = openValidatedHttpsConnection(apiUrl).apply {
                    setRequestProperty("Accept", "application/vnd.github.v3+json")
                }

                if (conn.responseCode == 200) {
                    val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(jsonStr)

                    if (!isStableRelease(json)) {
                        withContext(Dispatchers.Main) {
                            _updateState.value = UpdateState.UpToDate
                            if (isManual) _showDialog.value = true
                        }
                        return@launch
                    }

                    val tagName = json.optString("tag_name", "")
                    val body = json.optString("body", "Bug fixes and performance improvements.")
                    val safeReleaseUrl = sanitizeReleaseUrl(json.optString("html_url", ""))
                    val apkAsset = selectApkAsset(json)

                    val currentVersion = BuildConfig.APP_VERSION
                    val hasUpdate = isNewer(tagName, currentVersion)

                    withContext(Dispatchers.Main) {
                        if (hasUpdate && apkAsset != null) {
                            val info = UpdateInfo(
                                version = tagName.removePrefix("v").removePrefix("V"),
                                tagName = tagName,
                                releaseNotes = body,
                                downloadUrl = apkAsset.first,
                                releaseUrl = safeReleaseUrl,
                                fileSize = apkAsset.second
                            )
                            _updateState.value = UpdateState.Available(info)
                            _showDialog.value = true
                        } else {
                            _updateState.value = UpdateState.UpToDate
                            if (isManual) _showDialog.value = true
                        }
                    }
                } else {
                    val code = conn.responseCode
                    withContext(Dispatchers.Main) {
                        _updateState.value = UpdateState.Error("Server returned code $code", fallbackReleaseUrl)
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _updateState.value = UpdateState.Error(
                        e.localizedMessage ?: "Failed to check for updates",
                        fallbackReleaseUrl
                    )
                }
            } finally {
                conn?.disconnect()
            }
        }
    }

    fun startDownload(context: Context, updateInfo: UpdateInfo) {
        downloadCancelled = false
        CoroutineScope(Dispatchers.IO).launch {
            withContext(Dispatchers.Main) {
                _updateState.value = UpdateState.Downloading(0, 0L, updateInfo.fileSize, updateInfo)
                _showDialog.value = true
            }

            val updatesDir = File(context.cacheDir, CACHE_SUBDIR)
            if (!updatesDir.exists()) updatesDir.mkdirs()

            val partFile = File(updatesDir, "$UPDATE_APK_FILENAME.part")
            val targetFile = File(updatesDir, UPDATE_APK_FILENAME)
            if (partFile.exists()) partFile.delete()
            if (targetFile.exists()) targetFile.delete()

            var conn: HttpURLConnection? = null
            try {
                conn = openValidatedHttpsConnection(updateInfo.downloadUrl)
                val code = conn.responseCode
                if (code !in 200..299) {
                    throw IllegalStateException("Download failed with HTTP $code")
                }

                val total = if (conn.contentLengthLong > 0) conn.contentLengthLong else updateInfo.fileSize
                var downloaded = 0L
                var lastPercent = -1

                conn.inputStream.use { input ->
                    FileOutputStream(partFile).use { output ->
                        val buffer = ByteArray(64 * 1024)
                        while (true) {
                            if (downloadCancelled) {
                                break
                            }
                            val count = input.read(buffer)
                            if (count == -1) break
                            output.write(buffer, 0, count)
                            downloaded += count
                            val percent = if (total > 0) ((downloaded * 100) / total).toInt().coerceIn(0, 100) else 0
                            if (percent != lastPercent) {
                                lastPercent = percent
                                withContext(Dispatchers.Main) {
                                    _updateState.value = UpdateState.Downloading(percent, downloaded, total, updateInfo)
                                }
                            }
                        }
                        output.flush()
                    }
                }

                if (downloadCancelled) {
                    partFile.delete()
                    withContext(Dispatchers.Main) {
                        _updateState.value = UpdateState.Available(updateInfo)
                    }
                    return@launch
                }

                if (downloaded <= 0L || (conn.contentLengthLong > 0 && downloaded != conn.contentLengthLong)) {
                    partFile.delete()
                    throw IllegalStateException("Downloaded APK is incomplete.")
                }

                if (!partFile.renameTo(targetFile)) {
                    partFile.copyTo(targetFile, overwrite = true)
                    partFile.delete()
                }

                withContext(Dispatchers.Main) {
                    _updateState.value = UpdateState.Verifying(updateInfo)
                }

                val verification = verifyDownloadedApk(context, targetFile)
                if (verification.isFailure) {
                    targetFile.delete()
                    val reason = verification.exceptionOrNull()?.message ?: "APK signature verification failed."
                    withContext(Dispatchers.Main) {
                        _updateState.value = UpdateState.Error(reason, updateInfo.releaseUrl)
                    }
                    return@launch
                }

                withContext(Dispatchers.Main) {
                    _updateState.value = UpdateState.Ready(targetFile, updateInfo)
                }
            } catch (e: Exception) {
                partFile.delete()
                targetFile.delete()
                withContext(Dispatchers.Main) {
                    if (downloadCancelled) {
                        _updateState.value = UpdateState.Available(updateInfo)
                    } else {
                        _updateState.value = UpdateState.Error(
                            e.localizedMessage ?: "Download failed",
                            updateInfo.releaseUrl
                        )
                    }
                }
            } finally {
                conn?.disconnect()
            }
        }
    }

    private fun verifyDownloadedApk(context: Context, apkFile: File): Result<Unit> {
        return try {
            if (!apkFile.exists() || apkFile.length() == 0L) {
                return Result.failure(IllegalStateException("APK file is missing or empty."))
            }

            val pm = context.packageManager
            val archiveInfo: PackageInfo? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pm.getPackageArchiveInfo(apkFile.absolutePath, PackageManager.GET_SIGNING_CERTIFICATES)
            } else {
                @Suppress("DEPRECATION")
                pm.getPackageArchiveInfo(apkFile.absolutePath, PackageManager.GET_SIGNATURES)
            }

            if (archiveInfo == null) {
                return Result.failure(SecurityException("Corrupted or invalid APK archive."))
            }

            val certFingerprints = extractCertFingerprintsSha256(archiveInfo)
            val apkVersionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                archiveInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                archiveInfo.versionCode.toLong()
            }

            val installedInfo = pm.getPackageInfo(context.packageName, 0)
            val installedVersionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                installedInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                installedInfo.versionCode.toLong()
            }

            verifyParsedApkMetadata(
                apkPackageName = archiveInfo.packageName,
                expectedPackageName = EXPECTED_PACKAGE_NAME,
                apkVersionCode = apkVersionCode,
                installedVersionCode = installedVersionCode,
                apkVersionName = archiveInfo.versionName,
                installedVersionName = BuildConfig.APP_VERSION,
                certFingerprintsSha256 = certFingerprints
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun extractCertFingerprintsSha256(packageInfo: PackageInfo): List<String> {
        val signatures = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val signingInfo = packageInfo.signingInfo ?: return emptyList()
            if (signingInfo.hasMultipleSigners()) {
                signingInfo.apkContentsSigners
            } else {
                signingInfo.signingCertificateHistory
            }
        } else {
            @Suppress("DEPRECATION")
            packageInfo.signatures
        }
        return signatures?.map { sig -> sha256Hex(sig.toByteArray()) } ?: emptyList()
    }

    fun installApk(context: Context, apkFile: File, info: UpdateInfo) {
        val verification = verifyDownloadedApk(context, apkFile)
        if (verification.isFailure) {
            apkFile.delete()
            _updateState.value = UpdateState.Error(
                verification.exceptionOrNull()?.message ?: "APK verification failed.",
                info.releaseUrl
            )
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            _updateState.value = UpdateState.PermissionRequired(apkFile, info)
            return
        }

        launchNativeInstaller(context, apkFile, info)
    }

    fun openUnknownAppSourcesSettings(context: Context) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:${context.packageName}")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            }
        } catch (e: Exception) {
            _updateState.value = UpdateState.Error(
                "Unable to open install permission settings: ${e.localizedMessage}",
                fallbackReleaseUrl
            )
        }
    }

    private fun launchNativeInstaller(context: Context, apkFile: File, info: UpdateInfo) {
        try {
            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )
            val installIntent = Intent(Intent.ACTION_INSTALL_PACKAGE).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true)
                putExtra(Intent.EXTRA_RETURN_RESULT, true)
                flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
            }
            if (installIntent.resolveActivity(context.packageManager) != null) {
                context.startActivity(installIntent)
            } else {
                val viewIntent = Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(uri, "application/vnd.android.package-archive")
                    flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(viewIntent)
            }
        } catch (e: Exception) {
            _updateState.value = UpdateState.Error(
                "Failed to launch installer: ${e.localizedMessage}",
                info.releaseUrl
            )
        }
    }

    fun openReleasePage(context: Context, releaseUrl: String) {
        try {
            val safeUrl = sanitizeReleaseUrl(releaseUrl)
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(safeUrl)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            _updateState.value = UpdateState.Error("Unable to open GitHub Releases: ${e.localizedMessage}")
        }
    }
}
