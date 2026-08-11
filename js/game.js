/* ═══════════════════════════════════════
   GAME ENGINE & STATE MANAGER
   Integrates Screen State Machine, Dialog Engine,
   Chat Minigame, and 8-Bit Web Audio Hooks.
═══════════════════════════════════════ */

let state = {
  currentCh: null,
  lineIdx: 0,
  typing: false,
  choiceWaiting: false,
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

/* ── CHAPTER START ── */
function startChapter(ch) {
  state.currentCh = ch;
  state.lineIdx = 0;
  state.choiceWaiting = false;
  document.getElementById('hud-ch').textContent = `Ch.${ch.num}: ${ch.title}`;

  // bg & deco
  const bgData = BG[ch.bg];
  document.getElementById('s-bg').style.background = bgData.bg;
  document.getElementById('s-deco').innerHTML = bgData.deco.split('').map(e => `<span class="s-deco-ico">${e}</span>`).join('');
  document.getElementById('loc-badge').textContent = bgData.lbl;

  // build characters & show scene
  buildChars(ch.chars);
  show('s-scene');
  showLine(ch.lines[0]);
}

/* ── CHARACTERS DISPLAY ── */
function buildChars(charList) {
  const wrap = document.getElementById('chars-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const labels = { man: 'Man ♂', gala: 'Gala', lydia: 'Lydia' };
  charList.forEach(c => {
    const w = document.createElement('div');
    w.className = 'char-wrap';
    w.id = 'char-' + c;
    w.innerHTML = `<div class="char-lbl">${labels[c]}</div>${SVG[c]}`;
    wrap.appendChild(w);
  });
}

function setTalking(who) {
  document.querySelectorAll('.char-svg').forEach(s => s.classList.remove('talking', 'happy'));
  const key = who.toLowerCase();
  const el = document.querySelector('#char-' + key + ' .char-svg');
  if (el) el.classList.add('talking');
}

/* ── DIALOG ENGINE ── */
let typeTimer = null;

function showLine(line) {
  if (!line) return endChapter();
  state.choiceWaiting = false;
  document.getElementById('d-choices').style.display = 'none';
  document.getElementById('d-next').style.display = 'block';

  // Speaker color styling
  const colors = {
    MAN: ' style="color:var(--blue)"',
    GALA: ' style="color:var(--purple)"',
    LYDIA: ' style="color:var(--teal)"',
    NARRATOR: ' style="color:var(--gold)"'
  };
  const spk = document.getElementById('d-speaker');
  spk.innerHTML = `<span${colors[line.who] || ''}>${line.who}</span>`;
  setTalking(line.who === 'NARRATOR' ? '' : line.who);

  // Typewriter effect with 8-bit sound tick
  const dt = document.getElementById('d-text');
  dt.textContent = '';
  if (typeTimer) clearInterval(typeTimer);
  let i = 0;
  const txt = line.text;
  state.typing = true;

  typeTimer = setInterval(() => {
    if (i < txt.length) {
      const char = txt[i++];
      dt.textContent += char;
      // Play 8-bit typewriter audio tick for non-space characters
      if (char.trim() !== '') {
        SoundEngine.playTypewriter();
      }
    } else {
      clearInterval(typeTimer);
      state.typing = false;
      if (line.choice) {
        showChoices(line.choices);
      }
    }
  }, 28);
}

function showChoices(choices) {
  state.choiceWaiting = true;
  document.getElementById('d-next').style.display = 'none';
  const box = document.getElementById('d-choices');
  box.innerHTML = '';
  box.style.display = 'flex';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'd-choice';
    btn.textContent = '▸ ' + c.text;
    btn.onclick = (e) => {
      e.stopPropagation();
      SoundEngine.playClick();
      pickChoice(c.next);
    };
    box.appendChild(btn);
  });
}

function pickChoice(val) {
  state.choiceWaiting = false;
  document.getElementById('d-choices').style.display = 'none';
  document.getElementById('d-next').style.display = 'block';
  state.lineIdx++;
  const ch = state.currentCh;
  advanceTo(ch, val);
}

function advanceTo(ch, choice) {
  const line = ch.lines[state.lineIdx];
  if (!line) return endChapter();
  if (line.hidden && line.hidden !== choice) {
    state.lineIdx++;
    advanceTo(ch, choice);
    return;
  }
  showLine(line);
}

