// public/js/modules/bgAnimation.js

let animFrameId = null;
let canvas = null;
let ctx = null;
let particles = [];

export function initBgAnimation() {
  canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const savedMode = localStorage.getItem("skyc_ambient_animation") || "fireflies";
  setBgAnimationMode(savedMode);
}

export function setBgAnimationMode(mode) {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  localStorage.setItem("skyc_ambient_animation", mode);

  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mode === "none") return;

  particles = [];
  const count = mode === "stars" ? 45 : 28;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      alpha: Math.random() * 0.5 + 0.2,
      fadeDir: Math.random() > 0.5 ? 0.005 : -0.005,
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const particleColor = isDark ? "217, 119, 87" : "184, 107, 20";

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.fadeDir;

      if (p.alpha <= 0.1) p.fadeDir = 0.005;
      if (p.alpha >= 0.7) p.fadeDir = -0.005;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
      ctx.fill();
    });

    animFrameId = requestAnimationFrame(loop);
  }

  loop();
}
