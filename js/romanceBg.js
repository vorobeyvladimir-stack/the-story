/* ═══════════════════════════════════════
   ROMANTIC & SAPPHIC AMBIENT FX (romanceBg.js)
   Powered by GSAP & Framer-style CRT Scanlines:
   - GSAP ambient floating neon aurora orbs (deep violet & purple backlight)
   - CRT scanline raster texture & cinematic vignette
   - Floating romantic items (cocktails, cherries, kisses, lips, lightning)
   - Gracefully falling & swirling rose petals
═══════════════════════════════════════ */

(function() {
  const FLOAT_ICONS = ['🍸', '🍒', '💋', '🫦', '💄', '🍹', '🍾', '✨', '🔥', '⚡'];
  const PETAL_ICONS = ['🌹', '🌸', '🥀'];
  const MAX_FLOAT_PARTICLES = 16;
  const MAX_PETAL_PARTICLES = 10;
  let container = null;

  // 1. GSAP Ambient Aurora Orbs Animation
  function initGSAPAurora() {
    if (typeof gsap === 'undefined') return;

    const orb1 = document.getElementById('orb-1');
    const orb2 = document.getElementById('orb-2');
    const orb3 = document.getElementById('orb-3');

    if (orb1) {
      gsap.to(orb1, {
        x: '+=110',
        y: '+=70',
        scale: 1.2,
        opacity: 0.85,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    if (orb2) {
      gsap.to(orb2, {
        x: '-=130',
        y: '-=90',
        scale: 1.15,
        opacity: 0.75,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1
      });
    }

    if (orb3) {
      gsap.to(orb3, {
        x: '+=80',
        y: '-=60',
        scale: 1.3,
        opacity: 0.9,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5
      });
    }
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
