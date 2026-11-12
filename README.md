# Cinemora 🎬

[![Android Release](https://img.shields.io/github/v/release/jeessunny/cinemora?label=Android%20APK&color=E50914&logo=android)](https://github.com/jeessunny/cinemora/releases)
[![Build & Release Android APK](https://github.com/jeessunny/cinemora/actions/workflows/build-apk.yml/badge.svg)](https://github.com/jeessunny/cinemora/actions/workflows/build-apk.yml)
[![Platform](https://img.shields.io/badge/Platform-Android%20Native-blue?logo=android)](https://github.com/jeessunny/cinemora)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Cinemora** is a movie and series discovery native Android application built with React 18, Material 3, and Capacitor. Designed with a cinema-first aesthetic, Cinemora delivers personalized movie suggestions, customizable home rails, pure pitch black AMOLED dark mode, and an automated in-app updater.

---

## ✨ Features

- 📱 **Native Android Experience**: Packaged with Capacitor 6 for native Android performance, hardware back button gesture navigation, and hardware acceleration.
- 🖤 **Pure Pitch Black (AMOLED Mode)**: True `#000000` pitch black background and container styling engineered for OLED displays and battery efficiency.
- 🔲 **Edge-to-Edge Merged Status Bar**: The Android status bar is merged and hidden, allowing backdrop art and posters to span the entire screen.
- 🔄 **In-App Updater (Studyio Architecture)**:
  - Automated GitHub Releases checking via `api.github.com`.
  - Background streaming APK download with live percentage and MB progress indicators.
  - Native Android Package Installer integration using `FileProvider` with unknown-sources permission validation.
  - Silent update checks on startup + manual "Check for Updates" button in Settings.
- 🎨 **Material 3 Customization**:
  - 10 accent color palettes (Netflix Red, Electric Blue, Emerald Green, Cyberpunk Purple, Amber, and more).
  - Floating pill or fixed bottom navigation bar.
  - Sortable drag-and-drop home screen sections.
  - Toggleable UI entrance and transition animations.
- 💾 **Local-First Reliability**: Pure local state persistence via Zustand and localStorage. Zero startup crashes, instant screen rendering, and full offline accessibility.
- 🚀 **Automated GitHub Actions CI/CD**: Automatic signed release APK compilation, SHA256 checksumming, and GitHub Release deployment on tag push (`v*.*.*`).

---

## 🛠️ Tech Stack

- **Core**: React 18, React Router DOM 6
- **Build Tool**: Vite 5
- **UI Framework**: Material UI (MUI v6), Emotion, Material Symbols Rounded
- **State Management**: Zustand with persistent storage
- **Gestures & Drag/Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Mobile Engine**: Capacitor 6 (`@capacitor/core`, `@capacitor/android`, `@capacitor/app`, `@capacitor/status-bar`)
- **Native Android**: Java 17, Android SDK 34, AndroidX, Gradle 8.2
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
│       └── build-apk.yml         # GitHub Actions APK build & release pipeline
├── android/                      # Native Android project
│   ├── app/
│   │   ├── src/main/java/com/jeessunny/cinemora/
│   │   │   ├── MainActivity.java           # Immersive status bar & Capacitor bridge
│   │   │   └── CinemoraUpdaterPlugin.java  # Native APK downloader & installer
│   │   ├── src/main/res/                   # Icons, splash screens, colors, XML
│   │   └── build.gradle                    # Android signing and build config
│   └── build.gradle
├── src/
│   ├── components/               # HeroCard, ScrollRail, UpdateDialog, NavBar, etc.
│   ├── screens/                  # HomeScreen, MovieDetails, SeriesDetails, Settings, etc.
│   ├── services/                 # Updater service, recommendation engine, catalog
│   ├── theme.js                  # Material 3 Light, Dark, and Pure Pitch Black palettes
│   ├── store.js                  # Zustand persistence & appearance store
│   ├── App.jsx                   # Root layout, navigation, back-button handler
│   └── main.jsx
├── capacitor.config.json         # Capacitor native configuration
└── package.json
```

---

## 💻 Local Development

### Prerequisites

- Node.js (v18+)
- Java 17 (JDK)
- Android Studio / Android SDK (for native builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/jeessunny/cinemora.git
cd cinemora

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Building the Native APK

```bash
# 1. Compile web assets
npm run build

# 2. Sync web assets with native Android project
npm run cap:sync

# 3. Build release APK with Gradle
cd android
./gradlew assembleRelease
```

The compiled APK will be generated at:
`android/app/build/outputs/apk/release/app-release-unsigned.apk` (or signed release).

---

## 🤖 GitHub Actions Workflow

When a new version tag (e.g. `v2.2.0`) is pushed to GitHub:

1. GitHub Actions checks out the code.
2. Installs Node dependencies and builds the web bundle (`npm run build`).
3. Syncs the native assets with Capacitor (`npx cap sync android`).
4. Compiles the APK with Gradle (`./gradlew assembleRelease`).
5. Generates the SHA256 checksum.
6. Publishes an official GitHub Release with `cinemora-release.apk` and `cinemora-release.apk.sha256` attached automatically.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
