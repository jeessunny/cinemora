# Cinemora 🎬

[![Android Release](https://img.shields.io/github/v/release/jeessunny/cinemora?label=Android%20APK&color=E50914&logo=android)](https://github.com/jeessunny/cinemora/releases)
[![Build & Release Android APK](https://github.com/jeessunny/cinemora/actions/workflows/build-apk.yml/badge.svg)](https://github.com/jeessunny/cinemora/actions/workflows/build-apk.yml)
[![Website](https://img.shields.io/badge/Website-cinemora--swart.vercel.app-E50914?logo=vercel)](https://cinemora-swart.vercel.app/)
[![Platform](https://img.shields.io/badge/Platform-100%25%20Kotlin%20Compose-purple?logo=android)](https://github.com/jeessunny/cinemora)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Cinemora** is a fast, beautiful movie and series discovery native Android application built entirely with **100% Kotlin and Jetpack Compose (Material 3)**. Designed with a cinema-first aesthetic, Cinemora delivers personalized movie suggestions, customizable home rails, pure pitch black AMOLED dark mode, and an automated in-app updater.

---

## ✨ Features

- ⚡ **100% Native Kotlin & Jetpack Compose**: Pure modern Android application with zero webview overhead, smooth 120Hz scrolling, and instant startup.
- 🎬 **Cinema-Themed App Icon**: Beautiful high-resolution cinema launcher icon featuring 3D clapperboard, glowing film reel, and adaptive icon layers.
- 🖤 **Pure Pitch Black (AMOLED Mode)**: True `#000000` pitch black background and container styling engineered for OLED displays and battery efficiency.
- 🔲 **Edge-to-Edge Immersive Fullscreen**: True edge-to-edge layout supporting Android gesture navigation and camera cutouts with transparent system bars.
- 📚 **Media Library**: Dedicated Library tab with categorized movie and TV discovery, fast local filtering, and search history.
- 🔄 **In-App Updater**:
  - Automated GitHub Releases checking via `api.github.com`.
  - Background streaming APK download with live percentage and MB progress indicators.
  - Native Android Package Installer integration using `FileProvider` with unknown-sources permission validation.
  - Silent update checks on startup + manual "Check for Updates" button in Settings.
- 🎨 **Material 3 Customization**:
  - 10 accent color palettes (Netflix Red, Electric Blue, Emerald Green, Cyberpunk Purple, Amber, and more).
  - Floating pill or fixed bottom navigation bar with matching theme border outline.
  - Customizable home screen rails with smooth spring animations.
  - Configurable system status bar visibility with smooth animated transition.
- 💾 **Local-First Reliability**: Pure local state persistence via SharedPreferences and Kotlin Coroutines StateFlow. Zero startup crashes, instant screen rendering, and full offline accessibility.
- 🚀 **Reproducible Build & Offline Release Signing**: GitHub Actions compiles clean unsigned release artifacts while production APK signing and `apksigner` verification remain strictly offline under private developer custody.

---

## 🛠️ Tech Stack

- **Language**: Kotlin 1.9.22
- **UI Toolkit**: Jetpack Compose (BOM 2024.02.01, Material 3 1.2.0)
- **Image Loading**: Coil 2.6.0 (SVG decoding + disk caching)
- **Navigation**: Jetpack Navigation Compose 2.7.7
- **Target SDK**: Android 14 (API 34)
- **Build System**: Gradle 8.2 & Android Gradle Plugin 8.2.1
- **CI/CD**: GitHub Actions (`build-apk.yml`)

---

## 📥 Download Latest APK

Get the latest release APK from the [Releases](https://github.com/jeessunny/cinemora/releases) tab:

1. Download [`cinemora-release.apk`](https://github.com/jeessunny/cinemora/releases/latest/download/cinemora-release.apk).
2. Open the APK on your Android device.
3. Allow *Install unknown apps* if prompted by Android.
4. Enjoy Cinemora! Future updates can be installed directly from inside the app!

---

## 📂 Project Structure

```text
cinemora/
├── .github/
│   └── workflows/
│       └── build-apk.yml                 # GitHub Actions APK build & release pipeline
├── android/                              # Native Android Project
│   ├── app/
│   │   ├── src/main/java/com/jeessunny/cinemora/
│   │   │   ├── MainActivity.kt           # NavHost, window insets, status bar blending
│   │   │   ├── data/
│   │   │   │   ├── CatalogData.kt        # Curated catalog & search engine
│   │   │   │   ├── PreferencesManager.kt # Reactive StateFlow SharedPreferences
│   │   │   │   └── RecommendationEngine.kt
│   │   │   ├── model/
│   │   │   │   └── Models.kt             # Movie, Season, Episode data models
│   │   │   ├── service/
│   │   │   │   └── UpdateManager.kt      # Native GitHub release updater
│   │   │   ├── ui/
│   │   │   │   ├── components/
│   │   │   │   │   └── Components.kt     # HeroCard, ScrollRail, CinemoraNavBar, etc.
│   │   │   │   ├── screens/              # HomeScreen, Search, Library, Settings, Details
│   │   │   │   └── theme/
│   │   │   │       └── Theme.kt          # M3 color tokens & dynamic accents
│   │   │   └── AndroidManifest.xml
│   │   ├── src/main/res/                 # Icons, splash screens, colors, XML
│   │   └── build.gradle                  # App build configuration & signing
│   ├── gradle/wrapper/                   # Gradle wrapper distribution
│   ├── build.gradle                      # Root project build configuration
│   └── settings.gradle                   # Gradle settings
├── website/                              # Official Cinemora Showcase Website
│   ├── assets/                           # High-res app icons and preview assets
│   ├── index.html                        # Semantic, responsive showcase page
│   ├── styles.css                        # Cinema noir design system & typography
│   └── script.js                         # Interactive phone mockup & release telemetry
├── vercel.json                           # Vercel deployment configuration
└── RELEASE_NOTES.md                      # Changelog for GitHub Releases
```

---

## 💻 Local Development

### Prerequisites

- Java 17 (JDK)
- Android Studio Hedgehog / Iguana / Jellyfish (or Android SDK 34)

### Building & Signing the Native APK

See the complete **[Release Signing & Publishing Guide](docs/RELEASE_SIGNING.md)** for full keystore setup, Gradle configuration, and release instructions.

```bash
# Clone the repository
git clone https://github.com/jeessunny/cinemora.git
cd cinemora

# Build, sign locally (using android/keystore.properties or env vars), and verify with apksigner
./scripts/release.sh

# Or sign an unsigned APK artifact downloaded from GitHub Actions
./scripts/release.sh --input path/to/cinemora-release-unsigned.apk
```

The signed, verified APK and SHA-256 checksum will be output to `/sdcard/AI/Projects/cinemora/cinemora-release.apk` on Android/Termux (or `releases/cinemora-release.apk` on desktop).

---

## 🤖 GitHub Actions Workflow

When a new version tag (e.g. `v2.3.17`) is pushed to GitHub:

1. GitHub Actions checks out the repository without any signing secrets or private keys.
2. Sets up JDK 17 and Gradle.
3. Compiles the **unsigned** native release APK (`./gradlew assembleRelease`).
4. Uploads `cinemora-release-unsigned.apk` and its SHA-256 checksum as a workflow artifact and creates a **Draft** GitHub Release.
5. The release engineer signs and verifies the APK locally via `./scripts/release.sh --input ...` into `/sdcard/AI/Projects/cinemora/`, tests it on device, and publishes `cinemora-release.apk` only after verification.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
