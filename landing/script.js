/**
 * Skyc Landing Page — Enhanced 21st.dev Interactive Engine
 * - Scroll Reading Progress Indicator
 * - Specular Spotlight System ([data-spotlight])
 * - 3D Perspective Tilt on Desktop ([data-tilt])
 * - Staggered Scroll Reveal (IntersectionObserver)
 * - Realistic Media Simulator 2.0 (TikTok Video, IG Carousel, Spotify Equalizer, YouTube 4K, Pinterest)
 * - Real-Time Platform Search & Category Filter
 * - Ambient Particle Canvas 2.0 (Embers & Petals)
 * - Light/Dark Theme Switcher with Persistent Memory
 * - Multi-Device Showcase Tabs
 * - Copy-to-Clipboard & Live Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Scroll Reading Progress Bar Tracker
  // -------------------------------------------------------------------------
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height > 0 && scrollProgress) {
      const scrolled = (winScroll / height) * 100;
      scrollProgress.style.width = `${scrolled}%`;
    }
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 2. Theme Management (Light / Dark)
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
      showToast(`Switched to ${newTheme === 'dark' ? 'Warm Obsidian' : 'Claude Warm Parchment'} theme`);
    });
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('skyc_landing_theme', theme);
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#141413' : '#FAF9F5');
    }
  }

  // -------------------------------------------------------------------------
  // 2b. Navigation Menu & Morphing Mobile Drawer (shadcn navigation-menu-4)
  // -------------------------------------------------------------------------
  const navHamburger = document.getElementById('nav-hamburger');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');

  function toggleMobileDrawer(open) {
    if (!mobileDrawer) return;
    const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');
    if (isOpen) {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      if (navHamburger) navHamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      if (navHamburger) navHamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (navHamburger) {
    navHamburger.addEventListener('click', () => toggleMobileDrawer());
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', () => toggleMobileDrawer(false));
  }

  // Close drawer when clicking any link
  document.querySelectorAll('.drawer-link').forEach((link) => {
    link.addEventListener('click', () => toggleMobileDrawer(false));
  });

  // Close drawer on Escape key or outside click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      toggleMobileDrawer(false);
    }
  });

  document.addEventListener('click', (e) => {
    if (mobileDrawer && mobileDrawer.classList.contains('open')) {
      if (!mobileDrawer.contains(e.target) && navHamburger && !navHamburger.contains(e.target)) {
        toggleMobileDrawer(false);
      }
    }
  });

  // Desktop Navigation Menu Dropdown keyboard & click toggles
  const navDropdownTriggers = document.querySelectorAll('.nav-menu-item.has-dropdown .nav-menu-trigger');
  navDropdownTriggers.forEach((trigger) => {
    const parentItem = trigger.closest('.nav-menu-item');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      navDropdownTriggers.forEach((t) => {
        t.setAttribute('aria-expanded', 'false');
        t.closest('.nav-menu-item')?.classList.remove('open');
      });
      if (!isExpanded) {
        trigger.setAttribute('aria-expanded', 'true');
        parentItem?.classList.add('open');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu-item.has-dropdown')) {
      navDropdownTriggers.forEach((t) => {
        t.setAttribute('aria-expanded', 'false');
        t.closest('.nav-menu-item')?.classList.remove('open');
      });
    }
  });

  // -------------------------------------------------------------------------
  // 3. 21st.dev Specular Spotlight Card System ([data-spotlight])
  // -------------------------------------------------------------------------
  const spotlightElements = document.querySelectorAll('[data-spotlight]');
  spotlightElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--spotlight-x', `${x}px`);
      el.style.setProperty('--spotlight-y', `${y}px`);
      el.style.setProperty('--spotlight-opacity', '1');
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--spotlight-opacity', '0');
    });
  });

  // -------------------------------------------------------------------------
  // 4. 3D Perspective Tilt on Desktop ([data-tilt])
  // -------------------------------------------------------------------------
  if (window.matchMedia('(pointer: fine)').matches) {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    tiltElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // -------------------------------------------------------------------------
  // 5. Scroll Reveal with IntersectionObserver
  // -------------------------------------------------------------------------
  const revealTargets = document.querySelectorAll('.section, .step-card, .platform-card, .portal-card, .arch-table-card');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    revealTargets.forEach((el) => {
      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
  }

  // -------------------------------------------------------------------------
  // 6. Ambient Canvas Particles (Botanical Embers / Petals)
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
    const particleCount = Math.min(width < 768 ? 20 : 45, 55);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        dx: (Math.random() - 0.5) * 0.45,
        dy: Math.random() * 0.4 + 0.15,
        alpha: Math.random() * 0.35 + 0.1,
        color: Math.random() > 0.4 ? 'rgba(217, 119, 87, ' : 'rgba(26, 115, 232, '
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
  // 7. Interactive Live Simulator 2.0 Engine
  // -------------------------------------------------------------------------
  const simUrlInput = document.getElementById('sim-url-input');
  const simBtnAnalyze = document.getElementById('sim-btn-analyze');
  const simTerminal = document.getElementById('sim-terminal');
  const simStatusTag = document.getElementById('sim-status-tag');
  const simMediaContainer = document.getElementById('sim-media-container');
  const simResultTitle = document.getElementById('sim-result-title');
  const simResultAuthor = document.getElementById('sim-result-author');
  const simBtnDownload = document.getElementById('sim-btn-download');
  const simSavePath = document.getElementById('sim-save-path');
  const simProgressBar = document.getElementById('simProgressBar');
  const simProgressFill = document.getElementById('simProgressFill');
  const presetChips = document.querySelectorAll('.preset-chip');
  const formatOptions = document.querySelectorAll('.format-option');

  // Instagram carousel slide state
  let igCurrentSlide = 0;
  const igSlideImages = [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=600&q=80'
  ];

  const presetData = {
    tiktok: {
      url: 'https://www.tiktok.com/@creator/video/7281920391823',
      title: 'Creative Urban Motion Graphics & Sound Design Reel',
      author: '@designcraft · 1.4M views · 1080p Original (No Watermark)',
      platform: 'TikTok',
      savePath: 'Videos\\Skyc\\TikTok_7281920_NoWatermark.mp4',
      renderMedia: () => `
        <div class="tiktok-preview-card">
          <div class="tiktok-badge-top">
            <span class="tiktok-watermark-free-pill">✓ No Watermark</span>
            <span style="font-size: 0.75rem; background: rgba(0,0,0,0.6); padding: 2px 8px; border-radius: 9999px;">1080p 60fps</span>
          </div>
          <div class="tiktok-play-overlay" id="simTiktokPlayBtn" onclick="toggleTiktokPlay(this)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div class="tiktok-footer-meta">
            <div class="tiktok-sound-track">
              <div class="tiktok-vinyl-disc">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97757"><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <span>Original Audio - Ambient Echoes</span>
            </div>
            <span style="font-family: var(--font-mono); font-size: 0.75rem;">00:48</span>
          </div>
        </div>
      `,
      logs: [
        'Extractor: TikTok WebScraper v2.4 initialized.',
        'Token bypassed: Watermark-free CDN stream resolved (1080x1920 @ 60fps).',
        'Done! Direct MP4 stream ready for offline download.'
      ]
    },
    instagram: {
      url: 'https://www.instagram.com/p/C8k9L1pA7x/',
      title: 'Architectural Heritage & Brutalist Facades Portfolio',
      author: '@arch_journal · 8 Uncompressed Photos · High-Res JPG',
      platform: 'Instagram',
      savePath: 'Pictures\\Skyc\\Instagram_C8k9L1p_Album.pdf',
      renderMedia: () => {
        igCurrentSlide = 0;
        return `
          <div class="ig-carousel-card">
            <div class="ig-carousel-counter" id="igCarouselCounter">1 / ${igSlideImages.length}</div>
            <div class="ig-carousel-nav-btn ig-carousel-prev" onclick="changeIgSlide(-1)">❮</div>
            <div class="ig-carousel-nav-btn ig-carousel-next" onclick="changeIgSlide(1)">❯</div>
            <div class="ig-carousel-slider" id="igCarouselSlider">
              ${igSlideImages.map(src => `
                <div class="ig-carousel-slide">
                  <img src="${src}" alt="Instagram Carousel Slide" />
                </div>
              `).join('')}
            </div>
            <div class="ig-carousel-dots" id="igCarouselDots">
              ${igSlideImages.map((_, i) => `<div class="ig-carousel-dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
            </div>
          </div>
        `;
      },
      logs: [
        'Extractor: Instagram GraphQL resolver mounted.',
        'Carousel detected: 8 original uncompressed media nodes unpacked.',
        'Photo-to-PDF compiler active: 8 pages sequence ready.'
      ]
    },
    spotify: {
      url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
      title: 'Resonance — Ambient Electronic Master Edition',
      author: 'HOME · Album: Odyssey · 320 kbps Lossless ID3',
      platform: 'Spotify',
      savePath: 'Music\\Skyc\\HOME_Resonance_320k.mp3',
      renderMedia: () => `
        <div class="spotify-preview-card">
          <div class="spotify-art-row">
            <img class="spotify-art-cover" src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80" alt="Album Cover" />
            <div class="spotify-track-info">
              <h4>Resonance</h4>
              <p>HOME · Odyssey (2024 Remaster)</p>
              <span style="font-size: 0.7rem; color: var(--accent); font-weight: 700; text-transform: uppercase;">MP3 320 KBPS</span>
            </div>
          </div>
          <div class="spotify-waveform-box" title="Audio Equalizer Preview">
            <div class="waveform-bar"></div><div class="waveform-bar"></div>
            <div class="waveform-bar"></div><div class="waveform-bar"></div>
            <div class="waveform-bar"></div><div class="waveform-bar"></div>
            <div class="waveform-bar"></div><div class="waveform-bar"></div>
            <div class="waveform-bar"></div><div class="waveform-bar"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
            <span>01:14</span>
            <span>03:32</span>
          </div>
        </div>
      `,
      logs: [
        'Extractor: Spotify Web API & Track Matcher active.',
        'ID3 Tag Metadata: Artist, Title, Album Art, ISRC matched.',
        'Lossless stream buffered: High-quality MP3 (320 kbps) ready.'
      ]
    },
    youtube: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Rick Astley — Never Gonna Give You Up (Official 4K Remaster)',
      author: 'Rick Astley · 1.5B views · 4K UHD 60fps + Opus Audio',
      platform: 'YouTube',
      savePath: 'Videos\\Skyc\\RickAstley_4K60fps.mp4',
      renderMedia: () => `
        <div class="youtube-preview-card">
          <span class="youtube-quality-badge-top">4K ULTRA HD</span>
          <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80" alt="YouTube Video Preview" />
          <div class="tiktok-play-overlay">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div style="position: absolute; bottom: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; color: #fff; font-size: 0.8rem; z-index: 2; background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 6px;">
            <span>Adaptive Video + Audio Mux</span>
            <span style="font-family: var(--font-mono);">03:33</span>
          </div>
        </div>
      `,
      logs: [
        'Extractor: YouTube Player Config & Signature Decipherer loaded.',
        'Adaptive stream resolved: 4K UHD video + Opus audio stream multiplex.',
        'Ready! Formats extracted: 4K UHD, 1080p60, 720p, and MP3 audio.'
      ]
    },
    pinterest: {
      url: 'https://www.pinterest.com/pin/1042865232456789/',
      title: 'Minimalist Japanese Tea Ceremony Ceramic Pottery',
      author: 'CeramicCrafts · 4096 × 2730 Master Resolution',
      platform: 'Pinterest',
      savePath: 'Pictures\\Skyc\\Pinterest_Ceramics_4K.jpg',
      renderMedia: () => `
        <div class="youtube-preview-card" style="background: #111;">
          <span style="position: absolute; top: 12px; left: 12px; background: rgba(217, 119, 87, 0.95); padding: 0.25rem 0.65rem; border-radius: 9999px; color: #fff; font-size: 0.75rem; font-weight: 800; z-index: 3;">4096 × 2730</span>
          <img src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80" alt="Pinterest 4K Artwork" style="transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" />
        </div>
      `,
      logs: [
        'Extractor: Pinterest Resource JSON parser triggered.',
        'Deep image URL detected: /originals/ 4K uncompressed master.',
        'Success! 4K Master JPG ready for instant local saving.'
      ]
    }
  };

  let activePresetKey = 'tiktok';

  // Global helper for Instagram carousel navigation
  window.changeIgSlide = function(direction) {
    igCurrentSlide += direction;
    if (igCurrentSlide < 0) igCurrentSlide = igSlideImages.length - 1;
    if (igCurrentSlide >= igSlideImages.length) igCurrentSlide = 0;

    const slider = document.getElementById('igCarouselSlider');
    const counter = document.getElementById('igCarouselCounter');
    const dots = document.querySelectorAll('.ig-carousel-dot');

    if (slider) slider.style.transform = `translateX(-${igCurrentSlide * 100}%)`;
    if (counter) counter.textContent = `${igCurrentSlide + 1} / ${igSlideImages.length}`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === igCurrentSlide);
    });
  };

  // Global helper for TikTok play toggle
  window.toggleTiktokPlay = function(btn) {
    const isPlaying = btn.classList.toggle('playing');
    btn.innerHTML = isPlaying 
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    showToast(isPlaying ? 'Playing simulated stream' : 'Paused');
  };

  // Preset click
  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      presetChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const key = chip.getAttribute('data-platform');
      if (presetData[key]) {
        activePresetKey = key;
        const data = presetData[key];
        if (simUrlInput) simUrlInput.value = data.url;
        runSimulator(data);
      }
    });
  });

  // Analyze click
  if (simBtnAnalyze) {
    simBtnAnalyze.addEventListener('click', () => {
      const currentUrl = (simUrlInput ? simUrlInput.value : '').trim();
      let matchedData = presetData[activePresetKey];

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
      if (simStatusTag) {
        simStatusTag.textContent = 'Resolving Local Stream...';
        simStatusTag.className = 'diag-status resolving';
      }
      if (simTerminal) {
        simTerminal.innerHTML = '<div class="log-line"><span class="log-ts">[0.00s]</span> Injecting client-side scraper module...</div>';
      }

      setTimeout(() => {
        renderSimulatorContent(data);
        if (simStatusTag) {
          simStatusTag.textContent = 'Ready (Zero-Cloud)';
          simStatusTag.className = 'diag-status';
        }
      }, 350);
    } else {
      renderSimulatorContent(data);
    }
  }

  function renderSimulatorContent(data) {
    if (simMediaContainer) {
      simMediaContainer.innerHTML = data.renderMedia();
    }
    if (simResultTitle) simResultTitle.textContent = data.title;
    if (simResultAuthor) simResultAuthor.textContent = data.author;
    if (simSavePath) simSavePath.innerHTML = `Saved to: <code>${data.savePath}</code>`;

    if (simTerminal) {
      simTerminal.innerHTML = '';
      data.logs.forEach((logText, idx) => {
        const div = document.createElement('div');
        div.className = 'log-line' + (idx === data.logs.length - 1 ? ' success' : '');
        div.innerHTML = `<span class="log-ts">[0.${(idx + 1) * 6}s]</span> ${logText}`;
        simTerminal.appendChild(div);
      });
    }
  }

  // Initial simulator render
  if (presetData[activePresetKey]) {
    renderSimulatorContent(presetData[activePresetKey]);
  }

  // Simulated download trigger
  if (simBtnDownload) {
    simBtnDownload.addEventListener('click', () => {
      const data = presetData[activePresetKey];
      simBtnDownload.disabled = true;
      simBtnDownload.innerHTML = `
        <svg class="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        <span>Streaming to Storage...</span>
      `;

      if (simProgressBar && simProgressFill) {
        simProgressBar.classList.add('active');
        simProgressFill.style.width = '0%';
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          simProgressFill.style.width = `${progress}%`;
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              simBtnDownload.disabled = false;
              simBtnDownload.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Saved to Disk!</span>
              `;
              showToast(`✓ Saved: ${data.savePath}`);

              setTimeout(() => {
                simProgressBar.classList.remove('active');
                simProgressFill.style.width = '0%';
                simBtnDownload.innerHTML = `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  <span>Simulate Save to Device</span>
                `;
              }, 2200);
            }, 300);
          }
        }, 120);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 8. Platform Search & Category Filtering
  // -------------------------------------------------------------------------
  const platformSearchInput = document.getElementById('platformSearchInput');
  const platformSearchCount = document.getElementById('platformSearchCount');
  const platformFilterButtons = document.querySelectorAll('.filter-btn, .platform-filter-btn');
  const platformCards = document.querySelectorAll('.platform-card');
  let currentCategory = 'all';

  function filterPlatforms() {
    const q = (platformSearchInput ? platformSearchInput.value : '').toLowerCase().trim();
    let visibleCount = 0;

    platformCards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardTitle = (card.querySelector('.platform-name')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.platform-desc, .platform-detail')?.textContent || '').toLowerCase();

      const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory;
      const matchesSearch = !q || cardTitle.includes(q) || cardDesc.includes(q);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (platformSearchCount) {
      platformSearchCount.textContent = `${visibleCount} of 16 platforms`;
    }
  }

  if (platformSearchInput) {
    platformSearchInput.addEventListener('input', filterPlatforms);
  }

  platformFilterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      platformFilterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      filterPlatforms();
    });
  });

  // -------------------------------------------------------------------------
  // 9. Multi-Device Showcase Tabs
  // -------------------------------------------------------------------------
  const tabButtons = document.querySelectorAll('.showcase-tab-btn');
  const tabPanes = document.querySelectorAll('.showcase-tab-pane');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${targetId}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // -------------------------------------------------------------------------
  // 10. Copy-to-Clipboard & Interactive Toasts
  // -------------------------------------------------------------------------
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied: ${textToCopy}`);
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span>✓ Copied!</span>';
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 1800);
        }).catch(() => {
          showToast('Failed to copy');
        });
      }
    });
  });

  // Global Toast Function
  window.showToast = function(msg) {
    let toast = document.getElementById('skyc-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'skyc-toast';
      toast.className = 'skyc-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  };

  // -------------------------------------------------------------------------
  // 9. Halftone Wordmark Footer Engine (21st.dev Design Engineering)
  // -------------------------------------------------------------------------
  (function initHalftoneFooter() {
    const root = document.getElementById('halftone-footer');
    const canvas = document.getElementById('hwf-canvas');
    if (!root || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const backToTopBtn = document.getElementById('hwf-back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let px = -1e5;
    let py = -1e5;
    let raf = 0;
    let visible = true;
    let awake = true;
    let ring = { x: 0, y: 0, t: -1 };
    let dots = new Float32Array(0);
    let count = 0;
    let grainTile = null;

    const wordmark = 'skyc';
    const dotGap = 6.5;
    const radius = 85;
    const crop = 0.22;
    const grain = 0.45;
    const fontFamily = "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif";
    const fontWeight = 900;
    const bgColor = '#0c0c0b';
    const ink = [250, 249, 245]; // #FAF9F5
    const warm = [217, 119, 87]; // #D97757 Terracotta

    function hwfRadius(coverage, gap) {
      const c = coverage < 0 ? 0 : coverage > 1 ? 1 : coverage;
      return Math.sqrt(c) * gap * 0.56;
    }

    function hwfStep(x, y, vx, vy, hx, hy, px, py, r) {
      const dx = x - px;
      const dy = y - py;
      const d2 = dx * dx + dy * dy;
      if (r > 0 && d2 < r * r) {
        const d = Math.sqrt(d2) + 0.001;
        const f = (1 - d / r) * 2.6;
        vx += (dx / d) * f;
        vy += (dy / d) * f;
      }
      vx = (vx + (hx - x) * 0.05) * 0.84;
      vy = (vy + (hy - y) * 0.05) * 0.84;
      return [x + vx, y + vy, vx, vy];
    }

    function hwfWarmth(x, y, hx, hy, span) {
      const d = Math.hypot(x - hx, y - hy);
      return span > 0 ? Math.min(1, d / span) : 0;
    }

    function layout() {
      const rect = root.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Render wordmark onto offscreen mask
      const mask = document.createElement('canvas');
      mask.width = w;
      mask.height = h;
      const m = mask.getContext('2d', { willReadFrequently: true });
      if (!m) return;

      m.font = fontWeight + ' 100px ' + fontFamily;
      const measure = m.measureText(wordmark).width;
      const fit = measure > 0 ? (w * 1.02 / measure) * 100 : 100;
      m.font = fontWeight + ' ' + fit + 'px ' + fontFamily;
      const box = m.measureText(wordmark);
      const cap = box.actualBoundingBoxAscent || fit * 0.72;
      m.fillStyle = '#000';
      m.textBaseline = 'alphabetic';
      m.fillText(wordmark, (w - box.width) / 2, h + cap * crop);
      const img = m.getImageData(0, 0, w, h).data;

      const gap = Math.max(3, dotGap);
      const cols = Math.ceil(w / gap);
      const rows = Math.ceil(h / gap);
      const tmp = [];

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          let sum = 0;
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3));
              const y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3));
              sum += img[(y * w + x) * 4 + 3];
            }
          }
          const cov = sum / (9 * 255);
          if (cov < 0.06) continue;
          const hx = gx * gap + gap / 2;
          const hy = gy * gap + gap / 2;
          tmp.push(hx, hy, 0, 0, hx, hy, hwfRadius(cov, gap));
        }
      }
      dots = new Float32Array(tmp);
      count = tmp.length / 7;

      // Print grain tile
      grainTile = document.createElement('canvas');
      grainTile.width = 256;
      grainTile.height = 256;
      const g = grainTile.getContext('2d');
      if (g) {
        const id = g.createImageData(256, 256);
        for (let i = 0; i < id.data.length; i += 4) {
          const v = Math.random() * 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
          id.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
        }
        g.putImageData(id, 0, 0);
      }
      awake = true;
    }

    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      const r = !reduced ? radius : 0;
      const ringAge = ring.t < 0 ? 1e9 : now - ring.t;
      const ringR = ringAge * 0.9;
      let moving = false;

      for (let i = 0; i < count; i++) {
        const j = i * 7;
        let x = dots[j];
        let y = dots[j + 1];
        let vx = dots[j + 2];
        let vy = dots[j + 3];
        const hx = dots[j + 4];
        const hy = dots[j + 5];

        if (!reduced) {
          if (ringAge < 900) {
            const dx = hx - ring.x;
            const dy = hy - ring.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const band = 1 - Math.min(1, Math.abs(d - ringR) / 26);
            if (band > 0) {
              const f = band * 3.2 * (1 - ringAge / 900);
              vx += (dx / d) * f;
              vy += (dy / d) * f;
            }
          }
          const s = hwfStep(x, y, vx, vy, hx, hy, px, py, r);
          x = s[0];
          y = s[1];
          vx = s[2];
          vy = s[3];
          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) {
            moving = true;
          } else {
            x = hx;
            y = hy;
            vx = 0;
            vy = 0;
          }
          dots[j] = x;
          dots[j + 1] = y;
          dots[j + 2] = vx;
          dots[j + 3] = vy;
        }

        const k = hwfWarmth(x, y, hx, hy, 28);
        ctx.fillStyle = k > 0.02
          ? 'rgb(' +
            Math.round(ink[0] + (warm[0] - ink[0]) * k) + ',' +
            Math.round(ink[1] + (warm[1] - ink[1]) * k) + ',' +
            Math.round(ink[2] + (warm[2] - ink[2]) * k) + ')'
          : '#FAF9F5';
        ctx.beginPath();
        ctx.arc(x, y, dots[j + 6], 0, 6.2832);
        ctx.fill();
      }

      if (grainTile && grain > 0) {
        ctx.globalAlpha = Math.min(1, grain) * 0.09;
        ctx.globalCompositeOperation = 'overlay';
        const pattern = ctx.createPattern(grainTile, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      awake = moving || ringAge < 900 || px > -1e4;
    }

    function loop(now) {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (awake) raf = requestAnimationFrame(loop);
    }

    function wake() {
      awake = true;
      if (!raf && visible) raf = requestAnimationFrame(loop);
    }

    function toLocal(e) {
      const b = canvas.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    }

    root.addEventListener('pointermove', (e) => {
      const p = toLocal(e);
      px = p[0];
      py = p[1];
      wake();
    });

    root.addEventListener('pointerleave', () => {
      px = -1e5;
      py = -1e5;
      wake();
    });

    root.addEventListener('pointerdown', (e) => {
      if (reduced) return;
      if (e.target && e.target.closest('a, button')) return;
      const p = toLocal(e);
      ring = { x: p[0], y: p[1], t: performance.now() };
      wake();
    });

    const ro = new ResizeObserver(() => {
      layout();
      wake();
    });
    ro.observe(root);

    const io = new IntersectionObserver((entries) => {
      visible = entries[0] ? entries[0].isIntersecting : true;
      if (visible) wake();
    });
    io.observe(root);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        layout();
        wake();
      });
    }

    layout();
    draw(performance.now());
    wake();
  })();

  // -------------------------------------------------------------------------
  // 10. Interactive Liquid Sculpture Mascot Engine (21st.dev guglielmogiannattasio.it)
  // -------------------------------------------------------------------------
  (function initSculptureHero() {
    const wrapper = document.getElementById('hero-sculpture-wrapper');
    const stage = document.getElementById('sh-stage');
    const canvas = document.getElementById('sculpture-canvas');
    if (!wrapper || !stage || !canvas) return;

    function onFail() {
      wrapper.setAttribute('data-gl', 'off');
    }

    const NOISE = `
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
vec2 ambientField(vec2 uv, float t){
  vec2 q = uv*vec2(3.2,1.7);
  vec2 a = vec2(vnoise(q+vec2(t*0.11,0.0))-0.5, vnoise(q+vec2(5.2,t*0.08)+3.1)-0.5);
  vec2 q2 = uv*vec2(7.5,4.0) + vec2(-t*0.19, t*0.13);
  vec2 b = vec2(vnoise(q2+1.7)-0.5, vnoise(q2+9.3)-0.5);
  return a + b*0.45;
}
`;

    const ENERGY = `
float energyAt(vec2 rectPx, vec2 mouse, float radius, float presence, float wakeEnergy){
  vec2 d = rectPx - mouse;
  float f = exp(-dot(d,d)/(radius*radius))*presence;
  return smoothstep(0.06, 0.5, f*1.15 + wakeEnergy*1.7);
}
`;

    const QUAD_VS = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }
`;

    const FLOW_FS = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform vec2 uSize;
uniform float uRadius;
uniform float uPresence;
uniform float uDecay;
vec2 decV(vec4 c){ return (c.rg*255.0-128.0)/127.0; }
void main(){
  vec2 v0 = decV(texture(uPrev, vUv));
  vec2 uv = vUv - v0*uTexel*2.5;
  vec4 c = texture(uPrev, uv)*0.52
    + 0.12*(texture(uPrev, uv+vec2(uTexel.x,0.0)) + texture(uPrev, uv-vec2(uTexel.x,0.0))
          + texture(uPrev, uv+vec2(0.0,uTexel.y)) + texture(uPrev, uv-vec2(0.0,uTexel.y)));
  vec2 v = decV(c);
  float p = c.b;
  vec2 d = (vUv-uMouse)*uSize;
  float f = exp(-dot(d,d)/(uRadius*uRadius))*uPresence;
  float sp = clamp(length(uVel)*2.5, 0.0, 1.0);
  v += uVel*f*0.22;
  p = max(p, f*sp);
  v *= uDecay;
  p *= uDecay;
  v = sign(v)*max(abs(v)-1.2/127.0, 0.0);
  p = max(p-1.2/255.0, 0.0);
  v = clamp(v, -1.0, 1.0);
  o = vec4((v*127.0+128.0)/255.0, p, 1.0);
}
`;

    const SIM_FS = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uState;
uniform sampler2D uHome;
uniform sampler2D uFlow;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uPresence;
uniform float uStrength;
uniform float uSpread;
uniform float uTurb;
uniform float uReturn;
uniform float uTime;
uniform float uDt;
uniform float uIntro;
${NOISE}
vec2 curl(vec2 p){
  const float e = 0.35;
  float a = vnoise(p+vec2(0.0,e)) - vnoise(p-vec2(0.0,e));
  float b = vnoise(p+vec2(e,0.0)) - vnoise(p-vec2(e,0.0));
  return vec2(a, -b)/(2.0*e);
}
void main(){
  ivec2 ij = ivec2(gl_FragCoord.xy);
  vec4 hm = texelFetch(uHome, ij, 0);
  if(hm.w <= 0.0){ o = vec4(0.0); return; }
  vec4 st = texelFetch(uState, ij, 0);
  vec2 off = st.xy;
  vec2 vel = st.zw;
  float sd = hm.z;
  float light = 0.45 + sd*1.1;

  vec2 p = hm.xy*uSize + off;
  vec4 fl = texture(uFlow, clamp(p/uSize, 0.0, 1.0));
  vec2 wake = (fl.rg*255.0-128.0)/127.0;
  float pr = fl.b;

  vec2 toM = p - uMouse;
  float r2 = dot(toM,toM);
  float f = exp(-r2/(uRadius*uRadius))*uPresence;
  vec2 n = toM*inversesqrt(r2+1.0);
  float e = clamp(pr*2.0 + f, 0.0, 1.0);

  vec2 acc = vec2(0.0);
  acc += n*f*1.25*uStrength*uSpread*light;
  acc += vec2(-n.y, n.x)*f*1.45*uStrength*uSpread*(0.4+sd);
  acc += (wake*42.0*uSpread*light - vel)*e*0.08;
  vec2 q = p*0.0095 + vec2(uTime*0.35, -uTime*0.2);
  vec2 c = curl(q) + 0.5*curl(q*2.3 + 7.1);
  acc += c*(e*1.2*uSpread + uIntro*1.5)*uTurb*light;
  float k = (0.006 + 0.02*uReturn)*(0.65+sd*0.7)*(1.0 - uIntro*0.75);
  acc -= off*k;

  vel += acc*uDt;
  vel *= pow(mix(0.93, 0.955, e), uDt);
  off += vel*uDt;
  if(dot(off,off) < 0.0004 && dot(vel,vel) < 0.0004){ off = vec2(0.0); vel = vec2(0.0); }
  o = vec4(off, vel);
}
`;

    const PART_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aCorner;
uniform sampler2D uState;
uniform sampler2D uHome;
uniform sampler2D uCol;
uniform sampler2D uFlow;
uniform int uTexW;
uniform vec4 uRect;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uPresence;
uniform float uDot;
uniform float uTime;
uniform float uAmbient;
uniform float uStreak;
uniform float uIntroVis;
uniform float uRest;
uniform vec3 uTint;
out vec2 vLocal;
out float vHalfLen;
out float vR;
out vec3 vCol;
out float vA;
${NOISE}
${ENERGY}
void main(){
  int id = gl_InstanceID;
  ivec2 ij = ivec2(id % uTexW, id / uTexW);
  vec4 hm = texelFetch(uHome, ij, 0);
  vec4 st = texelFetch(uState, ij, 0);
  vec4 cl = texelFetch(uCol, ij, 0);

  float wakeE = texture(uFlow, hm.xy).b;
  float E = energyAt(hm.xy*uRect.zw, uMouse, uRadius, uPresence, wakeE);
  float lift = smoothstep(0.35, 2.5, length(st.xy));
  float a = max(max(E, lift), max(uRest, 1.0-uIntroVis));
  if(a < 0.01 || hm.w <= 0.0){ gl_Position = vec4(2.0,2.0,2.0,1.0); return; }

  vec2 base = uRect.xy + hm.xy*uRect.zw + st.xy;
  base -= ambientField(hm.xy, uTime)*10.0*uAmbient;

  vec2 v = st.zw;
  float sp = length(v);
  vec2 dir = sp > 0.001 ? v/sp : vec2(1.0,0.0);
  float r = uDot*hm.w*0.5;
  float len = min(sp*1.25, 18.0)*uStreak;
  vec2 lc = aCorner*vec2(r + len*0.5 + 1.0, r + 1.0);
  vec2 center = base - dir*len*0.5;
  vec2 world = center + dir*lc.x + vec2(-dir.y, dir.x)*lc.y;

  vec2 clip = world/uRes*2.0-1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vLocal = lc;
  vHalfLen = len*0.5;
  vR = r;
  vec3 col = cl.rgb*uTint;
  float glint = smoothstep(2.0, 16.0, sp);
  col = mix(col, min(col*1.18 + vec3(0.07,0.075,0.085), vec3(1.0)), glint*0.75);
  vCol = col;
  vA = a;
}
`;

    const PART_FS = `#version 300 es
precision highp float;
in vec2 vLocal;
in float vHalfLen;
in float vR;
in vec3 vCol;
in float vA;
uniform float uDpr;
out vec4 o;
void main(){
  vec2 q = vec2(max(abs(vLocal.x)-vHalfLen, 0.0), vLocal.y);
  float d = length(q) - vR;
  float a = clamp(0.5 - d*uDpr, 0.0, 1.0);
  float tail = vHalfLen > 0.0 ? clamp(0.5 - vLocal.x/(2.0*(vHalfLen+vR)), 0.0, 1.0) : 0.0;
  a *= 1.0 - tail*0.55;
  a *= vA;
  if(a < 0.004) discard;
  o = vec4(vCol*a, a);
}
`;

    const IMAGE_FS = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uImg;
uniform sampler2D uFlow;
uniform vec2 uRes;
uniform float uDpr;
uniform vec4 uRect;
uniform vec3 uBg;
uniform vec3 uImgBg;
uniform vec2 uMouse;
uniform float uPresence;
uniform float uRadius;
uniform float uStrength;
uniform float uTime;
uniform float uAmbient;
uniform float uIntroVis;
uniform float uRest;
uniform float uAlphaMode;
${NOISE}
${ENERGY}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y*uDpr - gl_FragCoord.y)/uDpr;
  vec2 size = uRect.zw;
  vec2 uv = (px-uRect.xy)/size;
  if(uv.x < -0.05 || uv.x > 1.05 || uv.y < -0.12 || uv.y > 1.12){ o = vec4(0.0); return; }
  vec4 fl = texture(uFlow, clamp(uv,0.0,1.0));
  vec2 vel = (fl.rg*255.0-128.0)/127.0;
  vec2 rp = uv*size;
  vec2 toM = rp - uMouse;
  float fall = exp(-dot(toM,toM)/(uRadius*uRadius))*uPresence;
  vec2 disp = -toM*0.22*uStrength*fall - vel*10.0*uStrength;
  disp += ambientField(uv, uTime)*10.0*uAmbient;
  vec2 suv = uv + disp/size;
  vec4 tx = texture(uImg, suv);
  vec3 col = tx.rgb;
  vec2 e = smoothstep(vec2(0.0), vec2(0.004,0.01), suv) * smoothstep(vec2(1.0), vec2(0.996,0.99), suv);
  float key = uAlphaMode > 0.5 ? tx.a : smoothstep(0.012, 0.05, length(col-uImgBg));
  float k = key*e.x*e.y;
  float E = energyAt(rp, uMouse, uRadius, uPresence, fl.b);
  float show = (1.0 - max(E, uRest))*uIntroVis;
  vec3 mat = uAlphaMode > 0.5 ? col : col*(uBg/max(uImgBg, vec3(0.001)));
  float A = k*show;
  o = vec4(mat*A, A);
}
`;

    function compileProg(gl, vs, fs) {
      const make = (type, src) => {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          const log = gl.getShaderInfoLog(sh);
          gl.deleteShader(sh);
          throw new Error('Shader: ' + log);
        }
        return sh;
      };
      const p = gl.createProgram();
      const v = make(gl.VERTEX_SHADER, vs);
      const f = make(gl.FRAGMENT_SHADER, fs);
      gl.attachShader(p, v);
      gl.attachShader(p, f);
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      gl.deleteShader(v);
      gl.deleteShader(f);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error('Link: ' + gl.getProgramInfoLog(p));
      }
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        if (info) u[info.name] = gl.getUniformLocation(p, info.name);
      }
      return { p, u };
    }

    function clampVal(v, a, b) {
      return Math.min(b, Math.max(a, v));
    }

    const TEX_W = 1024;
    const SETTLE_FRAMES = 240;

    class SculptureEngine {
      constructor(canvasEl) {
        this.canvas = canvasEl;
        this.opts = {
          interactive: true,
          strength: 1.0,
          radius: 130,
          density: 1.0,
          dotSize: 1.15,
          spread: 1.0,
          turbulence: 1.0,
          returnSpeed: 1.1,
          streaks: true,
          restStyle: 'image',
          ambient: true,
          ambientIntensity: 0.25,
          speed: 1.0,
          intro: true,
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          bg: [0.98, 0.976, 0.96],
          imgBg: null,
          liquid: 1.0
        };

        const gl = canvasEl.getContext('webgl2', {
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance'
        });
        if (!gl) throw new Error('WebGL2 unavailable');
        this.gl = gl;

        const nav = navigator;
        this.lowPower = (nav.hardwareConcurrency || 8) <= 4 || ((nav).deviceMemory || 8) <= 4;

        this.initGL();
        canvasEl.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          this.lost = true;
          this.stop();
          onFail();
        }, false);
      }

      initGL() {
        const gl = this.gl;
        const full = gl.getExtension('EXT_color_buffer_float');
        const half = full ? null : gl.getExtension('EXT_color_buffer_half_float');
        if (!full && !half) throw new Error('No float render targets');
        this.stateFormat = { internal: gl.RGBA16F, type: gl.HALF_FLOAT };

        this.pFlow = compileProg(gl, QUAD_VS, FLOW_FS);
        this.pSim = compileProg(gl, QUAD_VS, SIM_FS);
        this.pPart = compileProg(gl, PART_VS, PART_FS);
        this.pImg = compileProg(gl, QUAD_VS, IMAGE_FS);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        this.quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        this.flowTex = [];
        this.flowFb = [];
        this.flowW = 256;
        this.flowH = 104;
        this.flowIdx = 0;
        this.flowDirty = false;

        for (let i = 0; i < 2; i++) {
          const t = this.makeTex(gl.RGBA8, this.flowW, this.flowH, gl.RGBA, gl.UNSIGNED_BYTE, null, gl.LINEAR);
          const fb = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
          this.flowTex.push(t);
          this.flowFb.push(fb);
        }
        this.clearFlow();

        this.stateTex = [];
        this.stateFb = [];
        this.stateIdx = 0;
        this.texH = 1;
        this.n = 0;
        this.gridW = 1;
        this.stateDirty = false;
        this.alphaMode = true;
        this.imgBg = [0.92, 0.92, 0.91];
        this.flowing = 0;

        this.rect = { x: 0, y: 0, w: 1, h: 1 };
        this.cssW = 1;
        this.cssH = 1;

        this.target = { x: -9999, y: -9999 };
        this.mouse = { x: -9999, y: -9999 };
        this.prevMouse = { x: -9999, y: -9999 };
        this.mvel = { x: 0, y: 0 };
        this.presence = 0;
        this.presenceTarget = 0;
        this.burst = 0;
        this.settle = 1e9;
        this.touchRelease = 0;

        this.time = 0;
        this.introT = 1;
        this.raf = 0;
        this.running = false;
        this.last = 0;
        this.visible = true;
        this.ready = false;
        this.destroyed = false;
        this.lost = false;
        this.onFirstFrame = null;
      }

      makeTex(internal, w, h, format, type, data, filter) {
        const gl = this.gl;
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      }

      clearFlow() {
        const gl = this.gl;
        for (const fb of this.flowFb) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.viewport(0, 0, this.flowW, this.flowH);
          gl.clearColor(128 / 255, 128 / 255, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.flowDirty = false;
      }

      clearState() {
        const gl = this.gl;
        for (const fb of this.stateFb) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.viewport(0, 0, TEX_W, this.texH);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.stateDirty = false;
      }

      setImage(img) {
        if (this.destroyed || this.lost) return;
        const gl = this.gl;
        this.aspect = (img.naturalWidth / img.naturalHeight) || 1.0;
        this.flowH = Math.max(32, Math.round(this.flowW / this.aspect));
        for (const t of this.flowTex) {
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.flowW, this.flowH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        this.clearFlow();

        if (this.imgTex) gl.deleteTexture(this.imgTex);
        this.imgTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.imgTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.buildParticles(img);
        this.ready = true;
        if (this.opts.intro && !this.opts.reducedMotion) this.startIntro();
        this.wake();
      }

      buildParticles(img) {
        const gl = this.gl;
        const baseGrid = this.lowPower ? 480 : 700;
        const gw = Math.round(baseGrid * Math.sqrt(clampVal(this.opts.density, 0.15, 2)));
        const gh = Math.max(1, Math.round(gw / this.aspect));
        this.gridW = gw;

        const c = document.createElement('canvas');
        c.width = gw;
        c.height = gh;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('2D context failed');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, gw, gh);
        const data = ctx.getImageData(0, 0, gw, gh).data;

        let transparent = 0;
        for (let i = 3; i < data.length; i += 4 * 7) if (data[i] < 250) transparent++;
        this.alphaMode = transparent > (data.length / (4 * 7) / 20);

        const home = [];
        const col = [];
        for (let y = 0; y < gh; y++) {
          for (let x = 0; x < gw; x++) {
            const i = (y * gw + x) * 4;
            if (this.alphaMode) {
              const a = data[i + 3] / 255;
              if (a < 0.12) continue;
              if (a < 0.5 && Math.random() > a * 2) continue;
            } else {
              const dev = Math.hypot(data[i]/255 - 0.95, data[i+1]/255 - 0.95, data[i+2]/255 - 0.95);
              if (dev < 0.04) continue;
            }
            const jx = (Math.random() - 0.5) * 0.6;
            const jy = (Math.random() - 0.5) * 0.6;
            home.push((x + 0.5 + jx) / gw, (y + 0.5 + jy) / gh, Math.random(), 0.85 + Math.random() * 0.3);
            col.push(data[i], data[i + 1], data[i + 2], 255);
          }
        }

        const n = home.length / 4;
        this.n = n;
        this.texH = Math.max(1, Math.ceil(n / TEX_W));
        const total = TEX_W * this.texH;
        const homeArr = new Float32Array(total * 4);
        homeArr.set(home);
        const colArr = new Uint8Array(total * 4);
        colArr.set(col);

        if (this.homeTex) gl.deleteTexture(this.homeTex);
        if (this.colTex) gl.deleteTexture(this.colTex);
        for (const t of this.stateTex) gl.deleteTexture(t);
        for (const f of this.stateFb) gl.deleteFramebuffer(f);
        this.stateTex = [];
        this.stateFb = [];

        this.homeTex = this.makeTex(gl.RGBA32F, TEX_W, this.texH, gl.RGBA, gl.FLOAT, homeArr, gl.NEAREST);
        this.colTex = this.makeTex(gl.RGBA8, TEX_W, this.texH, gl.RGBA, gl.UNSIGNED_BYTE, colArr, gl.NEAREST);

        for (let i = 0; i < 2; i++) {
          const t = this.makeTex(this.stateFormat.internal, TEX_W, this.texH, gl.RGBA, this.stateFormat.type, null, gl.NEAREST);
          const fb = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
          this.stateTex.push(t);
          this.stateFb.push(fb);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.homeData = homeArr;
        this.clearState();
      }

      startIntro() {
        const gl = this.gl;
        const home = this.homeData;
        if (!home) return;
        const w = this.rect.w > 10 ? this.rect.w : 340;
        const total = TEX_W * this.texH;
        const st = new Float32Array(total * 4);
        for (let i = 0; i < this.n; i++) {
          const hx = home[i * 4] - 0.5;
          const hy = home[i * 4 + 1] - 0.5;
          const sd = home[i * 4 + 2];
          const ang = (Math.random() - 0.5) * 0.9 + (hx > 0 ? 0 : Math.PI);
          const dist = w * (0.04 + Math.random() * 0.14) * (0.5 + Math.abs(hx) * 1.4);
          st[i * 4] = Math.cos(ang) * dist + hx * w * 0.25 * sd;
          st[i * 4 + 1] = Math.sin(ang) * dist * 0.55 + hy * 120 * (Math.random() - 0.5);
        }
        gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.stateFormat.internal, TEX_W, this.texH, 0, gl.RGBA, gl.FLOAT, st);
        this.introT = 0;
        this.stateDirty = true;
      }

      resize(cssW, cssH, rect) {
        this.cssW = Math.max(1, cssW);
        this.cssH = Math.max(1, cssH);
        this.rect = rect;
        const dpr = Math.min(window.devicePixelRatio || 1, this.lowPower ? 1.5 : 2);
        const w = Math.round(this.cssW * dpr);
        const h = Math.round(this.cssH * dpr);
        if (this.canvas.width !== w || this.canvas.height !== h) {
          this.canvas.width = w;
          this.canvas.height = h;
        }
        this.draw();
      }

      setVisible(v) {
        this.visible = v;
        if (v) this.wake();
        else this.stop();
      }

      pointer(type, x, y, touch) {
        if (!this.opts.interactive || this.lost) return;
        const now = performance.now();
        if (type === 'leave' || type === 'up') {
          if (touch) this.touchRelease = now + 260;
          else this.presenceTarget = 0;
          this.wake();
          return;
        }
        if (this.mouse.x < -9000 || type === 'down') {
          this.mouse.x = this.prevMouse.x = x;
          this.mouse.y = this.prevMouse.y = y;
        }
        this.target.x = x;
        this.target.y = y;
        this.presenceTarget = 1;
        this.settle = 0;
        if (type === 'down') {
          this.burst = 1;
          this.touchRelease = 0;
        }
        this.wake();
      }

      wake() {
        if (!this.ready || this.running || !this.visible || this.destroyed || this.lost) {
          if (this.ready && !this.running) this.draw();
          return;
        }
        this.running = true;
        this.last = performance.now();
        this.raf = requestAnimationFrame((now) => this.frame(now));
      }

      stop() {
        this.running = false;
        cancelAnimationFrame(this.raf);
      }

      radiusPx() {
        return this.opts.radius * clampVal(this.rect.w / 340, 0.7, 1.3);
      }

      frame(now) {
        if (!this.running) return;
        const rawMs = now - this.last;
        const dt = clampVal(rawMs / 16.6667, 0.25, 3);
        this.last = now;
        const o = this.opts;

        if (this.touchRelease && now > this.touchRelease) {
          this.presenceTarget = 0;
          this.touchRelease = 0;
        }
        const ease = 1 - Math.pow(1 - 0.22, dt);
        this.mouse.x += (this.target.x - this.mouse.x) * ease;
        this.mouse.y += (this.target.y - this.mouse.y) * ease;
        const vx = (this.mouse.x - this.prevMouse.x) / dt;
        const vy = (this.mouse.y - this.prevMouse.y) / dt;
        this.prevMouse.x = this.mouse.x;
        this.prevMouse.y = this.mouse.y;
        this.mvel.x += (clampVal(vx, -60, 60) - this.mvel.x) * 0.5;
        this.mvel.y += (clampVal(vy, -60, 60) - this.mvel.y) * 0.5;
        const pk = this.presenceTarget > this.presence ? 0.1 : 0.035;
        this.presence += (this.presenceTarget - this.presence) * (1 - Math.pow(1 - pk, dt));
        if (this.presence < 0.001 && this.presenceTarget === 0) this.presence = 0;
        const fk = this.presenceTarget > this.flowing ? 0.05 : 0.018;
        this.flowing += (this.presenceTarget - this.flowing) * (1 - Math.pow(1 - fk, dt));
        if (this.flowing < 0.002 && this.presenceTarget === 0) this.flowing = 0;
        if (this.introT < 1) this.introT = Math.min(1, this.introT + Math.min(rawMs, 100) / 3000);

        const interacting = this.presence > 0.001 || this.burst > 0;
        this.settle = interacting ? 0 : this.settle + dt;
        const active = interacting || this.settle < SETTLE_FRAMES || this.introT < 1;

        if (!active) {
          if (this.flowDirty) this.clearFlow();
          if (this.stateDirty) this.clearState();
          this.draw();
          this.firstFrame();
          this.stop();
          return;
        }
        this.raf = requestAnimationFrame((n) => this.frame(n));
        this.time += (dt * o.speed * (1 + this.flowing * 1.6)) / 60;
        this.stepFlow(dt);
        this.stepSim(dt);
        this.burst = Math.max(0, this.burst - 0.1 * dt);
        this.draw();
        this.firstFrame();
      }

      firstFrame() {
        if (this.onFirstFrame) {
          const cb = this.onFirstFrame;
          this.onFirstFrame = null;
          requestAnimationFrame(() => cb());
        }
      }

      stepFlow(dt) {
        const gl = this.gl;
        const P = this.pFlow;
        const dst = 1 - this.flowIdx;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.flowFb[dst]);
        gl.viewport(0, 0, this.flowW, this.flowH);
        gl.disable(gl.BLEND);
        gl.useProgram(P.p);
        gl.bindVertexArray(this.vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
        gl.uniform1i(P.u.uPrev, 0);
        gl.uniform2f(P.u.uTexel, 1 / this.flowW, 1 / this.flowH);
        const r = this.rect;
        gl.uniform2f(P.u.uMouse, (this.mouse.x - r.x) / r.w, (this.mouse.y - r.y) / r.h);
        gl.uniform2f(P.u.uVel, clampVal(this.mvel.x / 40, -1, 1), clampVal(this.mvel.y / 40, -1, 1));
        gl.uniform2f(P.u.uSize, r.w, r.h);
        gl.uniform1f(P.u.uRadius, this.radiusPx());
        gl.uniform1f(P.u.uPresence, Math.max(this.presence, this.burst));
        gl.uniform1f(P.u.uDecay, Math.pow(0.968, dt));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        this.flowIdx = dst;
        this.flowDirty = true;
      }

      stepSim(dt) {
        if (!this.n) return;
        const gl = this.gl;
        const P = this.pSim;
        const o = this.opts;
        const r = this.rect;
        const dst = 1 - this.stateIdx;
        const intro = o.reducedMotion || !o.intro ? 0 : Math.pow(1 - this.introT, 2);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.stateFb[dst]);
        gl.viewport(0, 0, TEX_W, this.texH);
        gl.disable(gl.BLEND);
        gl.useProgram(P.p);
        gl.bindVertexArray(this.vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
        gl.uniform1i(P.u.uState, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
        gl.uniform1i(P.u.uHome, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
        gl.uniform1i(P.u.uFlow, 2);
        gl.uniform2f(P.u.uSize, r.w, r.h);
        gl.uniform2f(P.u.uMouse, this.mouse.x - r.x, this.mouse.y - r.y);
        gl.uniform1f(P.u.uRadius, this.radiusPx());
        gl.uniform1f(P.u.uPresence, Math.max(this.presence, this.burst));
        gl.uniform1f(P.u.uStrength, o.strength * (1 + this.burst * 1.5));
        gl.uniform1f(P.u.uSpread, clampVal(o.spread, 0, 2));
        gl.uniform1f(P.u.uTurb, clampVal(o.turbulence, 0, 2));
        gl.uniform1f(P.u.uReturn, clampVal(o.returnSpeed, 0, 2));
        gl.uniform1f(P.u.uTime, this.time);
        gl.uniform1f(P.u.uDt, dt);
        gl.uniform1f(P.u.uIntro, intro);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        this.stateIdx = dst;
        this.stateDirty = true;
      }

      draw() {
        if (!this.ready || this.lost || this.destroyed) return;
        const gl = this.gl;
        const o = this.opts;
        const r = this.rect;
        const rm = o.reducedMotion;
        const introVis = rm || !o.intro ? 1 : Math.pow(this.introT, 2.2);
        const amb = (o.ambient && !rm ? 0.25 : 0) + this.flowing * 0.85;
        const rest = 0;
        const [br, bg, bb] = o.bg;
        const [ir, ig, ib] = this.imgBg;
        const dpr = this.canvas.width / this.cssW;
        const pres = Math.max(this.presence, this.burst);
        const mx = this.mouse.x - r.x;
        const my = this.mouse.y - r.y;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.bindVertexArray(this.vao);
        gl.disable(gl.BLEND);

        const I = this.pImg;
        gl.useProgram(I.p);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.imgTex);
        gl.uniform1i(I.u.uImg, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
        gl.uniform1i(I.u.uFlow, 1);
        gl.uniform2f(I.u.uRes, this.cssW, this.cssH);
        gl.uniform1f(I.u.uDpr, dpr);
        gl.uniform4f(I.u.uRect, r.x, r.y, r.w, r.h);
        gl.uniform3f(I.u.uBg, br, bg, bb);
        gl.uniform3f(I.u.uImgBg, ir, ig, ib);
        gl.uniform2f(I.u.uMouse, mx, my);
        gl.uniform1f(I.u.uPresence, pres);
        gl.uniform1f(I.u.uRadius, this.radiusPx());
        gl.uniform1f(I.u.uStrength, o.strength);
        gl.uniform1f(I.u.uTime, this.time);
        gl.uniform1f(I.u.uAmbient, amb);
        gl.uniform1f(I.u.uIntroVis, introVis);
        gl.uniform1f(I.u.uRest, rest);
        gl.uniform1f(I.u.uAlphaMode, this.alphaMode ? 1 : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (!this.n || (!this.stateDirty && introVis >= 1)) return;

        const P = this.pPart;
        gl.useProgram(P.p);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
        gl.uniform1i(P.u.uState, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
        gl.uniform1i(P.u.uHome, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.colTex);
        gl.uniform1i(P.u.uCol, 2);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
        gl.uniform1i(P.u.uFlow, 3);
        gl.uniform1i(P.u.uTexW, TEX_W);
        gl.uniform4f(P.u.uRect, r.x, r.y, r.w, r.h);
        gl.uniform2f(P.u.uRes, this.cssW, this.cssH);
        gl.uniform2f(P.u.uMouse, mx, my);
        gl.uniform1f(P.u.uRadius, this.radiusPx());
        gl.uniform1f(P.u.uPresence, pres);
        const spacing = r.w / this.gridW;
        gl.uniform1f(P.u.uDot, spacing * 1.45 * clampVal(o.dotSize, 0.2, 3));
        gl.uniform1f(P.u.uTime, this.time);
        gl.uniform1f(P.u.uAmbient, amb);
        gl.uniform1f(P.u.uStreak, (o.streaks ? 1 : 0) * (0.45 + 0.55 * introVis));
        gl.uniform1f(P.u.uIntroVis, introVis);
        gl.uniform1f(P.u.uRest, rest);
        gl.uniform1f(P.u.uDpr, dpr);
        gl.uniform3f(P.u.uTint, 1, 1, 1);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.n);
        gl.disable(gl.BLEND);
      }
    }

    try {
      const engine = new SculptureEngine(canvas);
      engine.onFirstFrame = () => {
        wrapper.setAttribute('data-gl', 'on');
      };

      function updateLayout() {
        const b = stage.getBoundingClientRect();
        const w = Math.round(b.width);
        const h = Math.round(b.height);
        if (w < 10 || h < 10) return;
        const pad = Math.round(w * 0.08);
        const rw = w - pad * 2;
        const rh = h - pad * 2;
        engine.resize(w, h, { x: pad, y: pad, w: rw, h: rh });
      }

      function getPos(e) {
        const b = stage.getBoundingClientRect();
        return { x: e.clientX - b.left, y: e.clientY - b.top };
      }

      stage.addEventListener('pointermove', (e) => {
        const p = getPos(e);
        engine.pointer('move', p.x, p.y, e.pointerType === 'touch');
      });

      stage.addEventListener('pointerdown', (e) => {
        const p = getPos(e);
        wrapper.setAttribute('data-touched', '1');
        engine.pointer('down', p.x, p.y, e.pointerType === 'touch');
      });

      stage.addEventListener('pointerup', (e) => {
        const p = getPos(e);
        engine.pointer('up', p.x, p.y, e.pointerType === 'touch');
      });

      stage.addEventListener('pointerleave', () => {
        engine.pointer('leave', 0, 0, false);
      });

      const ro = new ResizeObserver(updateLayout);
      ro.observe(stage);

      const io = new IntersectionObserver((entries) => {
        const vis = entries[0] ? entries[0].isIntersecting : true;
        engine.setVisible(vis);
      });
      io.observe(stage);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          engine.setImage(img);
          updateLayout();
        } catch {
          onFail();
        }
      };
      img.onerror = onFail;
      img.src = 'favicon.png';
    } catch {
      onFail();
    }
  })();
});
