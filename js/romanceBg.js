/* ═══════════════════════════════════════
   ROMANTIC & SAPPHIC AMBIENT FX (romanceBg.js)
   Sensual night-out ambience: cocktails, cherries, lipstick kisses,
   biting lips, neon passion lightning bolts, and gracefully falling rose petals.
═══════════════════════════════════════ */

(function() {
  const FLOAT_ICONS = ['🍸', '🍒', '💋', '🫦', '💄', '🍹', '🍾', '✨', '🔥', '⚡'];
  const PETAL_ICONS = ['🌹', '🌸', '🥀'];
  const MAX_FLOAT_PARTICLES = 16;
  const MAX_PETAL_PARTICLES = 10;
  let container = null;

  // 1. Spawner for floating upwards romantic & passion elements
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

  // 2. Spawner for gracefully falling & swirling rose petals
  function createRosePetal() {
    if (!container) return;
    const currentPetals = container.querySelectorAll('.rose-petal').length;
    if (currentPetals >= MAX_PETAL_PARTICLES) return;

    const el = document.createElement('div');
    el.className = 'rose-petal';
    el.textContent = PETAL_ICONS[Math.floor(Math.random() * PETAL_ICONS.length)];

    const left = Math.random() * 96;
    const size = 18 + Math.random() * 14;
    const duration = 9 + Math.random() * 8; // 9s to 17s gentle fall
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
