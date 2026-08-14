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
  },

  showTitle: function() {
    SoundEngine.playClick();
    this.show('s-title');
    const vid = document.querySelector('.hero-intro-video');
    if (vid && vid.paused) {
      vid.play().catch(() => {});
    }
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
window.Game = window.Game || {};
window.Game.state = state;
window.Game.core = CoreEngine;
window.Game.audio = SoundEngine;
if (typeof PuzzleGame !== 'undefined') {
  window.Game.puzzle = PuzzleGame;
}
