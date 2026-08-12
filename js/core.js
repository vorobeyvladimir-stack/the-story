/* ═══════════════════════════════════════
   CORE ENGINE
   Owns: shared game state, screen switching, chapter-completion
   orchestration, the toast notifier.
   Exports (globals): state, show, showTitle, showMap, goMap,
   toggleAudio, buildMap, endChapter, completeChapter, showEnding, notify
   Depends on: SoundEngine (audio.js), CHAPTERS (storyData.js),
   startChat (chat.js) — only inside endChapter's dispatch
   Loaded by: quest.js, chat.js, puzzle.js, main.js
═══════════════════════════════════════ */

// Shared across modules: currentCh + completed are read/written by quest.js,
// chat.js and puzzle.js; chatScore/chatTotal are written by chat.js and read
// here in showEnding.
let state = {
  currentCh: null,
  completed: new Set(),
  chatScore: 0,
  chatTotal: 0
};

// ── SCREEN MANAGEMENT ──
function show(id) {
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
}

function showTitle() {
  SoundEngine.playClick();
  show('s-title');
}

function showMap() {
  SoundEngine.playClick();
  buildMap();
  show('s-map');
}

function goMap() {
  SoundEngine.playClick();
  showMap();
}

function toggleAudio() {
  const isMuted = SoundEngine.toggleMute();
  notify(isMuted ? '🔇 Audio Muted' : '🔊 Audio Enabled');
}

/* ── MAP BUILDER ── */
function buildMap() {
  const grid = document.getElementById('ch-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const done = state.completed.size;
  document.getElementById('prog').style.width = `${(done / CHAPTERS.length) * 100}%`;
  document.getElementById('prog-lbl').textContent = `${done} / ${CHAPTERS.length} complete`;

  CHAPTERS.forEach((ch, i) => {
    const unlocked = true;
    const completed = state.completed.has(ch.id);
    const card = document.createElement('div');
    card.className = 'ch-card' + (completed ? ' done' : '');
    card.innerHTML = `<span class="ch-ico">${ch.ico}</span>${ch.title}<span class="ch-loc">${ch.loc}</span>`;
    card.onclick = () => {
      SoundEngine.playClick();
      if (ch.type === 'puzzle') {
        PuzzleGame.start(ch);
      } else {
        startChapter(ch);
      }
    };
    grid.appendChild(card);
  });
}

/* ── CHAPTER LIFECYCLE ── */
// Called by quest.js once dialogue runs out of lines.
function endChapter() {
  const ch = state.currentCh;
  if (ch.chat && ch.chatLines && ch.chatLines.length) {
    startChat(ch);
  } else {
    completeChapter(ch);
  }
}

// Called by chat.js (endChat) and puzzle.js (onValid) once a chapter's
// minigame, if any, is done.
function completeChapter(ch) {
  state.completed.add(ch.id);
  SoundEngine.playFanfare();
  notify('✓ Chapter complete!');

  if (state.completed.size === CHAPTERS.length) {
    setTimeout(showEnding, 1200);
  } else {
    setTimeout(showMap, 1200);
  }
}

/* ── ENDING SCREEN ── */
function showEnding() {
  SoundEngine.playFanfare();
  const pct = state.chatTotal > 0 ? Math.round(state.chatScore / state.chatTotal * 100) : 100;
  document.getElementById('e-msg').innerHTML =
    `Dear Lydia,<br><br>` +
    `You walked into our lives from a screen,<br>` +
    `and made everything more colourful. 🌈<br><br>` +
    `Kyiv → Heidelberg → Stockholm → Frankfurt…<br>` +
    `Every city is better with you in it. 💕<br><br>` +
    `<span style="color:var(--gold)">✦ Sweet Dreams Come True ✦</span>`;
  document.getElementById('e-stats').innerHTML =
    `Chat accuracy: ${pct}%<br>Chapters completed: ${state.completed.size} / ${CHAPTERS.length}<br>Hearts collected: ❤️❤️❤️`;
  show('s-end');
}

/* ── NOTIFICATION TOAST ── */
function notify(msg) {
  const n = document.getElementById('notif');
  if (!n) return;
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 2400);
}
