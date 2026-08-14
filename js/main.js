/* ═══════════════════════════════════════
   ENTRY POINT & TELEGRAM / iOS INTEGRATION
   Owns: one-time page-load bootstrapping, Telegram WebApp lifecycle,
   and iOS Safari touch/audio initialization.
   Depends on: buildMap, show (core.js), CHAPTERS (storyData.js)
═══════════════════════════════════════ */

// iOS Safari / WebKit touch responsiveness
document.addEventListener('touchstart', function() {}, { passive: true });

// Telegram WebApp Setup & Viewport Configuration
try {
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    // Match Telegram client chrome to our velvet midnight palette
    if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#0b0616');
    if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#0b0616');
    if (typeof tg.setBottomBarColor === 'function') tg.setBottomBarColor('#0b0616');

    // Prevent accidental swipe-down closing on iOS Telegram WebApp
    if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
  }
} catch (e) {
  console.warn('Telegram WebApp integration notice:', e);
}

// Page Visibility API: Deep sleep when tab/app is hidden, instant resume on return
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (window.SoundEngine) SoundEngine.pauseBGM();
    const vid = document.querySelector('.hero-intro-video');
    if (vid && !vid.paused) vid.pause();
    if (window.RomanceFx) RomanceFx.pause();
    if (typeof gsap !== 'undefined') gsap.globalTimeline.pause();
  } else {
    if (typeof gsap !== 'undefined') gsap.globalTimeline.resume();
    const activeScreen = document.querySelector('.screen.active');
    const isPuzzle = activeScreen && activeScreen.id === 's-puzzle';
    if (window.RomanceFx && !isPuzzle) RomanceFx.resume();
    const isTitle = activeScreen && activeScreen.id === 's-title';
    const vid = document.querySelector('.hero-intro-video');
    if (vid && isTitle && vid.paused) vid.play().catch(() => {});
    if (window.SoundEngine && !SoundEngine.isMuted() && !isTitle) {
      SoundEngine.resumeBGM();
    }
  }
});

// Preload all puzzle images immediately on app launch for instant opening
if (window.CHAPTERS) {
  window.CHAPTERS.forEach(ch => {
    if (ch.type === 'puzzle' && ch.image) {
      const pImg = new Image();
      pImg.src = ch.image;
      if (pImg.decode) pImg.decode().catch(() => {});
    }
  });
}

// Initialize Map and display Title screen
buildMap();
show('s-title');
