#!/bin/sh
#
# Cinemora Android Release Build, Signing & Verification Script
#
# Modes:
#   1. Full local build + sign + verify:
#        ./scripts/release.sh [--clean]
#   2. Sign & verify a CI-built unsigned APK:
#        ./scripts/release.sh --input path/to/cinemora-release-unsigned.apk
#
# Signing credentials are loaded automatically (without ever printing secrets) from:
#   1. Environment variables: KEYSTORE_FILE, STORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
#   2. Untracked properties:  android/keystore.properties
#   3. Secure user fallback:  $HOME/.cinemora-signing/keystore.properties

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$REPO_ROOT/android"
APP_GRADLE="$ANDROID_DIR/app/build.gradle"
RELEASE_DIR="$REPO_ROOT/releases"

INPUT_APK=""
RUN_CLEAN=false

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Options:
  --input, -i <apk>   Sign and verify an existing unsigned APK (e.g. from GitHub Actions)
  --clean, -c         Run Gradle clean before building locally
  --help,  -h         Show this help message
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --input|-i)
      if [ "$#" -lt 2 ]; then
        echo "Error: --input requires an APK path." >&2
        exit 1
      fi
      INPUT_APK="$2"
      shift 2
      ;;
    --clean|-c)
      RUN_CLEAN=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown option '$1'" >&2
      usage
      exit 1
      ;;
  esac
done

# Read a property value from a Java .properties file safely
read_prop() {
  grep -E "^${2}=" "$1" | head -n 1 | cut -d'=' -f2- | tr -d '\r'
}

# Load signing credentials cleanly (env vars take precedence)
PROPS_FILE=""
if [ -f "$ANDROID_DIR/keystore.properties" ]; then
  PROPS_FILE="$ANDROID_DIR/keystore.properties"
elif [ -f "$HOME/.cinemora-signing/keystore.properties" ]; then
  PROPS_FILE="$HOME/.cinemora-signing/keystore.properties"
fi

if [ -z "${KEYSTORE_FILE:-}" ] && [ -n "$PROPS_FILE" ]; then
  KEYSTORE_FILE="$(read_prop "$PROPS_FILE" "storeFile")"
fi
if [ -z "${KEY_ALIAS:-}" ] && [ -n "$PROPS_FILE" ]; then
  KEY_ALIAS="$(read_prop "$PROPS_FILE" "keyAlias")"
fi
if [ -z "${STORE_PASSWORD:-}" ] && [ -n "$PROPS_FILE" ]; then
  STORE_PASSWORD="$(read_prop "$PROPS_FILE" "storePassword")"
fi
if [ -z "${KEY_PASSWORD:-}" ] && [ -n "$PROPS_FILE" ]; then
  KEY_PASSWORD="$(read_prop "$PROPS_FILE" "keyPassword")"
fi

if [ -z "${KEYSTORE_FILE:-}" ] || [ -z "${KEY_ALIAS:-}" ] || [ -z "${STORE_PASSWORD:-}" ] || [ -z "${KEY_PASSWORD:-}" ]; then
  echo "Error: Missing signing credentials." >&2
  echo "Provide KEYSTORE_FILE, KEY_ALIAS, STORE_PASSWORD, KEY_PASSWORD env vars," >&2
  echo "or configure android/keystore.properties or \$HOME/.cinemora-signing/keystore.properties." >&2
  exit 1
fi

# Resolve relative keystore path against android/app if needed
if [ ! -f "$KEYSTORE_FILE" ] && [ -f "$ANDROID_DIR/app/$KEYSTORE_FILE" ]; then
  KEYSTORE_FILE="$ANDROID_DIR/app/$KEYSTORE_FILE"
fi
if [ ! -f "$KEYSTORE_FILE" ]; then
  echo "Error: Keystore file not found at configured path." >&2
  exit 1
fi

export KEYSTORE_FILE KEY_ALIAS STORE_PASSWORD KEY_PASSWORD

# Locate Android SDK build tools (apksigner & optional zipalign)
find_sdk_tool() {
  tool_name="$1"
  if command -v "$tool_name" >/dev/null 2>&1; then
    command -v "$tool_name"
    return 0
  fi
  sdk_dir="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
  if [ -n "$sdk_dir" ] && [ -d "$sdk_dir/build-tools" ]; then
    found_tool="$(find "$sdk_dir/build-tools" -maxdepth 2 -name "$tool_name" -type f 2>/dev/null | sort -V | tail -n 1 || true)"
    if [ -n "$found_tool" ]; then
      echo "$found_tool"
      return 0
    fi
  fi
  return 1
}

APKSIGNER_BIN="$(find_sdk_tool apksigner || true)"
if [ -z "$APKSIGNER_BIN" ]; then
  echo "Error: 'apksigner' not found in PATH or \$ANDROID_HOME/build-tools." >&2
  exit 1
