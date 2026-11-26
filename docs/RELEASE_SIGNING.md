# Cinemora Android APK Signing & Release Guide

This document defines the production APK signing and release workflow for **Cinemora** (`com.jeessunny.cinemora`).

---

## Security & Upgrade Continuity Principles

1. **Private Key Isolation**: The release keystore (`cinemora-release.jks`) and its credentials are stored **exclusively on trusted local build/release hardware** outside this repository (`$HOME/.cinemora-signing/`).
2. **Zero CI Secrets**: GitHub Actions (`build-apk.yml`) **never** receives, stores, accesses, or generates private release keys. CI produces **unsigned** release artifacts (`cinemora-release-unsigned.apk`) only.
3. **Zero Hardcoded Credentials**: `android/app/build.gradle` reads signing credentials exclusively from environment variables or an untracked `keystore.properties` file. If absent (as in CI), release builds remain unsigned rather than falling back to debug keys.
4. **Update Continuity**: Every future Cinemora APK **must** be signed with the exact same keystore certificate and alias (`cinemora`) so Android allows seamless in-place updates without uninstalling existing user data.
   - Expected Production Certificate SHA-256 Fingerprint:
     `03:15:91:00:77:21:CF:F3:36:4A:0D:A7:9C:61:1F:26:BC:89:B5:E6:FB:9D:4B:ED:9D:C2:51:D8:46:59:00:B8`

---

## 1. Initial Keystore Generation (First-Time Setup Only)

> **Warning**: Only generate a keystore **once**. If a permanent keystore already exists in `$HOME/.cinemora-signing/cinemora-release.jks`, **reuse it**. Losing the keystore or overwriting it breaks upgrade compatibility for all installed users.

```bash
mkdir -p "$HOME/.cinemora-signing"
chmod 700 "$HOME/.cinemora-signing"

keytool -genkeypair -v \
  -keystore "$HOME/.cinemora-signing/cinemora-release.jks" \
  -storetype PKCS12 \
  -alias cinemora \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000 \
  -dname "CN=Cinemora, OU=Mobile Engineering, O=Cinemora, C=US"

chmod 600 "$HOME/.cinemora-signing/cinemora-release.jks"
```

Inspect the public certificate fingerprint (never reveals private keys or passwords):

```bash
keytool -list -v -keystore "$HOME/.cinemora-signing/cinemora-release.jks" -alias cinemora
```

**Immediately back up** `cinemora-release.jks` and its passwords to an encrypted offline vault / password manager.

---

## 2. Local Signing Configuration

Configure credentials using **either** an untracked properties file **or** environment variables:

### Option A: Local `keystore.properties` File (Recommended)

Copy the tracked template and fill in your local values:

```bash
cp android/keystore.properties.example android/keystore.properties
chmod 600 android/keystore.properties
```

Contents of `android/keystore.properties` (automatically ignored by `.gitignore`; for `PKCS12` keystores, `storePassword` and `keyPassword` must be identical):

```properties
storeFile=/absolute/path/to/.cinemora-signing/cinemora-release.jks
keyAlias=cinemora
storePassword=<YOUR_STORE_PASSWORD>
keyPassword=<YOUR_KEY_PASSWORD>
```

Gradle (`android/app/build.gradle`) and `./scripts/release.sh` check:
1. Environment variables (`KEYSTORE_FILE`, `STORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`)
2. `android/keystore.properties`
3. `$HOME/.cinemora-signing/keystore.properties`

### Option B: Environment Variables

```bash
export KEYSTORE_FILE="$HOME/.cinemora-signing/cinemora-release.jks"
export KEY_ALIAS="cinemora"
export STORE_PASSWORD="<YOUR_STORE_PASSWORD>"
export KEY_PASSWORD="<YOUR_KEY_PASSWORD>"
```

---

## 3. Building, Signing & Verification

The reusable release script [`scripts/release.sh`](../scripts/release.sh) automates building/signing, `apksigner` verification, SHA-256 generation, and packaging into `releases/`.

### Workflow A: Full Local Build + Sign + Verify (Desktop / Android SDK Installed)

```bash
./scripts/release.sh          # Incremental release build, sign, and verify
./scripts/release.sh --clean  # Clean release build, sign, and verify
```

Or run Gradle directly followed by manual `apksigner` verification:

```bash
cd android
./gradlew assembleRelease

apksigner verify --verbose --print-certs \
  app/build/outputs/apk/release/app-release.apk
```

### Workflow B: Sign an Unsigned APK Built by GitHub Actions

If you build on GitHub Actions CI (e.g., when developing from a mobile/headless environment without full Android SDK build platforms locally):

```bash
./scripts/release.sh --input path/to/cinemora-release-unsigned.apk
```

Both workflows output verified distributable files to `releases/`:
- `releases/cinemora-release.apk` (canonical name used by the in-app updater)
- `releases/cinemora-release.apk.sha256`
- `releases/cinemora-v<version>-release.apk`
- `releases/cinemora-v<version>-release.apk.sha256`

### Signature Verification Checklist

Verify manually at any time with Android SDK `apksigner`:

```bash
apksigner verify --verbose --print-certs releases/cinemora-release.apk
```

Confirm:
- `Verifies` returns true (`Verified using v1 scheme (JAR signing): true`, `v2 scheme: true`, `v3 scheme: true`).
- `Signer #1 certificate SHA-256 digest` matches your permanent release keystore SHA-256 (`031591007721cff3364a0da79c611f26bc89b5e6fb9d4bed9dc251d8465900b8`).

---

## 4. GitHub Actions & Release Preparation

When pushing code to `main` or a version tag (`v*.*.*`):

1. **CI Builds Unsigned Artifacts Only**:
   [`.github/workflows/build-apk.yml`](../.github/workflows/build-apk.yml) runs `./gradlew assembleRelease` with no keystore or signing secrets, producing:
   - Workflow artifact: `cinemora-release-unsigned-apk` (`cinemora-release-unsigned.apk` + `.sha256`)
   - On tag push (`v*.*.*`): Creates a **Draft** GitHub Release containing the unsigned APK so live users are never served an unsigned update.

2. **Sign & Publish Release Locally**:
   ```bash
   # 1. Tag and push version release (wait for CI build to finish)
   git tag v2.3.18
   git push origin main v2.3.18

   # 2. Download unsigned APK artifact from the completed CI run
   gh run download --name cinemora-release-unsigned-apk --dir /tmp/cinemora-unsigned

   # 3. Sign and verify locally with your private keystore
   ./scripts/release.sh --input /tmp/cinemora-unsigned/cinemora-release-unsigned.apk

   # 4. Upload verified signed APK + checksum to the draft release, remove unsigned assets, and publish
   gh release delete-asset v2.3.18 cinemora-release-unsigned.apk --yes || true
   gh release delete-asset v2.3.18 cinemora-release-unsigned.apk.sha256 --yes || true
   gh release upload v2.3.18 \
     releases/cinemora-release.apk \
     releases/cinemora-release.apk.sha256 \
     --clobber
   gh release edit v2.3.18 --draft=false
   ```

   Once published, existing Cinemora installations automatically detect the update via `UpdateManager` and install `cinemora-release.apk` seamlessly.
