WHAT'S NEW IN CINEMORA v2.3.18

  • Security Hardening & Manifest Cleanup
    Removed REQUEST_INSTALL_PACKAGES permission, FileProvider external-storage path exposures, and unused legacy WebView/Cordova layout and configuration artifacts.

  • Strict HTTPS Network Security
    Set usesCleartextTraffic to false and added a dedicated Network Security Configuration permitting HTTPS connections with system certificate authorities only.

  • Verified GitHub Releases Update Checker
    Synchronized BuildConfig APP_VERSION dynamically with versionName (2.3.18) and updated release checking to open the verified GitHub Releases page safely in the browser instead of downloading APK files in-app.

  • Hardened Backup Configuration
    Disabled automatic backup extraction (allowBackup=false) for local app preferences.
