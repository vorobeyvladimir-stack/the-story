/* ═══════════════════════════════════════
   QUEST / DIALOGUE ENGINE
   Owns: the visual-novel scene screen — starting a chapter, the character
   portraits, the typewriter dialogue box and its branching choices.
   Exports (globals): startChapter
   (buildChars/setTalking/showLine/showChoices/pickChoice/advanceTo/nextLine
   are internal to this module but remain global functions, as this project
   has no module bundler)
   Depends on: state, show, endChapter (core.js), SoundEngine (audio.js),
   BG, CHARACTERS-list rendering via SVG (characters.js)
   Loaded by: nothing — this is a leaf module
═══════════════════════════════════════ */

// Dialogue-only state: which line we're on, whether the typewriter is still
// animating, and whether we're waiting on the player to pick a choice.
let questState = {
  lineIdx: 0,
  typing: false,
  choiceWaiting: false
};

/* ── CHAPTER START ── */
function startChapter(ch) {
  state.currentCh = ch;
  questState.lineIdx = 0;
  questState.choiceWaiting = false;
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
  document.querySelectorAll('.char-svg').forEach(s => s.classList.remove('talking'));
  const key = who.toLowerCase();
  const el = document.querySelector('#char-' + key + ' .char-svg');
  if (el) el.classList.add('talking');
}

/* ── DIALOG ENGINE ── */
let typeTimer = null;

function showLine(line) {
  if (!line) return endChapter();
  questState.choiceWaiting = false;
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
  questState.typing = true;

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
      questState.typing = false;
      if (line.choice) {
        showChoices(line.choices);
      }
    }
  }, 28);
}

function showChoices(choices) {
  questState.choiceWaiting = true;
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
  questState.choiceWaiting = false;
  document.getElementById('d-choices').style.display = 'none';
  document.getElementById('d-next').style.display = 'block';
  questState.lineIdx++;
  const ch = state.currentCh;
  advanceTo(ch, val);
}

function advanceTo(ch, choice) {
  const line = ch.lines[questState.lineIdx];
  if (!line) return endChapter();
  if (line.hidden && line.hidden !== choice) {
    questState.lineIdx++;
    advanceTo(ch, choice);
    return;
  }
  showLine(line);
}

function nextLine() {
  if (questState.typing) {
    // Skip typewriter animation immediately
    clearInterval(typeTimer);
    questState.typing = false;
    const ch = state.currentCh;
    const line = ch.lines[questState.lineIdx];
    document.getElementById('d-text').textContent = line.text;
    if (line.choice) showChoices(line.choices);
    return;
  }
  if (questState.choiceWaiting) return;
  SoundEngine.playClick();
  questState.lineIdx++;
  const ch = state.currentCh;
  if (questState.lineIdx >= ch.lines.length) return endChapter();
  showLine(ch.lines[questState.lineIdx]);
}

window.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') nextLine();
});
