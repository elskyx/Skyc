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
  // 2c. Random Letter Swap Navigation Micro-Interactions (21st.dev Component)
  // -------------------------------------------------------------------------
  (function initRandomLetterSwapNav() {
    const targets = document.querySelectorAll(
      '.nav-menu-link, .nav-menu-trigger > span, .nav-cta, .drawer-link'
    );

    targets.forEach((el) => {
      if (el.dataset.rlsDone) return;
      el.dataset.rlsDone = '1';

      const originalText = el.textContent.trim();
      if (!originalText) return;

      const wordSpan = document.createElement('span');
      wordSpan.className = 'rls-word';
      wordSpan.setAttribute('aria-label', originalText);

      // Stable randomized array of indices for staggered spring swap
      const indices = Array.from({ length: originalText.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      originalText.split('').forEach((char, idx) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'rls-char';

        if (char === ' ') {
          charSpan.innerHTML = '&nbsp;';
        } else {
          const inner = document.createElement('span');
          inner.className = 'rls-char-inner';
          const delay = (indices.indexOf(idx) * 0.025).toFixed(3);
          inner.style.transitionDelay = `${delay}s`;

          const topChar = document.createElement('span');
          topChar.className = 'rls-char-top';
          topChar.textContent = char;

          const bottomChar = document.createElement('span');
          bottomChar.className = 'rls-char-bottom';
          bottomChar.textContent = char;

          inner.appendChild(topChar);
          inner.appendChild(bottomChar);
          charSpan.appendChild(inner);
        }

        wordSpan.appendChild(charSpan);
      });

      el.innerHTML = '';
      el.appendChild(wordSpan);
    });
  })();

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

      const matchesCategory = currentCategory === 'all' || cardCategory.split(' ').includes(currentCategory);
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

      // Ensure wordmark scales elegantly and never touches or overlaps with the .hwf-rule hairline border
      const ruleEl = root.querySelector('.hwf-rule');
      const ruleBottom = ruleEl ? (ruleEl.getBoundingClientRect().bottom - rect.top) : 210;
      const safeGap = 48; // Generous clearance below the hairline rule
      const maxAvailableHeight = Math.max(100, h - ruleBottom - safeGap);
      const maxFitFromHeight = maxAvailableHeight / ((1 - crop) * 0.78);
      const maxFitFromWidth = measure > 0 ? (w * 0.82 / measure) * 100 : 100;
      const fit = Math.max(60, Math.min(maxFitFromWidth, maxFitFromHeight));

      m.font = fontWeight + ' ' + fit + 'px ' + fontFamily;
      const box = m.measureText(wordmark);
      const cap = box.actualBoundingBoxAscent || fit * 0.75;
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
  // 10. 3D Cylindrical Tilted Grid Hero Engine (21st.dev Component with Skyc Snapshots)
  // -------------------------------------------------------------------------
  (function initTiltedGridHero() {
    const container = document.getElementById('hero-tilted-grid');
    if (!container) return;

    const SKYC_SNAPSHOTS = [
      {
        src: 'assets/snapshots/skyc-home-dark.png',
        alt: 'Skyc URL Composer • Claude Obsidian Dark Mode'
      },
      {
        src: 'assets/snapshots/skyc-home-light.png',
        alt: 'Skyc URL Composer • Warm Parchment Light Mode'
      },
      {
        src: 'assets/snapshots/skyc-batch.png',
        alt: 'Skyc Multi-Stream Batch Downloader Queue'
      },
      {
        src: 'assets/snapshots/skyc-downloads.png',
        alt: 'Skyc Media Player & Downloads Gallery'
      },
      {
        src: 'assets/snapshots/skyc-platforms.png',
        alt: 'Skyc 16+ Supported Social Media Platforms'
      },
      {
        src: 'assets/snapshots/skyc-settings.png',
        alt: 'Skyc Zero-Cloud Storage & OTA Settings'
      }
    ];

    // Preload images
    SKYC_SNAPSHOTS.forEach(item => {
      const img = new Image();
      img.src = item.src;
    });

    const SLICES = 16;
    const CAMERA = 1.6;
    const MAX_WIDTH = 55;
    const tileHeight = 64; // % of hero container height
    const aspectRatio = 16 / 9;
    const gap = 8;
    const axis = 50; // % vertical center
    const curve = 72; // degrees
    const fade = 12;
    const speed = 4.5; // seconds per tile

    const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

    function arc(b) {
      return (CAMERA - 1 + Math.cos(b)) / (2 * CAMERA * Math.sin(b));
    }

    function measure(width, height) {
      const h = Math.min(
        (tileHeight / 100) * height,
        ((MAX_WIDTH / 100) * width) / aspectRatio
      );
      const radius = width * arc(bend);
      if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
      const deg = (rad) => (rad * 180) / Math.PI;
      const unit = deg(h / radius);
      const pitch = (aspectRatio + gap / 100) * unit;
      const limit = deg(bend) + (aspectRatio * unit) / 2;
      const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
      const round = (n) => +n.toFixed(4);
      const sweep = round((columns * pitch) / 2);
      return { columns, sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
    }

    let styleEl = document.getElementById('tgh-style-tag');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'tgh-style-tag';
      document.head.appendChild(styleEl);
    }

    const bandWrapper = document.createElement('div');
    bandWrapper.className = 'tgh-band-wrapper';
    bandWrapper.setAttribute('aria-hidden', 'true');
    container.innerHTML = '';
    container.appendChild(bandWrapper);

    let currentCols = 0;
    let currentSweep = 0;

    function renderCylinder() {
      const rect = container.getBoundingClientRect();
      const width = rect.width || 1080;
      const height = rect.height || 480;
      const layout = measure(width, height);

      if (layout.columns === currentCols && layout.sweep === currentSweep) {
        return;
      }
      currentCols = layout.columns;
      currentSweep = layout.sweep;

      const { columns, sweep, unit, limit } = layout;
      const r = 100 * arc(bend);
      const radius = `${+r.toFixed(3)}cqw`;
      const turn = (deg) => `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;
      const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
      const orbit = 'tgh-orbit-hero';
      const duration = columns * speed;
      const share = aspectRatio / SLICES;

      styleEl.textContent = `
        @keyframes ${orbit} {
          from { transform: ${turn(-sweep)}; }
          to { transform: ${turn(sweep)}; }
          0%, ${hide}%, ${100 - hide}%, 100% { visibility: hidden; }
          ${hide + 0.001}%, ${100 - hide - 0.001}% { visibility: visible; }
        }
      `;

      const mask = `linear-gradient(90deg, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`;
      bandWrapper.style.perspective = `${+(r * CAMERA).toFixed(3)}cqw`;
      bandWrapper.style.perspectiveOrigin = `50% ${axis}%`;
      bandWrapper.style.maskImage = mask;
      bandWrapper.style.webkitMaskImage = mask;
      bandWrapper.style.opacity = '1';

      bandWrapper.innerHTML = '';

      const u = (n) => `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(MAX_WIDTH / aspectRatio).toFixed(4)}cqw))`;

      for (let t = 0; t < columns; t++) {
        const first = columns - 1 - t;
        const initialImg = SKYC_SNAPSHOTS[first % SKYC_SNAPSHOTS.length];

        const tileEl = document.createElement('div');
        tileEl.className = 'tgh-tile-hero';
        tileEl.style.left = `calc(50% - ${u(aspectRatio / 2)})`;
        tileEl.style.top = `calc(${axis}% - ${u(0.5)})`;
        tileEl.style.width = u(aspectRatio);
        tileEl.style.height = u(1);
        tileEl.style.animation = `${orbit} ${duration}s linear ${-t * speed}s infinite`;

        for (let k = 0; k < SLICES; k++) {
          const sliceEl = document.createElement('div');
          sliceEl.className = 'tgh-slice' + (k === 0 ? ' tgh-slice-first' : '') + (k === SLICES - 1 ? ' tgh-slice-last' : '');
          sliceEl.style.left = u((aspectRatio - share) / 2);
          sliceEl.style.width = k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`;
          sliceEl.style.height = u(1);
          sliceEl.style.transform = turn((aspectRatio / 2 - (k + 0.5) * share) * unit);

          const imgEl = document.createElement('img');
          imgEl.src = initialImg.src;
          imgEl.alt = k === 0 ? (initialImg.alt || '') : '';
          imgEl.draggable = false;
          imgEl.style.left = u(-k * share);
          imgEl.style.width = u(aspectRatio);
          imgEl.style.height = u(1);

          sliceEl.appendChild(imgEl);
          tileEl.appendChild(sliceEl);
        }

        tileEl.addEventListener('animationiteration', (e) => {
          const lap = Math.round(e.elapsedTime / duration);
          const next = lap * columns + first;
          const nextImg = SKYC_SNAPSHOTS[next % SKYC_SNAPSHOTS.length];
          const imgElements = tileEl.querySelectorAll('img');
          imgElements.forEach(img => {
            img.src = nextImg.src;
            if (img.alt) img.alt = nextImg.alt;
          });
        });

        bandWrapper.appendChild(tileEl);
      }
    }

    const ro = new ResizeObserver(() => {
      renderCylinder();
    });
    ro.observe(container);

    renderCylinder();
  })();

  // -------------------------------------------------------------------------
  // 11. Hero Headline Position Controller (headlinePosition="left" | "center")
  // -------------------------------------------------------------------------
  window.setSkycHeadlinePosition = function(position) {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    const pos = position === 'center' ? 'center' : 'left';
    heroSection.setAttribute('data-headline-position', pos);
    const container = heroSection.querySelector('.hero-container');
    if (container) {
      if (pos === 'left') {
        container.classList.add('hero-split-layout');
      } else {
        container.classList.remove('hero-split-layout');
      }
    }
    // Trigger resize for dynamic layout reflow
    window.dispatchEvent(new Event('resize'));
  };

  // -------------------------------------------------------------------------
  // 12. Dynamic Release & Repo Update Notification Engine
  // -------------------------------------------------------------------------
  (async function initReleaseNotification() {
    try {
      const res = await fetch("https://api.github.com/repos/elskyx/Skyc-Downloader/releases/latest", {
        headers: { Accept: "application/vnd.github.v3+json" },
      });
      if (!res.ok) return;
      const release = await res.json();
      if (!release || !release.tag_name) return;

      const latestTag = release.tag_name.replace(/^v/, "").trim();
      const currentVersion = "1.6.7";

      // If newer release or assets exist, update download links dynamically
      const assets = Array.isArray(release.assets) ? release.assets : [];
      const apkAsset = assets.find((a) => a.name && a.name.toLowerCase().endsWith(".apk"));
      const exeAsset = assets.find((a) => a.name && (a.name.toLowerCase().endsWith(".exe") || a.name.toLowerCase().endsWith(".msi")));

      if (apkAsset && apkAsset.browser_download_url) {
        document.querySelectorAll('a[href*=".apk"]').forEach((link) => {
          link.href = apkAsset.browser_download_url;
        });
      }

      if (exeAsset && exeAsset.browser_download_url) {
        document.querySelectorAll('a[href*="-setup.exe"]').forEach((link) => {
          link.href = exeAsset.browser_download_url;
        });
      }

      const isGreater = (latest, current) => {
        const l = latest.split(".").map(Number);
        const c = current.split(".").map(Number);
        for (let i = 0; i < Math.max(l.length, c.length); i++) {
          if ((l[i] || 0) > (c[i] || 0)) return true;
          if ((l[i] || 0) < (c[i] || 0)) return false;
        }
        return false;
      };

      if (isGreater(latestTag, currentVersion)) {
        // Update version pills and tags
        document.querySelectorAll(".brand-badge, .portal-version-pill").forEach((el) => {
          el.textContent = `v${latestTag}`;
        });

        // Inject Announcement Banner at top of page
        const banner = document.createElement("div");
        banner.className = "landing-update-banner";
        banner.innerHTML = `
          <div class="landing-update-content">
            <span class="landing-update-pulse"></span>
            <span><strong>🎉 Skyc v${latestTag} is now available!</strong> Fresh engine & improvements live.</span>
            <a href="#downloads" class="landing-update-cta">Download v${latestTag}</a>
            <button class="landing-update-dismiss" aria-label="Dismiss">✕</button>
          </div>
        `;
        document.body.prepend(banner);

        banner.querySelector(".landing-update-dismiss")?.addEventListener("click", () => {
          banner.remove();
        });
      }
    } catch (_) {
      // Quiet fail if offline or API limit reached
    }
  })();

});
