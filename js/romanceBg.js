/* ═══════════════════════════════════════
   ROMANTIC & SPICY AMBIENT FX (romanceBg.js)
   Powered by GSAP & Framer GrainOverlay Mode 3:
   - 6 GSAP multi-point floating glowing purple/violet/magenta orbs
   - Pure CRT scanlines raster texture & cinematic vignette
   - Fair Shuffle Deck queue (100% equal distribution of all 11 spicy assets)
   - Smooth drifting motion at relaxed 10% slower speed
═══════════════════════════════════════ */

(function() {
  const PARTICLE_POOL = [
    { type: 'img', src: 'assets/spicy_mask.png' },
    { type: 'img', src: 'assets/spicy_cuffs.png' },
    { type: 'img', src: 'assets/spicy_collar.png' },
    { type: 'img', src: 'assets/spicy_body.png' },
    { type: 'img', src: 'assets/spicy_purple_collar.png' },
    { type: 'img', src: 'assets/spicy_toy.png' },
    { type: 'img', src: 'assets/spicy_panties_lace.png' },
    { type: 'img', src: 'assets/spicy_thong.png' },
    { type: 'img', src: 'assets/spicy_nightie.png' },
    { type: 'img', src: 'assets/spicy_corset_girl.png' },
    { type: 'text', text: '🫦' }
  ];

  const MAX_FLOAT_PARTICLES = 16;
  let container = null;
  let deck = [];

  // Fair Shuffle Bag (Fisher-Yates) guaranteeing 100% equal frequency and zero clustered duplicates
  function getNextParticle() {
    if (deck.length === 0) {
      deck = [...PARTICLE_POOL];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
      }
    }
    return deck.pop();
  }

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

  // 2. Spawner for floating upwards spicy elements & bitten lips (10% slower, perfectly balanced)
  function createFloatParticle() {
    if (!container) return;
    const currentFloats = container.querySelectorAll('.romance-particle').length;
    if (currentFloats >= MAX_FLOAT_PARTICLES) return;

    const item = getNextParticle();
    if (!item) return;

    const el = document.createElement('div');

    if (item.type === 'text') {
      el.className = 'romance-particle romance-lips';
      el.textContent = item.text;
      const size = 52 + Math.random() * 24;
      el.style.fontSize = `${size}px`;
    } else {
      el.className = 'romance-particle romance-spicy-asset';
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = 'Spicy item';
      el.appendChild(img);

      const width = 56 + Math.random() * 32;
      el.style.width = `${width}px`;
      el.style.height = `${width}px`;
    }

    const left = Math.random() * 92;
    // 10% slower: duration scaled from [7..13s] to [7.7..14.3s]
    const duration = (7 + Math.random() * 6) * 1.10;
    const opacity = 0.5 + Math.random() * 0.45;
    const rot = (Math.random() - 0.5) * 45;

    el.style.left = `${left}vw`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `0s`;
    el.style.setProperty('--target-opacity', opacity);
    el.style.setProperty('--rot', `${rot}deg`);

    container.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, duration * 1000);
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
      setTimeout(createFloatParticle, i * 380);
    }

    let isPaused = false;

    // Continuous spawn timer (spaced to match the 10% slower speed)
    setInterval(() => {
      if (!isPaused) createFloatParticle();
    }, 1350);

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
