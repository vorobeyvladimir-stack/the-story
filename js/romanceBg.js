/* ═══════════════════════════════════════
   ROMANTIC & SAPPHIC AMBIENT FX (romanceBg.js)
   Powered by GSAP & Framer GrainOverlay Mode 3 (Scanlines):
   - 6 GSAP multi-point floating glowing purple/violet/magenta orbs
   - Pure CRT scanlines raster texture & cinematic vignette (no falling bar)
   - Floating romantic items (cocktails, cherries, kisses, lips, lightning)
   - Gracefully falling & swirling rose petals
═══════════════════════════════════════ */

(function() {
  const FLOAT_ICONS = ['🍸', '🍒', '💋', '🫦', '💄', '🍹', '🍾', '✨', '🔥', '⚡'];
  const PETAL_ICONS = ['🌹', '🌸', '🥀'];
  const MAX_FLOAT_PARTICLES = 16;
  const MAX_PETAL_PARTICLES = 10;
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

    orbsConfig.forEach(cfg => {
      const el = document.getElementById(cfg.id);
      if (!el) return;

      // Smooth floating X/Y wandering
      gsap.to(el, {
        x: `+=${cfg.x1}`,
        y: `+=${cfg.y1}`,
        scale: cfg.scale,
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

  // 2. Spawner for floating upwards romantic & passion elements
  function createFloatParticle() {
    if (!container) return;
    const currentFloats = container.querySelectorAll('.romance-particle').length;
    if (currentFloats >= MAX_FLOAT_PARTICLES) return;

    const el = document.createElement('div');
    const icon = FLOAT_ICONS[Math.floor(Math.random() * FLOAT_ICONS.length)];
    el.className = 'romance-particle' + (icon === '⚡' ? ' neon-lightning' : '');
    el.textContent = icon;

    const left = Math.random() * 94;
    const size = (icon === '💋' || icon === '🫦') ? 22 + Math.random() * 10 : (icon === '⚡' ? 20 + Math.random() * 10 : 16 + Math.random() * 12);
    const duration = 7 + Math.random() * 7;
    const delay = Math.random() * 1.5;
    const opacity = (icon === '⚡') ? 0.65 + Math.random() * 0.35 : 0.35 + Math.random() * 0.45;
    const rot = (Math.random() - 0.5) * 50;

    el.style.left = `${left}vw`;
    el.style.fontSize = `${size}px`;
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

  // 3. Spawner for gracefully falling & swirling rose petals
  function createRosePetal() {
    if (!container) return;
    const currentPetals = container.querySelectorAll('.rose-petal').length;
    if (currentPetals >= MAX_PETAL_PARTICLES) return;

    const el = document.createElement('div');
    el.className = 'rose-petal';
    el.textContent = PETAL_ICONS[Math.floor(Math.random() * PETAL_ICONS.length)];

    const left = Math.random() * 96;
    const size = 18 + Math.random() * 14;
    const duration = 9 + Math.random() * 8;
    const delay = Math.random() * 2;
    const opacity = 0.4 + Math.random() * 0.45;
    const sway = (Math.random() < 0.5 ? 1 : -1) * (20 + Math.random() * 35);

    el.style.left = `${left}vw`;
    el.style.fontSize = `${size}px`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.opacity = opacity;
    el.style.setProperty('--sway', `${sway}px`);

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
    for (let j = 0; j < 4; j++) {
      setTimeout(createRosePetal, j * 500);
    }

    // Continuous spawn timers
    setInterval(createFloatParticle, 1200);
    setInterval(createRosePetal, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
