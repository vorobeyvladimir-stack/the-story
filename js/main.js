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

// Initialize Map and display Title screen
buildMap();
show('s-title');
