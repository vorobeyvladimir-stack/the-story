/* ═══════════════════════════════════════
   CORE ENGINE
   Owns: shared game state, screen transitions, chapter lifecycle orchestration,
   toast notifications, and high-level Game namespace.
   Exports (globals): Game, state, show, showTitle, showMap, goMap, replayGame,
   toggleAudio, buildMap, endChapter, completeChapter, showEnding, notify
   Depends on: SoundEngine (audio.js), CHAPTERS (storyData.js)
═══════════════════════════════════════ */

/**
 * @typedef {Object} GameState
 * @property {import('./storyData.js').Chapter | null} currentCh - Active chapter
 * @property {Set<string>} completed - Set of completed chapter IDs
 * @property {number} chatScore - Total correct quiz guesses
 * @property {number} chatTotal - Total quiz questions presented
 */

/** @type {GameState} */
const state = {
  currentCh: null,
  completed: new Set(),
  chatScore: 0,
  chatTotal: 0
};

const CoreEngine = {
  /**
   * Resets gameplay progress and stats
   */
  resetState: function() {
    state.currentCh = null;
    state.completed = new Set();
    state.chatScore = 0;
    state.chatTotal = 0;
  },

  /**
   * Switches active UI screen and manages HUD visibility
   * @param {string} id - Target DOM element ID
   */
  show: function(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');

    const hud = document.getElementById('hud');
    if (hud) {
      if (id === 's-title') {
        hud.classList.remove('on');
      } else {
        hud.classList.add('on');
      }
    }
    SoundEngine.updateHudIcon();

    // GPU & CPU Optimization: Auto-pause title video on gameplay screens
    const vid = document.querySelector('.hero-intro-video');
    if (vid) {
      if (id === 's-title') {
        if (vid.paused) vid.play().catch(() => {});
      } else {
        if (!vid.paused) vid.pause();
      }
    }

    // Battery & CPU Optimization: Freeze particle spawning & GPU blur during puzzle gameplay
    document.body.classList.toggle('puzzle-mode', id === 's-puzzle');
    if (window.RomanceFx) {
      if (id === 's-puzzle') {
        window.RomanceFx.pause();
      } else {
        window.RomanceFx.resume();
      }
    }

    if (id !== 's-scene' && window.ComicEngine) {
      window.ComicEngine.reset();
    }
  },

  showTitle: function() {
    SoundEngine.playClick();
    this.show('s-title');
  },

  showMap: function() {
    SoundEngine.playClick();
    SoundEngine.startBGM();
    this.buildMap();
    this.show('s-map');
  },

  goMap: function() {
    SoundEngine.playClick();
    this.showMap();
  },

  replayGame: function() {
    SoundEngine.playClick();
    this.resetState();
    this.showMap();
  },

  toggleAudio: function() {
    const isMuted = SoundEngine.toggleMute();
    this.notify(isMuted ? '🔇 Audio Muted' : '🔊 Audio Enabled');
  },

  /**
   * Builds the chapter select map grid
   */
  buildMap: function() {
    const grid = document.getElementById('ch-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const done = state.completed.size;
    const totalChapters = CHAPTERS.length;

    const progBar = document.getElementById('prog');
    if (progBar) {
      progBar.style.width = `${(done / totalChapters) * 100}%`;
    }

    const progLbl = document.getElementById('prog-lbl');
    if (progLbl) {
      progLbl.textContent = `${done} / ${totalChapters} complete`;
    }

    const hudCh = document.getElementById('hud-ch');
    if (hudCh) hudCh.textContent = 'Map';

    CHAPTERS.forEach(ch => {
      const completed = state.completed.has(ch.id);
      const card = document.createElement('div');
      card.className = 'ch-card' + (completed ? ' done' : '');
      card.innerHTML = `<span class="ch-ico">${ch.ico}</span>${ch.title}<span class="ch-loc">${ch.loc}</span>`;
      card.onclick = () => {
        SoundEngine.playClick();
        if (ch.type === 'puzzle') {
          if (window.Game && window.Game.puzzle) {
            window.Game.puzzle.start(ch);
          } else if (typeof PuzzleGame !== 'undefined') {
            PuzzleGame.start(ch);
          }
        } else {
          startChapter(ch);
        }
      };
      grid.appendChild(card);
    });
  },

  /**
   * Called when dialogue finishes
   */
  endChapter: function() {
    const ch = state.currentCh;
    if (ch && ch.chat && Array.isArray(ch.chatLines) && ch.chatLines.length > 0) {
      startChat(ch);
    } else if (ch) {
      this.completeChapter(ch);
    }
  },

  /**
   * Marks a chapter as completed and triggers progress transitions
   * @param {import('./storyData.js').Chapter} ch
   */
  completeChapter: function(ch) {
    state.completed.add(ch.id);
    SoundEngine.playFanfare();
    this.notify('✓ Chapter complete!');

    if (state.completed.size === CHAPTERS.length) {
      setTimeout(() => this.showEnding(), 1200);
    } else {
      setTimeout(() => this.showMap(), 1200);
    }
  },

  /**
   * Renders the victory epilogue screen
   */
  showEnding: function() {
    SoundEngine.playFanfare();
    const pct = state.chatTotal > 0 ? Math.round((state.chatScore / state.chatTotal) * 100) : 100;

    const eMsg = document.getElementById('e-msg');
    if (eMsg) {
      eMsg.innerHTML =
        `Dear Lydia,<br><br>` +
        `You walked into our lives from a screen,<br>` +
        `and made everything more colourful. 🌈<br><br>` +
        `Kyiv → Heidelberg → Stockholm → Frankfurt…<br>` +
        `Every city is better with you in it. 💕<br><br>` +
        `<span style="color:var(--gold)">✦ Sweet Dreams Come True ✦</span>`;
    }

    const eStats = document.getElementById('e-stats');
    if (eStats) {
      eStats.innerHTML =
        `Chat accuracy: ${pct}%<br>Chapters completed: ${state.completed.size} / ${CHAPTERS.length}<br>Hearts collected: ❤️❤️❤️`;
    }

    this.show('s-end');
  },

  /**
   * Displays temporary toast notification
   * @param {string} msg
   */
  notify: function(msg) {
    const n = document.getElementById('notif');
    if (!n) return;
    n.textContent = msg;
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 2400);
  }
};

