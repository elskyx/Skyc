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
});
