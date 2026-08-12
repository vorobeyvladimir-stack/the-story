/* ═══════════════════════════════════════
   ENTRY POINT
   Owns: one-time page-load bootstrapping. Nothing else should depend on
   this file — it must load last.
   Depends on: buildMap, show (core.js), CHAPTERS (storyData.js)
═══════════════════════════════════════ */

document.addEventListener('touchstart', function() {}, { passive: true });

try {
  if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.expand();
    Telegram.WebApp.disableVerticalSwipes && Telegram.WebApp.disableVerticalSwipes();
  }
} catch (e) {}

buildMap();
show('s-title');
