package com.jeessunny.cinemora.service

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
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
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

object UpdateManager {

    private val _updateState = MutableStateFlow<UpdateState>(UpdateState.Idle)
    val updateState: StateFlow<UpdateState> = _updateState.asStateFlow()

    private val _showDialog = MutableStateFlow(false)
    val showDialog: StateFlow<Boolean> = _showDialog.asStateFlow()

    fun dismissDialog() {
        _showDialog.value = false
    }

    fun openDialog() {
        _showDialog.value = true
    }

    private fun isNewer(remote: String, current: String): Boolean {
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

    fun checkForUpdates(context: Context, isManual: Boolean = false) {
        CoroutineScope(Dispatchers.IO).launch {
            _updateState.value = UpdateState.Checking
            if (isManual) _showDialog.value = true

            try {
                val url = URL("https://api.github.com/repos/${BuildConfig.GITHUB_OWNER}/${BuildConfig.GITHUB_REPO}/releases/latest")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.setRequestProperty("Accept", "application/vnd.github.v3+json")
                conn.setRequestProperty("User-Agent", "Cinemora-Android")
                conn.connectTimeout = 10000
                conn.readTimeout = 10000

                if (conn.responseCode == 200) {
                    val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
                    val json = JSONObject(jsonStr)

                    val tagName = json.optString("tag_name", "")
                    val body = json.optString("body", "Bug fixes and performance improvements.")
                    val assets = json.optJSONArray("assets")

                    var downloadUrl = ""
                    var fileSize = 0L

                    if (assets != null) {
                        for (i in 0 until assets.length()) {
                            val asset = assets.getJSONObject(i)
                            val name = asset.optString("name", "")
                            if (name.endsWith(".apk", ignoreCase = true)) {
                                downloadUrl = asset.optString("browser_download_url", "")
                                fileSize = asset.optLong("size", 0L)
                                break
                            }
                        }
                    }

                    val currentVersion = BuildConfig.APP_VERSION
                    val hasUpdate = isNewer(tagName, currentVersion)

                    withContext(Dispatchers.Main) {
                        if (hasUpdate && downloadUrl.isNotBlank()) {
                            val info = UpdateInfo(
                                version = tagName.removePrefix("v"),
                                tagName = tagName,
                                releaseNotes = body,
                                downloadUrl = downloadUrl,
                                fileSize = fileSize
                            )
                            _updateState.value = UpdateState.Available(info)
                            _showDialog.value = true
                        } else {
                            _updateState.value = UpdateState.UpToDate
                            if (isManual) _showDialog.value = true
                        }
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        _updateState.value = UpdateState.Error("Server returned code ${conn.responseCode}")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _updateState.value = UpdateState.Error(e.localizedMessage ?: "Failed to check for updates")
                }
            }
        }
    }

    fun startDownload(context: Context, updateInfo: UpdateInfo) {
        CoroutineScope(Dispatchers.IO).launch {
            withContext(Dispatchers.Main) {
                _updateState.value = UpdateState.Downloading(0, 0, updateInfo.fileSize)
                _showDialog.value = true
            }

            try {
                val updatesDir = File(context.cacheDir, "updates")
                if (!updatesDir.exists()) updatesDir.mkdirs()

                val apkFile = File(updatesDir, "cinemora-update.apk")
                if (apkFile.exists()) apkFile.delete()

                val url = URL(updateInfo.downloadUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 15000
                conn.readTimeout = 30000
                conn.instanceFollowRedirects = true
                conn.connect()

                val total = if (conn.contentLengthLong > 0) conn.contentLengthLong else updateInfo.fileSize
                val input: InputStream = conn.inputStream
                val output = FileOutputStream(apkFile)

                val buffer = ByteArray(8192)
                var downloaded = 0L
                var count: Int
                var lastPercent = 0

                while (input.read(buffer).also { count = it } != -1) {
                    output.write(buffer, 0, count)
                    downloaded += count
                    val percent = if (total > 0) ((downloaded * 100) / total).toInt() else 0
                    if (percent != lastPercent) {
                        lastPercent = percent
                        withContext(Dispatchers.Main) {
                            _updateState.value = UpdateState.Downloading(percent, downloaded, total)
                        }
                    }
                }

                output.flush()
                output.close()
                input.close()

                withContext(Dispatchers.Main) {
                    _updateState.value = UpdateState.Ready(apkFile, updateInfo)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _updateState.value = UpdateState.Error("Download failed: ${e.localizedMessage}")
                }
            }
        }
    }

    fun installApk(context: Context, apkFile: File) {
        try {
            if (!apkFile.exists()) return

            val uri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
            }

            context.startActivity(intent)
        } catch (e: Exception) {
            _updateState.value = UpdateState.Error("Failed to launch installer: ${e.localizedMessage}")
        }
    }
}
