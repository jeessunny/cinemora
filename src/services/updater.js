import { Capacitor, registerPlugin } from '@capacitor/core';

export const CURRENT_VERSION = '2.3.0';
export const GITHUB_OWNER = 'jeessunny';
export const GITHUB_REPO = 'cinemora';

// Safely obtain native plugin if running inside Capacitor Android
const CinemoraUpdater = Capacitor.isNativePlatform()
  ? registerPlugin('CinemoraUpdater')
  : null;

/**
 * Compares two semantic version strings (e.g. "2.2.0" vs "2.1.0").
 * Returns true if remoteVersion is strictly greater than currentVersion.
 */
export function isVersionNewer(remoteVersion, currentVersion = CURRENT_VERSION) {
  if (!remoteVersion) return false;
  const cleanRemote = remoteVersion.replace(/^v/i, '').trim();
  const cleanCurrent = currentVersion.replace(/^v/i, '').trim();
  if (cleanRemote === cleanCurrent) return false;

  const rParts = cleanRemote.split('.').map(p => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });
  const cParts = cleanCurrent.split('.').map(p => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });

  const maxLen = Math.max(rParts.length, cParts.length);
  for (let i = 0; i < maxLen; i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

class UpdateService {
  constructor() {
    this.listeners = new Set();
    this.state = {
      status: 'idle', // 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'uptodate' | 'error'
      updateInfo: null,
      progress: { percent: 0, bytesDownloaded: 0, totalBytes: 0 },
      errorMessage: null,
      showDialog: false,
      isManual: false
    };

    this.nativeListenersSetup = false;
    this.setupNativeListeners();
  }

  setupNativeListeners() {
    if (!CinemoraUpdater || this.nativeListenersSetup) return;
    this.nativeListenersSetup = true;

    try {
      CinemoraUpdater.addListener('downloadProgress', (data) => {
        this.updateState({
          status: 'downloading',
          progress: {
            percent: data.percent ?? 0,
            bytesDownloaded: data.bytesDownloaded ?? 0,
            totalBytes: data.totalBytes ?? 0
          }
        });
      });

      CinemoraUpdater.addListener('downloadCompleted', () => {
        this.updateState({
          status: 'ready'
        });
      });

      CinemoraUpdater.addListener('downloadError', (data) => {
        this.updateState({
          status: 'error',
          errorMessage: data.error || 'Failed to download APK update'
        });
      });
    } catch (e) {
      console.warn('Could not register native update listeners:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  updateState(partial) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(fn => fn(this.state));
  }

  openDialog() {
    this.updateState({ showDialog: true });
  }

  dismissDialog() {
    // If completed or idle or error, reset status
    if (['uptodate', 'error'].includes(this.state.status)) {
      this.updateState({ showDialog: false, status: 'idle', errorMessage: null });
    } else {
      this.updateState({ showDialog: false });
    }
  }

  /**
   * Checks GitHub API for newer releases with immediate visual feedback.
   * @param {boolean} isManual True if initiated by the user via Settings button.
   */
  async checkForUpdates(isManual = false) {
    if (this.state.status === 'checking' || this.state.status === 'downloading') {
      return;
    }

    this.updateState({
      status: 'checking',
      errorMessage: null,
      isManual,
      showDialog: isManual // show dialog immediately if manual click
    });

    try {
      const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cinemora-Updater'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No releases yet
          if (isManual) {
            this.updateState({
              status: 'uptodate',
              showDialog: true
            });
          } else {
            this.updateState({ status: 'idle' });
          }
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const release = await response.json();
      const tagName = release.tag_name || '';
      const apkAsset = (release.assets || []).find(a =>
        a.name && a.name.toLowerCase().endsWith('.apk')
      );

      const isNewer = isVersionNewer(tagName, CURRENT_VERSION);

      if (isNewer && apkAsset) {
        const updateInfo = {
          versionName: tagName,
          releaseNotes: release.body || 'New features, UI polish, and performance improvements.',
          downloadUrl: apkAsset.browser_download_url,
          fileSize: apkAsset.size || 0,
          isUpdateAvailable: true
        };

        this.updateState({
          status: 'available',
          updateInfo,
          showDialog: true
        });
      } else {
        if (isManual) {
          this.updateState({
            status: 'uptodate',
            showDialog: true
          });
        } else {
          this.updateState({ status: 'idle' });
        }
      }
    } catch (err) {
      console.error('Update check failed:', err);
      if (isManual) {
        this.updateState({
          status: 'error',
          errorMessage: err.message || 'Unable to connect to update server',
          showDialog: true
        });
      } else {
        this.updateState({ status: 'idle' });
      }
    }
  }

  /**
   * Initiates download with live progress
   */
  async startDownload(updateInfo = this.state.updateInfo) {
    if (!updateInfo || !updateInfo.downloadUrl) return;

    this.updateState({
      status: 'downloading',
      progress: { percent: -1, bytesDownloaded: 0, totalBytes: updateInfo.fileSize || 0 },
      showDialog: true
    });

    if (CinemoraUpdater) {
      try {
        await CinemoraUpdater.downloadApk({ url: updateInfo.downloadUrl });
      } catch (err) {
        this.updateState({
          status: 'error',
          errorMessage: err.message || 'Download failed. Please check your network connection.'
        });
      }
    } else {
      // Browser fallback: trigger browser download
      try {
        const link = document.createElement('a');
        link.href = updateInfo.downloadUrl;
        link.download = `Cinemora-${updateInfo.versionName}.apk`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.updateState({
          status: 'ready'
        });
      } catch (err) {
        window.open(updateInfo.downloadUrl, '_blank');
        this.updateState({ status: 'idle', showDialog: false });
      }
    }
  }

  /**
   * Prompts installation of the downloaded APK
   */
  async installApk() {
    if (CinemoraUpdater) {
      try {
        const res = await CinemoraUpdater.installApk();
        if (res && res.needsPermission) {
          // System settings screen was opened, user can approve and tap install again
          console.log('Install permission requested from user');
        }
      } catch (err) {
        console.error('Installation trigger error:', err);
        // Fallback: open release page
        if (this.state.updateInfo?.downloadUrl) {
          CinemoraUpdater.openBrowser({ url: this.state.updateInfo.downloadUrl });
        }
      }
    } else {
      if (this.state.updateInfo?.downloadUrl) {
        window.open(this.state.updateInfo.downloadUrl, '_blank');
      }
    }
  }
}

export const updateManager = new UpdateService();
export default updateManager;
