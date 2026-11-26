package com.jeessunny.cinemora.service

import android.content.Context
import android.content.Intent
import android.net.Uri
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
import java.net.HttpURLConnection
import java.net.URI
import java.net.URL

object UpdateManager {

    private val _updateState = MutableStateFlow<UpdateState>(UpdateState.Idle)
    val updateState: StateFlow<UpdateState> = _updateState.asStateFlow()

    private val _showDialog = MutableStateFlow(false)
    val showDialog: StateFlow<Boolean> = _showDialog.asStateFlow()

    private val fallbackReleaseUrl: String
        get() = "https://github.com/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/releases/latest"

    fun dismissDialog() {
        _showDialog.value = false
    }

    fun openDialog() {
        _showDialog.value = true
    }

    internal fun isNewer(remote: String, current: String): Boolean {
        val cleanRemote = remote.removePrefix("v").removePrefix("V").trim()
        val cleanCurrent = current.removePrefix("v").removePrefix("V").trim()
        if (cleanRemote == cleanCurrent) return false

        val rParts = cleanRemote.split(".").map { it.toIntOrNull() ?: 0 }
        val cParts = cleanCurrent.split(".").map { it.toIntOrNull() ?: 0 }
        val maxLen = maxOf(rParts.size, cParts.size)

        for (i in 0 until maxLen) {
            val r = rParts.getOrElse(i) { 0 }
            val c = cParts.getOrElse(i) { 0 }
            if (r > c) return true
            if (r < c) return false
        }
        return false
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

    fun checkForUpdates(context: Context, isManual: Boolean = false) {
        CoroutineScope(Dispatchers.IO).launch {
            _updateState.value = UpdateState.Checking
            if (isManual) _showDialog.value = true

            var conn: HttpURLConnection? = null
            try {
                val url = URL("https://api.github.com/repos/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/releases/latest")
                conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    instanceFollowRedirects = false
                    setRequestProperty("Accept", "application/vnd.github.v3+json")
                    setRequestProperty("User-Agent", "Cinemora-Android")
                    connectTimeout = 10000
                    readTimeout = 10000
                }

                if (conn.responseCode == 200) {
                    val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(jsonStr)

                    val tagName = json.optString("tag_name", "")
                    val body = json.optString("body", "Bug fixes and performance improvements.")
                    val safeReleaseUrl = sanitizeReleaseUrl(json.optString("html_url", ""))

                    val currentVersion = BuildConfig.APP_VERSION
                    val hasUpdate = isNewer(tagName, currentVersion)

                    withContext(Dispatchers.Main) {
                        if (hasUpdate) {
                            val info = UpdateInfo(
                                version = tagName.removePrefix("v").removePrefix("V"),
                                tagName = tagName,
                                releaseNotes = body,
                                releaseUrl = safeReleaseUrl
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
                        _updateState.value = UpdateState.Error("Server returned code $code")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _updateState.value = UpdateState.Error(e.localizedMessage ?: "Failed to check for updates")
                }
            } finally {
                conn?.disconnect()
            }
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