fi
ZIPALIGN_BIN="$(find_sdk_tool zipalign || true)"

# Extract versionName from android/app/build.gradle
VERSION_NAME="$(grep -E '^[[:space:]]*versionName[[:space:]]+"' "$APP_GRADLE" | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/')"
[ -z "$VERSION_NAME" ] && VERSION_NAME="unknown"

mkdir -p "$RELEASE_DIR"
TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT INT TERM

SIGNED_APK_TMP="$TMP_DIR/cinemora-signed.apk"

if [ -n "$INPUT_APK" ]; then
  if [ ! -f "$INPUT_APK" ]; then
    echo "Error: Input APK does not exist: $INPUT_APK" >&2
    exit 1
  fi
  echo "==> Signing existing APK: $INPUT_APK"

  WORK_APK="$INPUT_APK"
  if [ -n "$ZIPALIGN_BIN" ]; then
    if ! "$ZIPALIGN_BIN" -c -p 4 "$INPUT_APK" >/dev/null 2>&1; then
      echo "==> Aligning APK with zipalign..."
      ALIGNED_APK="$TMP_DIR/aligned.apk"
      "$ZIPALIGN_BIN" -p -f 4 "$INPUT_APK" "$ALIGNED_APK"
      WORK_APK="$ALIGNED_APK"
    fi
  fi

  "$APKSIGNER_BIN" sign \
    --ks "$KEYSTORE_FILE" \
    --ks-key-alias "$KEY_ALIAS" \
    --ks-pass env:STORE_PASSWORD \
    --key-pass env:KEY_PASSWORD \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out "$SIGNED_APK_TMP" \
    "$WORK_APK"
else
  # Prefer JDK 17 for Gradle 8.2.1 / AGP 8.2.1 if installed alongside newer JDKs
  if [ -d "/data/data/com.termux/files/usr/lib/jvm/java-17-openjdk" ]; then
    export JAVA_HOME="/data/data/com.termux/files/usr/lib/jvm/java-17-openjdk"
  fi

  if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ] && [ ! -f "$ANDROID_DIR/local.properties" ]; then
    echo "Error: Android SDK not configured (set ANDROID_HOME or create android/local.properties)." >&2
    echo "Tip: Use './scripts/release.sh --input <unsigned.apk>' to sign an APK built on CI." >&2
    exit 1
  fi

  echo "==> Building release APK via Gradle (v${VERSION_NAME})..."
  chmod +x "$ANDROID_DIR/gradlew"
  if [ "$RUN_CLEAN" = "true" ]; then
    (cd "$ANDROID_DIR" && ./gradlew clean assembleRelease --stacktrace)
  else
    (cd "$ANDROID_DIR" && ./gradlew assembleRelease --stacktrace)
  fi

  BUILT_APK="$(find "$ANDROID_DIR/app/build/outputs/apk/release" -maxdepth 1 -name "*.apk" | head -n 1 || true)"
  if [ -z "$BUILT_APK" ]; then
    echo "Error: Gradle release APK output not found." >&2
    exit 1
  fi

  # Verify if Gradle signed it cleanly; if unsigned, apply signature with apksigner
  if "$APKSIGNER_BIN" verify "$BUILT_APK" >/dev/null 2>&1; then
    cp "$BUILT_APK" "$SIGNED_APK_TMP"
  else
    echo "==> Applying signature with apksigner..."
    "$APKSIGNER_BIN" sign \
      --ks "$KEYSTORE_FILE" \
      --ks-key-alias "$KEY_ALIAS" \
      --ks-pass env:STORE_PASSWORD \
      --key-pass env:KEY_PASSWORD \
      --v1-signing-enabled true \
      --v2-signing-enabled true \
      --v3-signing-enabled true \
      --out "$SIGNED_APK_TMP" \
      "$BUILT_APK"
  fi
fi

echo "==> Verifying APK signature with apksigner..."
"$APKSIGNER_BIN" verify --verbose --print-certs "$SIGNED_APK_TMP"

FINAL_CANONICAL="$RELEASE_DIR/cinemora-release.apk"
FINAL_VERSIONED="$RELEASE_DIR/cinemora-v${VERSION_NAME}-release.apk"

cp "$SIGNED_APK_TMP" "$FINAL_CANONICAL"
cp "$SIGNED_APK_TMP" "$FINAL_VERSIONED"

(
  cd "$RELEASE_DIR"
  sha256sum "cinemora-release.apk" > "cinemora-release.apk.sha256"
  sha256sum "cinemora-v${VERSION_NAME}-release.apk" > "cinemora-v${VERSION_NAME}-release.apk.sha256"
)

echo ""
echo "==> Release APK ready!"
echo "    Version:   v${VERSION_NAME}"
echo "    Canonical: $FINAL_CANONICAL"
echo "    Versioned: $FINAL_VERSIONED"
echo "    Checksums: $RELEASE_DIR/*.sha256"
