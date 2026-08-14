/* ═══════════════════════════════════════
   ROMANTIC & SPICY AMBIENT FX (romanceBg.js)
   Powered by GSAP & Framer GrainOverlay Mode 3:
   - 6 GSAP multi-point floating glowing purple/violet/magenta orbs
   - Pure CRT scanlines raster texture & cinematic vignette
   - Floating spicy assets (mask, handcuffs, whip, collar, harness silhouette) + bitten lips 🫦
   - No flowers / rose petals
═══════════════════════════════════════ */

(function() {
  const SPICY_FLOAT_ASSETS = [
    'assets/spicy_mask.png',
    'assets/spicy_cuffs.png',
    'assets/spicy_collar.png',
    'assets/spicy_body.png'
  ];
  const BITTEN_LIPS = '🫦';
  const MAX_FLOAT_PARTICLES = 16;
  let container = null;

  // 1. GSAP Multi-Orb Ambient Lighting Animation (6 distinct spheres across the viewport)
  function initGSAPAurora() {
    if (typeof gsap === 'undefined') return;

    const orbsConfig = [
      { id: 'orb-1', x1: 90, y1: 60, scale: 1.25, opMin: 0.65, opMax: 0.9, dur: 7.5, delay: 0 },
      { id: 'orb-2', x1: -110, y1: -75, scale: 1.3, opMin: 0.6, opMax: 0.88, dur: 9.2, delay: 0.8 },
      { id: 'orb-3', x1: 100, y1: -90, scale: 1.2, opMin: 0.65, opMax: 0.92, dur: 8.4, delay: 1.5 },
      { id: 'orb-4', x1: -80, y1: 85, scale: 1.35, opMin: 0.58, opMax: 0.85, dur: 6.8, delay: 2.2 },
      { id: 'orb-5', x1: 70, y1: -65, scale: 1.25, opMin: 0.62, opMax: 0.9, dur: 10.5, delay: 1.0 },
      { id: 'orb-6', x1: -95, y1: -70, scale: 1.28, opMin: 0.6, opMax: 0.86, dur: 8.8, delay: 2.8 }
    ];

    const isMobile = window.innerWidth <= 600;
    const motionFactor = isMobile ? 0.45 : 1.0;

    orbsConfig.forEach(cfg => {
      const el = document.getElementById(cfg.id);
      if (!el) return;

      // Smooth floating X/Y wandering (scaled for mobile viewport)
      gsap.to(el, {
        x: `+=${cfg.x1 * motionFactor}`,
        y: `+=${cfg.y1 * motionFactor}`,
        scale: isMobile ? 1 + (cfg.scale - 1) * 0.5 : cfg.scale,
        duration: cfg.dur,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: cfg.delay
      });

      // Subtle breathing luminescence
      gsap.to(el, {
        opacity: cfg.opMax,
        duration: cfg.dur * 0.7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: cfg.delay + 0.4
      });
    });
  }

  // 2. Spawner for floating upwards spicy elements & bitten lips
  function createFloatParticle() {
    if (!container) return;
    const currentFloats = container.querySelectorAll('.romance-particle').length;
    if (currentFloats >= MAX_FLOAT_PARTICLES) return;

    const el = document.createElement('div');
    const isLips = Math.random() < 0.28; // ~28% bitten lips, ~72% spicy item assets

    if (isLips) {
      el.className = 'romance-particle romance-lips';
      el.textContent = BITTEN_LIPS;
      const size = 52 + Math.random() * 24;
      el.style.fontSize = `${size}px`;
    } else {
      el.className = 'romance-particle romance-spicy-asset';
      const asset = SPICY_FLOAT_ASSETS[Math.floor(Math.random() * SPICY_FLOAT_ASSETS.length)];
      const img = document.createElement('img');
      img.src = asset;
      img.alt = 'Spicy item';
      el.appendChild(img);

      const width = 56 + Math.random() * 32;
      el.style.width = `${width}px`;
      el.style.height = `${width}px`;
    }

    const left = Math.random() * 92;
    const duration = 7 + Math.random() * 6;
    const delay = Math.random() * 1.5;
    const opacity = 0.5 + Math.random() * 0.45;
    const rot = (Math.random() - 0.5) * 45;

    el.style.left = `${left}vw`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.opacity = opacity;
    el.style.setProperty('--rot', `${rot}deg`);

    container.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, (duration + delay) * 1000);
  }

  function init() {
    initGSAPAurora();

    container = document.getElementById('bg-romance-fx');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bg-romance-fx';
      container.className = 'bg-romance-fx';
      document.body.prepend(container);
    }

    // Initial waves
    for (let i = 0; i < 6; i++) {
      setTimeout(createFloatParticle, i * 350);
    }

    let isPaused = false;

    // Continuous spawn timer
    setInterval(() => {
      if (!isPaused) createFloatParticle();
    }, 1200);

    window.RomanceFx = {
      pause: function() {
        isPaused = true;
        if (container) container.style.opacity = '0';
      },
      resume: function() {
        isPaused = false;
        if (container) container.style.opacity = '1';
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