/* ═══════════════════════════════════════
   HAPTIC FEEDBACK ENGINE (iOS 17+ / Telegram WebApp Taptic Engine)

   Telegram routes every haptic through ONE native event:
     web_app_trigger_haptic_feedback
       { type: 'impact',           impact_style: light|medium|heavy|rigid|soft }
       { type: 'notification',     notification_type: success|warning|error }
       { type: 'selection_change' }

   Telegram.WebApp.HapticFeedback wraps that event, but its wrapper refuses to
   fire when tgWebAppVersion < 6.1 — it only console.warns and returns. An app
   that wasn't launched through a real web_app button reports the default '6.0',
   and on iOS there is no second chance: WebKit has no Vibration API, so
   navigator.vibrate does not exist. Result: complete silence.

   Posting that native event ourselves skips the version gate entirely, so it is
   the primary path here and the SDK is only a fallback for a client exposing no
   transport we recognise. Exactly one of the two ever runs, so a healthy phone
   never buzzes twice for a single action (see _fire).
═══════════════════════════════════════ */
const TG_HAPTIC_EVENT = 'web_app_trigger_haptic_feedback';

/**
 * Browsers reject navigator.vibrate before the first user gesture and log an
 * error for every attempt, so the Web Vibration fallback waits for this.
 */
let userHasInteracted = false;
['pointerdown', 'touchstart', 'keydown'].forEach(evt => {
  window.addEventListener(evt, () => { userHasInteracted = true; }, { once: true, passive: true });
});

