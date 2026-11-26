WHAT'S NEW IN CINEMORA v2.3.19

  • Secure In-App Update & Installation System
    Restored in-app APK update downloading and user-approved native Android installation, showing release notes, APK size, live download progress, and cancel support.

  • Mandatory Certificate Pinning & Package Verification
    Every downloaded APK is independently inspected via Android PackageManager before installation, verifying package ID (com.jeessunny.cinemora), newer version, and exact SHA-256 match against Cinemora's permanent release signing certificate.

  • Strict HTTPS & Private Update Cache Scope
    All update API calls, redirects, and APK downloads enforce HTTPS-only GitHub hosts, store temporary downloads in private app cache, clean incomplete files on error or cancellation, and restrict FileProvider strictly to the cache updates directory.
