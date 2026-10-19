/**
 * Skyc Landing Page — Interactive Script Engine
 * - Ambient Particle Canvas
 * - Theme Switcher (Light / Dark)
 * - Live Client-Side Simulator with Real-Time Diagnostics
 * - Platform Category Filtering
 * - Multi-Device Showcase Tabs
 * - Copy-to-Clipboard & Toast Feedback
 * - GitHub Telemetry Fetcher
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Theme Management (Light / Dark)
  // -------------------------------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  const metaThemeColor = document.getElementById('meta-theme-color');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('skyc_landing_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('skyc_landing_theme', theme);
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#141413' : '#F4F3EE');
    }
  }

  // -------------------------------------------------------------------------
  // 2. Ambient Canvas Particles (Botanical Embers / Petals)
  // -------------------------------------------------------------------------
  const canvas = document.getElementById('ambient-canvas');
  const canvasToggle = document.getElementById('canvas-toggle');
  let canvasEnabled = true;

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(width < 768 ? 20 : 45, 60);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        dx: (Math.random() - 0.5) * 0.45,
        dy: Math.random() * 0.4 + 0.15,
        alpha: Math.random() * 0.35 + 0.1,
        color: Math.random() > 0.4 ? 'rgba(217, 119, 87, ' : 'rgba(161, 161, 170, '
      });
    }

    function animate() {
      if (!canvasEnabled) return;
      ctx.clearRect(0, 0, width, height);

      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y > height) {
          p.y = 0;
          p.x = Math.random() * width;
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    if (canvasToggle) {
      canvasToggle.addEventListener('click', () => {
        canvasEnabled = !canvasEnabled;
        document.body.classList.toggle('canvas-disabled', !canvasEnabled);
        if (canvasEnabled) {
          requestAnimationFrame(animate);
          showToast('Ambient particles enabled');
        } else {
          showToast('Ambient particles paused');
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3. Interactive Live Simulator Engine
  // -------------------------------------------------------------------------
  const simForm = document.getElementById('sim-form');
  const simUrlInput = document.getElementById('sim-url-input');
  const simBtnAnalyze = document.getElementById('sim-btn-analyze');
  const simTerminal = document.getElementById('sim-terminal');
  const simStatusTag = document.getElementById('sim-status-tag');
  const simThumbImg = document.getElementById('sim-thumb-img');
  const simMediaDuration = document.getElementById('sim-media-duration');
  const simPlatformStamp = document.getElementById('sim-platform-stamp');
  const simResultTitle = document.getElementById('sim-result-title');
  const simResultAuthor = document.getElementById('sim-result-author');
  const simBtnDownload = document.getElementById('sim-btn-download');
  const simSavePath = document.getElementById('sim-save-path');
  const presetChips = document.querySelectorAll('.preset-chip');
  const formatOptions = document.querySelectorAll('.format-option');

  const presetData = {
    tiktok: {
      url: 'https://www.tiktok.com/@creator/video/7281920391823',
      title: 'Creative Urban Motion Graphics & Sound Design Reel',
      author: '@designcraft · 1.4M views · 1080p Original',
      platform: 'TikTok',
      duration: '00:48',
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=480&q=80',
      savePath: 'Videos\\Skyc\\TikTok_7281920.mp4',
      logs: [
        'Extractor: TikTok WebScraper v2.4 initialized.',
        'Token bypassed: Watermark-free CDN stream resolved (1080x1920 @ 60fps).',
        'Done! Media assets ready for offline download.'
      ]
    },
    instagram: {
      url: 'https://www.instagram.com/p/C8k9L1pA7x/',
      title: 'Architectural Heritage & Brutalist Facades Portfolio',
      author: '@arch_journal · 8 Photos · High Res JPG',
      platform: 'Instagram',
      duration: '8 Photos',
      thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=480&q=80',
      savePath: 'Pictures\\Skyc\\Instagram_C8k9L1p.pdf',
      logs: [
        'Extractor: Instagram Graph & GraphQL resolver mounted.',
        'Carousel detected: 8 original uncompressed media nodes unpacked.',
        'Photo-to-PDF compiler configured: 8 pages sequence ready.'
      ]
    },
    spotify: {
      url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
      title: 'Resonance — Ambient Electronic Master Edition',
      author: 'HOME · Album: Odyssey · 320 kbps ID3',
      platform: 'Spotify',
      duration: '03:32',
      thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=480&q=80',
      savePath: 'Music\\Skyc\\HOME_Resonance_320k.mp3',
      logs: [
        'Extractor: Spotify Web API & Track Matcher active.',
        'ID3 Tag Metadata: Artist, Title, Album Art, ISRC matched.',
        'Lossless stream buffered: High-quality MP3 (320 kbps) ready.'
      ]
    },
    youtube: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Rick Astley — Never Gonna Give You Up (Official Music Video)',
      author: 'Rick Astley · 1.5B views · 1080p60 + Opus 160k',
      platform: 'YouTube',
      duration: '03:33',
      thumb: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=480&q=80',
      savePath: 'Videos\\Skyc\\Rick_Astley_NeverGonnaGiveYouUp_1080p.mp4',
      logs: [
        'Extractor: YouTube Player Config & Signature Decipherer loaded.',
        'Adaptive stream resolved: 1080p video + Opus audio stream multiplex.',
        'Ready! Formats extracted: 1080p, 720p, 360p, and MP3 audio.'
      ]
    },
    pinterest: {
      url: 'https://www.pinterest.com/pin/1042865232456789/',
      title: 'Minimalist Japanese Tea Ceremony Ceramic Pottery',
      author: 'CeramicCrafts · 4096x2730 · Studio Lighting',
      platform: 'Pinterest',
      duration: 'Artwork',
      thumb: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=480&q=80',
      savePath: 'Pictures\\Skyc\\Pinterest_Ceramics_4K.jpg',
      logs: [
        'Extractor: Pinterest Resource JSON parser triggered.',
        'Deep image URL detected: Replaced preview thumbnail with uncompressed /originals/ 4K master.',
        'Success! 4K Master JPG ready for instant local saving.'
      ]
    }
  };

  let activePresetKey = 'tiktok';

  // Preset click
  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      presetChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const key = chip.getAttribute('data-platform');
      if (presetData[key]) {
        activePresetKey = key;
        const data = presetData[key];
        simUrlInput.value = data.url;
        runSimulator(data);
      }
    });
  });

  // Analyze click
  if (simBtnAnalyze) {
    simBtnAnalyze.addEventListener('click', () => {
      const currentUrl = simUrlInput.value.trim();
      let matchedData = presetData[activePresetKey];

      // Auto detect platform from custom URL
      if (currentUrl.includes('instagram.com')) matchedData = presetData.instagram;
      else if (currentUrl.includes('spotify.com')) matchedData = presetData.spotify;
      else if (currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) matchedData = presetData.youtube;
      else if (currentUrl.includes('pinterest.com')) matchedData = presetData.pinterest;
      else if (currentUrl.includes('tiktok.com') || currentUrl.includes('douyin.com')) matchedData = presetData.tiktok;

      runSimulator(matchedData, true);
    });
  }

  function runSimulator(data, withLoading = false) {
    if (withLoading) {
      simBtnAnalyze.classList.add('loading');
      simStatusTag.textContent = 'Resolving Local Engine...';
      simStatusTag.style.color = 'var(--accent)';
      simTerminal.innerHTML = '<div class="log-line"><span class="log-ts">[0.00s]</span> Initializing client-side isolated sandbox...</div>';

      setTimeout(() => {
        simTerminal.innerHTML += `<div class="log-line"><span class="log-ts">[0.04s]</span> Target parsed: ${data.platform} Engine active.</div>`;
      }, 100);

      setTimeout(() => {
        simTerminal.innerHTML += `<div class="log-line"><span class="log-ts">[0.11s]</span> ${data.logs[1]}</div>`;
      }, 250);

      setTimeout(() => {
        simTerminal.innerHTML += `<div class="log-line success"><span class="log-ts">[0.19s]</span> ${data.logs[2]}</div>`;
        simBtnAnalyze.classList.remove('loading');
        simStatusTag.textContent = 'Resolved (Zero-Cloud)';
        simStatusTag.style.color = '#10B981';
        updateMediaCard(data);
        showToast(`Resolved: ${data.platform} media ready to save.`);
      }, 400);
    } else {
      updateMediaCard(data);
    }
  }

  function updateMediaCard(data) {
    if (simThumbImg) simThumbImg.src = data.thumb;
    if (simMediaDuration) simMediaDuration.textContent = data.duration;
    if (simPlatformStamp) simPlatformStamp.textContent = data.platform;
    if (simResultTitle) simResultTitle.textContent = data.title;
    if (simResultAuthor) simResultAuthor.textContent = data.author;
    if (simSavePath) simSavePath.innerHTML = `Saved to: <code>${data.savePath}</code>`;
  }

  // Format selection
  formatOptions.forEach((option) => {
    option.addEventListener('click', () => {
      formatOptions.forEach((o) => o.classList.remove('active'));
      option.classList.add('active');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const formatName = option.querySelector('.format-name')?.textContent || 'Stream';
      showToast(`Selected format: ${formatName}`);
    });
  });

  // Simulate download button
  if (simBtnDownload) {
    simBtnDownload.addEventListener('click', () => {
      const data = presetData[activePresetKey];
      showToast(`Simulated download complete! File stored to ${data.savePath}`);
    });
  }

  // -------------------------------------------------------------------------
  // 4. Platform Category Filters
  // -------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const platformCards = document.querySelectorAll('.platform-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      platformCards.forEach((card) => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // 5. Device Showcase Tabs Switcher
  // -------------------------------------------------------------------------
  const showcaseTabs = document.querySelectorAll('.showcase-tab');
  const showcasePanels = document.querySelectorAll('.showcase-panel');

  showcaseTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      showcaseTabs.forEach((t) => t.classList.remove('active'));
      showcasePanels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // -------------------------------------------------------------------------
  // 6. Copy to Clipboard Handlers
  // -------------------------------------------------------------------------
  const heroCliCopy = document.getElementById('hero-cli-copy');
  if (heroCliCopy) {
    heroCliCopy.addEventListener('click', () => {
      copyToClipboard('npx @elskyx/skyc', heroCliCopy);
    });
  }

  const copyTriggers = document.querySelectorAll('.js-copy-trigger');
  copyTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const textToCopy = trigger.getAttribute('data-copy');
      if (textToCopy) {
        copyToClipboard(textToCopy, trigger);
      }
    });
  });

  const btnCopyCliTab = document.getElementById('btn-copy-cli-tab');
  if (btnCopyCliTab) {
    btnCopyCliTab.addEventListener('click', () => {
      copyToClipboard('npx @elskyx/skyc', btnCopyCliTab);
    });
  }

  function copyToClipboard(text, triggerElement) {
    navigator.clipboard.writeText(text).then(() => {
      if (triggerElement) {
        triggerElement.classList.add('copied');
        setTimeout(() => triggerElement.classList.remove('copied'), 2000);
      }
      showToast(`Copied to clipboard: ${text}`);
    }).catch(() => {
      showToast(`Command: ${text}`);
    });
  }

  // -------------------------------------------------------------------------
  // 7. Global Toast Notification Helper
  // -------------------------------------------------------------------------
  let toastTimer = null;
  const toastNotification = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-text');

  function showToast(message) {
    if (!toastNotification || !toastText) return;
    toastText.textContent = message;
    toastNotification.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3200);
  }

  // -------------------------------------------------------------------------
  // 8. Mobile Navigation Drawer
  // -------------------------------------------------------------------------
  const navHamburger = document.getElementById('nav-hamburger');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (navHamburger && mobileDrawer) {
    navHamburger.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
    });
  }

  if (drawerClose && mobileDrawer) {
    drawerClose.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
    });
  }

  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileDrawer) {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // -------------------------------------------------------------------------
  // 9. GitHub Stars Telemetry
  // -------------------------------------------------------------------------
  const ghStarCount = document.getElementById('gh-star-count');
  if (ghStarCount) {
    fetch('https://api.github.com/repos/elskyx/Skyc')
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          ghStarCount.textContent = `★ ${data.stargazers_count}`;
        }
      })
      .catch(() => {
        ghStarCount.textContent = '★ Star';
      });
  }

  // -------------------------------------------------------------------------
  // 10. Mouse Spotlight Tracker ([data-spotlight])
  // -------------------------------------------------------------------------
  const spotlightCards = document.querySelectorAll('[data-spotlight]');
  spotlightCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
