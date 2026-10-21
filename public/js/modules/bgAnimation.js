// public/js/modules/bgAnimation.js — Dual-Tier Ambient Embers & Reactive Stardust

let animFrameId = null;
let canvas = null;
let ctx = null;
let particles = [];
let mouse = { x: -2000, y: -2000, vx: 0, vy: 0, lastX: 0, lastY: 0, radius: 110 };

export function initBgAnimation() {
  canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    if (ctx) ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resize);
  resize();

  // Mouse & Touch pointer listeners for subtle 21st.dev organic repulsion
  window.addEventListener("mousemove", (e) => {
    mouse.vx = e.clientX - mouse.lastX;
    mouse.vy = e.clientY - mouse.lastY;
    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = -2000;
    mouse.y = -2000;
  });

  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  const savedMode = localStorage.getItem("skyc_ambient_animation") || "fireflies";
  setBgAnimationMode(savedMode);
}

export function setBgAnimationMode(mode) {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  localStorage.setItem("skyc_ambient_animation", mode);

  if (!canvas || !ctx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  if (mode === "none") return;

  particles = [];
  const isStars = mode === "stars";
  const count = isStars ? 55 : 36;

  for (let i = 0; i < count; i++) {
    const isEmber = !isStars && i % 3 === 0;
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: isEmber ? (Math.random() * 1.8 + 1.4) : (Math.random() * 1.2 + 0.6),
      baseRadius: isEmber ? 2.2 : 0.9,
      vx: (Math.random() - 0.5) * (isEmber ? 0.4 : 0.25),
      vy: isEmber ? -(Math.random() * 0.45 + 0.15) : (Math.random() - 0.5) * 0.2,
      baseVx: (Math.random() - 0.5) * 0.3,
      baseVy: isEmber ? -(Math.random() * 0.35 + 0.15) : (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.5 + 0.2,
      fadeDir: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      maxAlpha: isEmber ? 0.75 : 0.55,
      minAlpha: 0.08,
      type: isEmber ? "ember" : "stardust",
      hueShift: Math.random() * 20 - 10,
    });
  }

  function loop() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Natural floating drift
      p.x += p.vx;
      p.y += p.vy;

      // Smooth restitution toward base velocity
      p.vx += (p.baseVx - p.vx) * 0.02;
      p.vy += (p.baseVy - p.vy) * 0.02;

      // Mouse interactive repulsion (smooth spring force)
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius && dist > 1) {
        const force = (1 - dist / mouse.radius) * 1.8;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
      }

      // Alpha breathing cycle
      p.alpha += p.fadeDir;
      if (p.alpha <= p.minAlpha) {
        p.alpha = p.minAlpha;
        p.fadeDir = Math.abs(p.fadeDir);
      } else if (p.alpha >= p.maxAlpha) {
        p.alpha = p.maxAlpha;
        p.fadeDir = -Math.abs(p.fadeDir);
      }

      // Edge wrapping
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      if (p.type === "ember") {
        // Warm Terracotta with specular halo
        const color = isDark ? "217, 119, 87" : "198, 97, 63";
        ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
        ctx.shadowColor = `rgba(${color}, ${p.alpha * 0.6})`;
        ctx.shadowBlur = 6;
      } else {
        // Delicate stardust with crisp render
        const color = isDark ? "250, 249, 245" : "140, 138, 132";
        ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.75})`;
        ctx.shadowBlur = 0;
      }

      ctx.fill();
    }

    // Reset shadow blur for compositor performance
    ctx.shadowBlur = 0;

    animFrameId = requestAnimationFrame(loop);
  }

  loop();
}
