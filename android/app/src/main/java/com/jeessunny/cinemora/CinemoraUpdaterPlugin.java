package com.jeessunny.cinemora;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "CinemoraUpdater")
public class CinemoraUpdaterPlugin extends Plugin {

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    private File getUpdatesDir() {
        File dir = new File(getContext().getCacheDir(), "updates");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }

    private File getUpdateApkFile() {
        return new File(getUpdatesDir(), "cinemora-update.apk");
    }

    @PluginMethod
    public void canInstallPackages(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ret.put("canInstall", getContext().getPackageManager().canRequestPackageInstalls());
        } else {
            ret.put("canInstall", true);
        }
        call.resolve(ret);
    }

    private void launchInstallPermissionSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            } catch (Exception e) {
                Intent fallback = new Intent(Settings.ACTION_SECURITY_SETTINGS);
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(fallback);
            }
        }
    }

    @PluginMethod
    public void requestInstallPermission(PluginCall call) {
        launchInstallPermissionSettings();
        call.resolve();
    }

    @PluginMethod
    public void downloadApk(PluginCall call) {
        String downloadUrl = call.getString("url");
        if (downloadUrl == null || downloadUrl.isEmpty()) {
            call.reject("Download URL is required");
            return;
        }

        call.resolve(); // Acknowledge start immediately

        executor.execute(() -> {
            HttpURLConnection connection = null;
            InputStream inputStream = null;
            FileOutputStream outputStream = null;
            try {
                // Immediate initial progress emission
                JSObject initialProgress = new JSObject();
                initialProgress.put("percent", 0);
                initialProgress.put("bytesDownloaded", 0);
                initialProgress.put("totalBytes", 0);
                notifyListeners("downloadProgress", initialProgress);

                URL url = new URL(downloadUrl);
                connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(25000);
                connection.setReadTimeout(60000);
                connection.setInstanceFollowRedirects(true);
                connection.setRequestProperty("User-Agent", "Cinemora-Updater");
                connection.connect();

                int responseCode = connection.getResponseCode();
                // Handle 3xx redirects
                if (responseCode == HttpURLConnection.HTTP_MOVED_PERM ||
                    responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                    responseCode == 307 || responseCode == 308) {
                    String newUrl = connection.getHeaderField("Location");
                    connection.disconnect();
                    url = new URL(newUrl);
                    connection = (HttpURLConnection) url.openConnection();
                    connection.setConnectTimeout(25000);
                    connection.setReadTimeout(60000);
                    connection.setRequestProperty("User-Agent", "Cinemora-Updater");
                    connection.connect();
                    responseCode = connection.getResponseCode();
                }

                if (responseCode != HttpURLConnection.HTTP_OK) {
                    JSObject err = new JSObject();
                    err.put("error", "Server returned HTTP " + responseCode);
                    notifyListeners("downloadError", err);
                    return;
                }

                long fileLength = connection.getContentLengthLong();
                File targetFile = getUpdateApkFile();
                if (targetFile.exists()) {
                    targetFile.delete();
                }

                inputStream = connection.getInputStream();
                outputStream = new FileOutputStream(targetFile);

                byte[] buffer = new byte[32 * 1024];
                int count;
                long total = 0;
                int lastPercent = 0;

                while ((count = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, count);
                    total += count;

                    if (fileLength > 0) {
                        int percent = (int) ((total * 100) / fileLength);
                        if (percent > lastPercent || percent == 100) {
                            lastPercent = percent;
                            JSObject prog = new JSObject();
                            prog.put("percent", percent);
                            prog.put("bytesDownloaded", total);
                            prog.put("totalBytes", fileLength);
                            notifyListeners("downloadProgress", prog);
                        }
                    } else {
                        JSObject prog = new JSObject();
                        prog.put("percent", -1);
                        prog.put("bytesDownloaded", total);
                        prog.put("totalBytes", -1);
                        notifyListeners("downloadProgress", prog);
                    }
                }

                outputStream.flush();

                JSObject complete = new JSObject();
                complete.put("success", true);
                complete.put("filePath", targetFile.getAbsolutePath());
                complete.put("fileSize", targetFile.length());
                notifyListeners("downloadCompleted", complete);

            } catch (Exception e) {
                JSObject err = new JSObject();
                err.put("error", e.getMessage() != null ? e.getMessage() : "Download error");
                notifyListeners("downloadError", err);
            } finally {
                try {
                    if (outputStream != null) outputStream.close();
                    if (inputStream != null) inputStream.close();
                    if (connection != null) connection.disconnect();
                } catch (Exception ignored) {}
            }
        });
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        try {
            File apkFile = getUpdateApkFile();
            if (!apkFile.exists()) {
                call.reject("Downloaded APK file not found at " + apkFile.getAbsolutePath());
                return;
            }

            Context context = getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.getPackageManager().canRequestPackageInstalls()) {
                    launchInstallPermissionSettings();
                    JSObject ret = new JSObject();
                    ret.put("needsPermission", true);
                    call.resolve(ret);
                    return;
                }
            }

            String authority = context.getPackageName() + ".fileprovider";
            Uri contentUri = FileProvider.getUriForFile(context, authority, apkFile);

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(contentUri, "application/vnd.android.package-archive");
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            context.startActivity(installIntent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to trigger installation: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openBrowser(PluginCall call) {
        try {
            String url = call.getString("url", "https://github.com/jeessunny/cinemora/releases/latest");
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(browserIntent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open browser: " + e.getMessage());
        }
    }
}
