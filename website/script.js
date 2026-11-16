/* ═══════════════════════════════════════════════════════════════════
   Cinemora — Website Interactive Logic
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initReleaseTelemetry();
  initDeviceInteractivity();
  initColorSwitcher();
  initFaqAccordion();
  initMobileMenu();
  initCopyChecksum();
});

// GitHub API Telemetry for Real-Time Releases
async function initReleaseTelemetry() {
  const repoOwner = 'jeessunny';
  const repoName = 'cinemora';
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;
  const repoUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;

  // Fetch GitHub Stars
  try {
    const repoRes = await fetch(repoUrl);
    if (repoRes.ok) {
      const repoData = await repoRes.json();
      const starsEl = document.getElementById('github-stars');
      if (starsEl && repoData.stargazers_count !== undefined) {
        starsEl.textContent = `★ ${repoData.stargazers_count}`;
      }
    }
  } catch (err) {
    console.warn('GitHub star fetch notice:', err);
  }

  // Fetch Latest Release
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Release fetch response not ok');
    const release = await res.json();

    const tagName = release.tag_name || 'v2.3.15';
    const apkAsset = (release.assets || []).find(a => a.name.endsWith('.apk'));
    const shaAsset = (release.assets || []).find(a => a.name.endsWith('.sha256'));

    if (apkAsset) {
      const sizeMb = (apkAsset.size / (1024 * 1024)).toFixed(1);
      const downloadUrl = apkAsset.browser_download_url;

      // Update buttons and labels
      const heroBtn = document.getElementById('hero-download-btn');
      const mainBtn = document.getElementById('main-download-btn');
      const apkSizeLabel = document.getElementById('apk-size-label');
      const releaseVersion = document.getElementById('release-version');
      const releaseSize = document.getElementById('release-size');

      if (heroBtn) heroBtn.href = downloadUrl;
      if (mainBtn) mainBtn.href = downloadUrl;
      if (apkSizeLabel) apkSizeLabel.textContent = `${tagName} • ${sizeMb} MB • Android 7.0+`;
      if (releaseVersion) releaseVersion.textContent = tagName;
      if (releaseSize) releaseSize.textContent = `${sizeMb} MB`;
    }

    // Fetch SHA256 string if available
    if (shaAsset) {
      try {
        const shaRes = await fetch(shaAsset.browser_download_url);
        if (shaRes.ok) {
          const shaText = await shaRes.text();
          const cleanHash = shaText.trim().split(/\s+/)[0];
          const checksumCode = document.getElementById('checksum-text');
          const shaDisplay = document.getElementById('release-sha256-display');

          if (checksumCode && cleanHash) checksumCode.textContent = cleanHash;
          if (shaDisplay && cleanHash) shaDisplay.textContent = cleanHash;
        }
      } catch (e) {
        console.warn('Sha256 asset content fetch notice:', e);
      }
    }
  } catch (e) {
    console.warn('GitHub release telemetry using local fallback:', e);
    // Graceful fallback defaults already in HTML
    const shaDisplay = document.getElementById('release-sha256-display');
    if (shaDisplay) shaDisplay.textContent = 'sha256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
  }
}

// Device Mockup Interactive Views
function initDeviceInteractivity() {
  const phoneScreen = document.getElementById('phone-screen');
  const modeTabs = document.querySelectorAll('.mode-tab');
  const calloutTitle = document.getElementById('callout-title');
  const calloutDesc = document.getElementById('callout-desc');

  const modes = {
    home: {
      title: 'Adaptive Discovery Rails',
      desc: 'Cinemora generates dynamic horizontal discovery rails based on your watch patterns. Smooth 120Hz physics ensure seamless browsing without frame drops.',
      render: () => `
        <div class="screen-status-bar">
          <span class="status-time">9:41</span>
          <div class="status-icons">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/></svg>
            <div class="battery-icon"><div class="battery-fill"></div></div>
          </div>
        </div>
        <div class="screen-top-bar">
          <div class="user-greeting">
            <div class="user-name">Movie Lover</div>
            <div class="user-sub">Good evening</div>
          </div>
          <div class="user-avatar-circle">
            <img src="https://api.dicebear.com/7.x/avataaars/png?seed=MovieLover" alt="Avatar">
          </div>
        </div>
        <div class="screen-hero-card">
          <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" alt="Interstellar" class="hero-card-img">
          <div class="hero-card-overlay">
            <span class="hero-chip">FEATURED</span>
            <div class="hero-movie-title">Interstellar</div>
            <div class="hero-movie-meta">
              <span class="rating-badge">★ 8.7</span>
              <span>2014</span>
              <span>Sci-Fi</span>
            </div>
          </div>
        </div>
        <div class="screen-rail-section">
          <div class="screen-rail-header">
            <span class="screen-rail-title">Recommended For You</span>
            <span class="screen-rail-more">See all</span>
          </div>
          <div class="screen-posters-row">
            <div class="screen-poster">
              <img src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" alt="Inception">
              <div class="screen-poster-rating">★ 8.8</div>
              <div class="screen-poster-title">Inception</div>
            </div>
            <div class="screen-poster">
              <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80" alt="Dune">
              <div class="screen-poster-rating">★ 8.5</div>
              <div class="screen-poster-title">Dune: Part Two</div>
            </div>
            <div class="screen-poster">
              <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&q=80" alt="Oppenheimer">
              <div class="screen-poster-rating">★ 8.9</div>
              <div class="screen-poster-title">Oppenheimer</div>
            </div>
          </div>
        </div>
        ${getNavCapsuleHtml('home')}
      `
    },
    pitchblack: {
      title: 'Pure #000000 Pitch Black OLED',
      desc: 'True OLED pitch black mode turns display pixels off entirely, producing infinite contrast ratios and significantly reducing battery consumption.',
      render: () => `
        <div class="screen-status-bar">
          <span class="status-time">9:41</span>
          <div class="status-icons">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/></svg>
            <div class="battery-icon"><div class="battery-fill"></div></div>
          </div>
        </div>
        <div style="padding: 14px 16px; background: #000000;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:800; font-size:1.15rem; color:#FFFFFF;">OLED Pitch Black</span>
            <span style="font-size:0.65rem; background:rgba(255,255,255,0.12); padding:2px 8px; border-radius:99px; color:#00C853; font-weight:700;">#000000 ACTIVE</span>
          </div>
        </div>
        <div style="margin: 6px 14px; padding: 14px; border-radius: 14px; background: #000000; border: 1px solid rgba(255,255,255,0.15);">
          <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:4px;">AMOLED Power Consumption</div>
          <div style="font-size:1.25rem; font-weight:800; color:var(--theme-accent);">-42% Battery Draw</div>
          <div style="font-size:0.68rem; color:var(--text-muted); margin-top:4px;">Zero backlighting glow on OLED displays.</div>
        </div>
        <div class="screen-rail-section" style="background:#000000;">
          <div class="screen-rail-header">
            <span class="screen-rail-title" style="color:#FFFFFF;">Trending Noir</span>
          </div>
          <div class="screen-posters-row">
            <div class="screen-poster" style="background:#050505; border:1px solid rgba(255,255,255,0.08);">
              <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80" alt="Batman">
              <div class="screen-poster-title">The Batman</div>
            </div>
            <div class="screen-poster" style="background:#050505; border:1px solid rgba(255,255,255,0.08);">
              <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80" alt="Blade Runner">
              <div class="screen-poster-title">Blade Runner 2049</div>
            </div>
            <div class="screen-poster" style="background:#050505; border:1px solid rgba(255,255,255,0.08);">
              <img src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" alt="Dark Knight">
              <div class="screen-poster-title">Dark Knight</div>
            </div>
          </div>
        </div>
        ${getNavCapsuleHtml('home')}
      `
    },
    library: {
      title: 'Curated Personal Library',
      desc: 'Manage your Watchlist, Favorites, and View History with instant local search filtering and zero cloud tracking.',
      render: () => `
        <div class="screen-status-bar">
          <span class="status-time">9:41</span>
          <div class="status-icons">
            <div class="battery-icon"><div class="battery-fill"></div></div>
          </div>
        </div>
        <div style="padding: 12px 16px;">
          <div style="font-size:1.25rem; font-weight:800; color:#FFFFFF;">Your Library</div>
          <div style="display:flex; gap:6px; margin-top:10px;">
            <span style="font-size:0.7rem; font-weight:700; background:var(--theme-accent); color:#fff; padding:4px 10px; border-radius:99px;">Watchlist (14)</span>
            <span style="font-size:0.7rem; font-weight:600; background:#1C1C24; color:var(--text-secondary); padding:4px 10px; border-radius:99px;">Favorites</span>
            <span style="font-size:0.7rem; font-weight:600; background:#1C1C24; color:var(--text-secondary); padding:4px 10px; border-radius:99px;">History</span>
          </div>
        </div>
        <div style="padding: 0 14px; display:grid; grid-template-columns: 1fr 1fr; gap:10px; flex:1;">
          <div style="border-radius:12px; overflow:hidden; background:#14141B;">
            <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80" style="width:100%; height:110px; object-fit:cover;">
            <div style="padding:6px; font-size:0.75rem; font-weight:700;">Interstellar</div>
          </div>
          <div style="border-radius:12px; overflow:hidden; background:#14141B;">
            <img src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80" style="width:100%; height:110px; object-fit:cover;">
            <div style="padding:6px; font-size:0.75rem; font-weight:700;">Inception</div>
          </div>
        </div>
        ${getNavCapsuleHtml('library')}
      `
    },
    settings: {
      title: 'Bespoke Theme Customization',
      desc: 'Customize floating vs. docked nav bars, configure visible tabs, adjust system status bar blending, and pick your favorite cinema accent palette.',
      render: () => `
        <div class="screen-status-bar">
          <span class="status-time">9:41</span>
          <div class="status-icons">
            <div class="battery-icon"><div class="battery-fill"></div></div>
          </div>
        </div>
        <div style="padding: 12px 16px;">
          <div style="font-size:1.25rem; font-weight:800; color:#FFFFFF;">Settings</div>
        </div>
        <div style="padding: 0 14px; display:flex; flex-direction:column; gap:8px; flex:1;">
          <div style="padding:10px 14px; background:#16161E; border-radius:12px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.8rem; font-weight:700;">Pure Pitch Black</div>
              <div style="font-size:0.65rem; color:var(--text-secondary);">#000000 for OLED</div>
            </div>
            <div style="width:34px; height:18px; background:var(--theme-accent); border-radius:99px; position:relative;">
              <div style="width:14px; height:14px; background:#fff; border-radius:50%; position:absolute; top:2px; right:2px;"></div>
            </div>
          </div>

          <div style="padding:10px 14px; background:#16161E; border-radius:12px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.8rem; font-weight:700;">Floating Capsule Nav</div>
              <div style="font-size:0.65rem; color:var(--text-secondary);">Subtle grey border</div>
            </div>
            <div style="width:34px; height:18px; background:var(--theme-accent); border-radius:99px; position:relative;">
              <div style="width:14px; height:14px; background:#fff; border-radius:50%; position:absolute; top:2px; right:2px;"></div>
            </div>
          </div>

          <div style="padding:10px 14px; background:#16161E; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.8rem; font-weight:700; margin-bottom:4px;">App Version</div>
            <div style="font-size:0.7rem; font-family:var(--font-mono); color:var(--text-secondary);">Cinemora v2.3.15</div>
          </div>
        </div>
        ${getNavCapsuleHtml('settings')}
      `
    }
  };

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const modeKey = tab.dataset.mode;
      const mode = modes[modeKey];
      if (mode && phoneScreen) {
        phoneScreen.style.opacity = '0.4';
        setTimeout(() => {
          phoneScreen.innerHTML = mode.render();
          phoneScreen.style.opacity = '1';
        }, 120);

        if (calloutTitle) calloutTitle.textContent = mode.title;
        if (calloutDesc) calloutDesc.textContent = mode.desc;
      }
    });
  });
}

function getNavCapsuleHtml(activeTab) {
  return `
    <div class="screen-nav-capsule">
      <div class="screen-nav-item ${activeTab === 'home' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span>Home</span>
      </div>
      <div class="screen-nav-item ${activeTab === 'search' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <span>Search</span>
      </div>
      <div class="screen-nav-item ${activeTab === 'library' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
        <span>Library</span>
      </div>
      <div class="screen-nav-item ${activeTab === 'settings' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
        <span>Settings</span>
      </div>
    </div>
  `;
}

// Live Dynamic Accent Color Switcher
function initColorSwitcher() {
  const swatches = document.querySelectorAll('.swatch');
  const root = document.documentElement;

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      const color = swatch.dataset.color;
      if (color) {
        root.style.setProperty('--theme-accent', color);
        root.style.setProperty('--theme-accent-hover', adjustBrightness(color, 15));
        root.style.setProperty('--theme-glow', hexToRgba(color, 0.25));
      }
    });
  });
}

function hexToRgba(hex, alpha) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function adjustBrightness(hex, percent) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  let num = parseInt(c, 16);
  let r = Math.min(255, Math.max(0, ((num >> 16) & 255) + percent));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 255) + percent));
  let b = Math.min(255, Math.max(0, (num & 255) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close others
        faqItems.forEach(i => {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });
}

// Mobile Menu Drawer
function initMobileMenu() {
  const toggleBtn = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close when tapping a drawer link
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on desktop resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Checksum Clipboard Copy with Toast
function initCopyChecksum() {
  const copyBtn = document.getElementById('copy-checksum-btn');
  const copyHashBtn = document.getElementById('copy-hash-btn');
  const toast = document.getElementById('copy-toast');

  function copyText(text) {
    if (!navigator.clipboard) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } else {
      navigator.clipboard.writeText(text);
    }

    if (toast) {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const checksumText = document.getElementById('checksum-text')?.textContent || '';
      copyText(checksumText);
    });
  }

  if (copyHashBtn) {
    copyHashBtn.addEventListener('click', () => {
      const checksumText = document.getElementById('release-sha256-display')?.textContent || '';
      copyText(checksumText);
    });
  }
}