/**
 * Posts a raw event to the Telegram client, mirroring the transports that
 * telegram-web-app.js itself uses (native proxy, Windows notify, web iframe).
 * @returns {boolean} true if a transport accepted the event
 */
function postTgEvent(eventType, eventData) {
  const data = eventData === undefined ? '' : eventData;
  try {
    if (window.Telegram && window.Telegram.WebView && typeof window.Telegram.WebView.postEvent === 'function') {
      window.Telegram.WebView.postEvent(eventType, false, data);
      return true;
    }
    if (window.TelegramWebviewProxy !== undefined &&
        typeof window.TelegramWebviewProxy.postEvent === 'function') {
      window.TelegramWebviewProxy.postEvent(eventType, JSON.stringify(data));
      return true;
    }
    if (window.external && 'notify' in window.external) {
      window.external.notify(JSON.stringify({ eventType: eventType, eventData: data }));
      return true;
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(JSON.stringify({ eventType: eventType, eventData: data }), '*');
      return true;
    }
  } catch(e) {}
  return false;
}

const HapticEngine = {
  _lastDragX: null,
  _lastDragY: null,
  _dragDistanceAccumulator: 0,
  _lastFireAt: 0,

  /** Distance between delicate friction ticks while dragging a piece */
  _DRAG_STEP_PX: 38,
  /**
   * Floor between any two haptics. The Taptic Engine cannot retrigger instantly;
   * calls stacked closer than this are dropped by iOS anyway, and flooding it
   * makes the whole stream feel mushy instead of crisp.
   */
  _MIN_INTERVAL_MS: 45,

  /**
   * Whether a native Telegram transport is reachable at all.
   */
  _hasNativeTransport: function() {
    return window.TelegramWebviewProxy !== undefined ||
           !!(window.external && 'notify' in window.external) ||
           !!(window.parent && window.parent !== window);
  },

  /**
   * Reports whether the SDK wrapper would pass its own version gate. Used for
   * diagnostics only — delivery never depends on it, see _fire.
   */
  _sdkCanFire: function() {
    const wa = window.Telegram && window.Telegram.WebApp;
    if (!wa || !wa.HapticFeedback) return false;
    return typeof wa.isVersionAtLeast === 'function' ? wa.isVersionAtLeast('6.1') : false;
  },

  /**
   * Sends exactly one haptic.
   *
   * The raw native event is the primary path on purpose. It is byte-for-byte
   * what HapticFeedback emits internally, minus the wrapper's version gate —
   * and that gate is what silences haptics whenever tgWebAppVersion is the
   * default '6.0'. Going through the SDK also means trusting isVersionAtLeast()
   * to agree with the wrapper's internal check; when they disagree the haptic
   * vanishes with no error. The raw event has neither failure mode.
   *
   * The SDK is kept strictly as a fallback for a client that exposes no
   * transport we recognise. Only one of the two ever runs, so a healthy phone
   * never buzzes twice for one action.
   *
   * @param {Object} nativeData - payload for web_app_trigger_haptic_feedback
   * @param {function(Object):void} sdkCall - invoked with HapticFeedback
   * @param {boolean} [throttle] - apply the retrigger floor (drag ticks only)
   */
  _fire: function(nativeData, sdkCall, throttle) {
    const now = Date.now();
    if (throttle && now - this._lastFireAt < this._MIN_INTERVAL_MS) return;
    this._lastFireAt = now;

    let delivered = false;
    try {
      delivered = postTgEvent(TG_HAPTIC_EVENT, nativeData);
    } catch(e) {}

    if (!delivered) {
      try {
        const hf = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback;
        if (hf) sdkCall(hf);
      } catch(e) {}
    }

    // Web Vibration API — plain Android browsers only. Skipped when Telegram
    // already took the event (otherwise Android Telegram buzzes twice), skipped
    // for selection ticks (too coarse to imitate a Taptic tick), and skipped
    // before the first gesture (browsers reject it and log an error each time).
    // iOS is never served by this: WebKit has no Vibration API at all.
    if (!delivered && userHasInteracted && nativeData.type !== 'selection_change') {
      try {
        if (navigator.vibrate) {
          navigator.vibrate(nativeData.impact_style === 'heavy' ? 24 :
                            nativeData.impact_style === 'medium' ? 14 : 8);
        }
      } catch(e) {}
    }
  },

  /**
   * Collision feel between UI objects of differing weight
   * @param {'light'|'medium'|'heavy'|'rigid'|'soft'} style
   */
  impact: function(style = 'light') {
    this._fire(
      { type: 'impact', impact_style: style },
      hf => hf.impactOccurred(style)
    );
  },

  /**
   * Outcome feel for a completed task
   * @param {'success'|'warning'|'error'} type
   */
  notification: function(type = 'success') {
    this._fire(
      { type: 'notification', notification_type: type },
      hf => hf.notificationOccurred(type)
    );
  },

  /**
   * Ultra-short tick — the subtlest haptic iOS offers. Used for drag friction.
   */
  selection: function() {
    this._fire(
      { type: 'selection_change' },
      hf => hf.selectionChanged(),
      true
    );
  },

  /**
   * Starts drag distance tracking and marks the grab
   * @param {number} x
   * @param {number} y
   */
  startDrag: function(x, y) {
    this._lastDragX = x;
    this._lastDragY = y;
    this._dragDistanceAccumulator = 0;
    this.impact('light');
  },

  /**
   * Accumulates travelled distance and emits a friction tick per step
   * @param {number} x
   * @param {number} y
   */
  onDragMove: function(x, y) {
    if (this._lastDragX === null || this._lastDragY === null) {
      this._lastDragX = x;
      this._lastDragY = y;
      return;
    }
    const dx = x - this._lastDragX;
    const dy = y - this._lastDragY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this._lastDragX = x;
    this._lastDragY = y;

    this._dragDistanceAccumulator += dist;
    if (this._dragDistanceAccumulator >= this._DRAG_STEP_PX) {
      this.selection();
      this._dragDistanceAccumulator = 0;
    }
  },

  /**
   * Mechanical latch snap feel when two puzzle pieces connect
   */
  snap: function() {
    this.impact('rigid');
    setTimeout(() => this.impact('medium'), 60);
  },

  /**
   * Extended powerful victory celebration pattern on puzzle completion
   */
  victory: function() {
    this.impact('rigid');
    setTimeout(() => this.impact('heavy'), 120);
    setTimeout(() => this.notification('success'), 280);
    setTimeout(() => this.impact('heavy'), 500);
    setTimeout(() => this.notification('success'), 720);
    setTimeout(() => this.impact('rigid'), 980);
  },

  /**
   * Resets drag distance tracking
   */
  endDrag: function() {
    this._lastDragX = null;
    this._lastDragY = null;
    this._dragDistanceAccumulator = 0;
  }
};

// Global Bridge Functions
function show(id) { CoreEngine.show(id); }
function showTitle() { CoreEngine.showTitle(); }
function showMap() { CoreEngine.showMap(); }
function goMap() { CoreEngine.goMap(); }
function replayGame() { CoreEngine.replayGame(); }
function toggleAudio() { CoreEngine.toggleAudio(); }
function buildMap() { CoreEngine.buildMap(); }
function endChapter() { CoreEngine.endChapter(); }
function completeChapter(ch) { CoreEngine.completeChapter(ch); }
function showEnding() { CoreEngine.showEnding(); }
function notify(msg) { CoreEngine.notify(msg); }

/**
 * Unified Game Namespace
 */
window.HapticEngine = HapticEngine;
window.Game = window.Game || {};
window.Game.state = state;
window.Game.core = CoreEngine;
window.Game.audio = SoundEngine;
window.Game.haptic = HapticEngine;
if (typeof PuzzleGame !== 'undefined') {
  window.Game.puzzle = PuzzleGame;
}