function nextLine() {
  if (state.typing) {
    // Skip typewriter animation immediately
    clearInterval(typeTimer);
    state.typing = false;
    const ch = state.currentCh;
    const line = ch.lines[state.lineIdx];
    document.getElementById('d-text').textContent = line.text;
    if (line.choice) showChoices(line.choices);
    return;
  }
  if (state.choiceWaiting) return;
  SoundEngine.playClick();
  state.lineIdx++;
  const ch = state.currentCh;
  if (state.lineIdx >= ch.lines.length) return endChapter();
  showLine(ch.lines[state.lineIdx]);
}

window.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') nextLine();
});

/* ── CHAPTER ENDING & CHAT MINIGAME ── */
function endChapter() {
  const ch = state.currentCh;
  if (ch.chat && ch.chatLines && ch.chatLines.length) {
    startChat(ch);
  } else {
    completeChapter(ch);
  }
}

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

function startChat(ch) {
  const body = document.getElementById('chat-body');
  body.innerHTML = '';
  document.getElementById('chat-foot').style.display = 'none';
  let score = 0, total = 0;
  const msgs = ch.chatLines;

  msgs.forEach((m) => {
    const div = document.createElement('div');
    if (!m.hidden) {
      div.className = `msg msg-${m.who}`;
      div.innerHTML = `<div class="msg-who">${m.who.toUpperCase()}</div><div class="msg-body">${m.text}</div>`;
    } else {
      total++;
      div.className = 'msg msg-hidden';
      div.innerHTML = `<div class="msg-who">??? 🕵️</div><div class="msg-body">${m.text}</div>`;

      const row = document.createElement('div');
      row.className = 'guess-row';
      ['man', 'gala', 'lydia'].forEach(name => {
        const b = document.createElement('button');
        b.className = 'g-btn';
        b.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        b.onclick = () => {
          if (div.dataset.answered) return;
          div.dataset.answered = '1';
          row.querySelectorAll('.g-btn').forEach(x => x.disabled = true);

          if (name === m.answer) {
            b.classList.add('ok');
            score++;
            SoundEngine.playCorrect();
            div.querySelector('.msg-who').textContent = name.toUpperCase() + ' ✓';
            div.className = `msg msg-${name}`;
          } else {
            b.classList.add('no');
            SoundEngine.playWrong();
            row.querySelectorAll('.g-btn').forEach(x => {
              if (x.textContent.toLowerCase() === m.answer) x.classList.add('ok');
            });
            div.querySelector('.msg-who').textContent = m.answer.toUpperCase() + ' ✗';
          }

          document.getElementById('c-score').textContent = score;
          const answered = body.querySelectorAll('[data-answered]').length;
          if (answered >= total) {
            const foot = document.getElementById('chat-foot');
            foot.style.display = 'flex';
            const res = document.getElementById('chat-res');
            const pct = Math.round(score / total * 100);
            if (pct >= 80) {
              res.className = 'chat-res good';
              res.textContent = `🌟 ${pct}% — Amazing! You know them well!`;
            } else if (pct >= 50) {
              res.className = 'chat-res';
              res.textContent = `😊 ${pct}% — Not bad! Keep chatting!`;
            } else {
              res.className = 'chat-res bad';
              res.textContent = `😅 ${pct}% — Pay more attention to the chat! 😄`;
            }
            state.chatScore += score;
            state.chatTotal += total;
          }
        };
        row.appendChild(b);
      });
      div.appendChild(row);
    }
    body.appendChild(div);
  });
  document.getElementById('c-score').textContent = '0';
  document.getElementById('c-tot').textContent = total;
  show('s-chat');
}

function endChat() {
  SoundEngine.playClick();
  completeChapter(state.currentCh);
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

/* ── INITIALIZATION ── */
document.addEventListener('touchstart', function() {}, { passive: true });

try {
  if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.expand();
    Telegram.WebApp.disableVerticalSwipes && Telegram.WebApp.disableVerticalSwipes();
  }
} catch (e) {}

const chatBody = document.getElementById('chat-body');
if (chatBody) chatBody.style['-webkit-overflow-scrolling'] = 'touch';

buildMap();
show('s-title');
