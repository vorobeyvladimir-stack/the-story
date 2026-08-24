/* ═══════════════════════════════════════
   QUEST / DIALOGUE ENGINE
   Owns: the visual-novel scene screen — starting a chapter, character
   portraits, typewriter dialogue box and branching choice resolution.
   Exports (globals): QuestEngine, startChapter, nextLine, buildChars
   Depends on: state, show, endChapter (core.js), SoundEngine (audio.js),
   BG, SVG (characters.js), CHAPTERS (storyData.js)
═══════════════════════════════════════ */

/**
 * Dialogue Engine State
 */
const questState = {
  /** @type {import('./storyData.js').DialogueLine[]} */
  queue: [],
  queueIdx: 0,
  typing: false,
  choiceWaiting: false
};

let typeTimer = null;

const QuestEngine = {
  /**
   * Starts visual novel dialogue for a given chapter
   * @param {import('./storyData.js').Chapter} ch
   */
  startChapter: function(ch) {
    state.currentCh = ch;
    questState.queue = Array.isArray(ch.lines) ? [...ch.lines] : [];
    questState.queueIdx = 0;
    questState.typing = false;
    questState.choiceWaiting = false;

    const hudCh = document.getElementById('hud-ch');
    if (hudCh) hudCh.textContent = `Ch.${ch.num}: ${ch.title}`;

    // Set background & decoration
    const bgData = BG[ch.bg] || { bg: '#080815', deco: '✨', lbl: ch.loc };
    const sBg = document.getElementById('s-bg');
    if (sBg) sBg.style.background = bgData.bg;

    const sDeco = document.getElementById('s-deco');
    if (sDeco) {
      sDeco.innerHTML = bgData.deco.split('').map(e => `<span class="s-deco-ico">${e}</span>`).join('');
    }

    const locBadge = document.getElementById('loc-badge');
    if (locBadge) locBadge.textContent = bgData.lbl;

    // Render characters & display scene or comic canvas
    const charsWrap = document.getElementById('chars-wrap');
    const comicCont = document.getElementById('comic-container');

    if (ch.comic && window.ComicEngine) {
      if (charsWrap) charsWrap.style.display = 'none';
      if (comicCont) {
        comicCont.style.display = 'flex';
        ComicEngine.loadComic(ch.comic);
      }
    } else {
      if (comicCont) comicCont.style.display = 'none';
      if (charsWrap) {
        charsWrap.style.display = 'flex';
        buildChars(ch.chars || []);
      }
    }

    show('s-scene');

    if (questState.queue.length > 0) {
      this.showLine(questState.queue[0]);
    } else {
      endChapter();
    }
  },

  /**
   * Renders a single dialogue line with typewriter animation
   * @param {import('./storyData.js').DialogueLine} line
   */
  showLine: function(line) {
    if (!line) return endChapter();

    questState.choiceWaiting = false;
    const choicesBox = document.getElementById('d-choices');
    if (choicesBox) choicesBox.style.display = 'none';

    const nextPrompt = document.getElementById('d-next');
    if (nextPrompt) nextPrompt.style.display = 'block';

    // Speaker styling
    const colors = {
      MAN: ' style="color:var(--blue)"',
      VVV: ' style="color:var(--blue)"',
      GALA: ' style="color:var(--purple)"',
      LYDIA: ' style="color:var(--teal)"',
      NARRATOR: ' style="color:var(--gold)"'
    };
    const spk = document.getElementById('d-speaker');
    if (spk) {
      spk.innerHTML = `<span${colors[line.who] || ''}>${line.who}</span>`;
    }
    setTalking(line.who === 'NARRATOR' ? '' : line.who);

    // If comic chapter, trigger Pixel Dissolve Reveal for matching panel
    if (state.currentCh && state.currentCh.comic && window.ComicEngine) {
      if (typeof line.panel === 'number') {
        ComicEngine.revealPanel(line.panel);
      } else {
        ComicEngine.revealAll();
      }
    }

    // Typewriter effect with retro audio ticks
    const dt = document.getElementById('d-text');
    if (dt) dt.textContent = '';
    if (typeTimer) clearInterval(typeTimer);

    let i = 0;
    const txt = line.text;
    questState.typing = true;

    typeTimer = setInterval(() => {
      if (i < txt.length) {
        const char = txt[i++];
        if (dt) dt.textContent += char;
        if (char.trim() !== '') {
          SoundEngine.playTypewriter();
        }
      } else {
        clearInterval(typeTimer);
        questState.typing = false;
        if (line.choice && Array.isArray(line.choices)) {
          this.showChoices(line.choices);
        }
      }
    }, 28);
  },

  /**
   * Displays interactive choice buttons
   * @param {import('./storyData.js').DialogueChoice[]} choices
   */
  showChoices: function(choices) {
    questState.choiceWaiting = true;
    const nextPrompt = document.getElementById('d-next');
    if (nextPrompt) nextPrompt.style.display = 'none';

    const box = document.getElementById('d-choices');
    if (!box) return;
    box.innerHTML = '';
    box.style.display = 'flex';

    choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'd-choice';
      btn.textContent = '▸ ' + c.text;
      btn.onclick = (e) => {
        e.stopPropagation();
        SoundEngine.playClick();
        this.pickChoice(c.next);
      };
      box.appendChild(btn);
    });
  },

  /**
   * Resolves player choice and seamlessly injects target branch lines
   * @param {string} branchId
   */
  pickChoice: function(branchId) {
    questState.choiceWaiting = false;
    const box = document.getElementById('d-choices');
    if (box) box.style.display = 'none';

    const nextPrompt = document.getElementById('d-next');
    if (nextPrompt) nextPrompt.style.display = 'block';

    const ch = state.currentCh;
    questState.queueIdx++;

    // If named branch exists in chapter, splice branch lines into queue
    if (ch && ch.branches && ch.branches[branchId]) {
      const branchLines = ch.branches[branchId];
      questState.queue.splice(questState.queueIdx, 0, ...branchLines);
    }

    if (questState.queueIdx >= questState.queue.length) {
      return endChapter();
    }
    this.showLine(questState.queue[questState.queueIdx]);
  },

  /**
   * Advances dialogue to next step or skips typewriter animation
   */
  nextLine: function() {
    if (questState.typing) {
      clearInterval(typeTimer);
      questState.typing = false;
      if (state.currentCh && state.currentCh.comic && window.ComicEngine) {
        ComicEngine.skipCurrentReveal();
      }
      const curLine = questState.queue[questState.queueIdx];
      const dt = document.getElementById('d-text');
      if (dt && curLine) {
        dt.textContent = curLine.text;
        if (curLine.choice && Array.isArray(curLine.choices)) {
          this.showChoices(curLine.choices);
        }
      }
      return;
    }

    if (questState.choiceWaiting) return;

    SoundEngine.playClick();
    questState.queueIdx++;

    if (questState.queueIdx >= questState.queue.length) {
      return endChapter();
    }
    this.showLine(questState.queue[questState.queueIdx]);
  }
};

/* ── CHARACTERS DISPLAY ── */
function buildChars(charList) {
  const wrap = document.getElementById('chars-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const labels = { man: 'VVV ♂', vvv: 'VVV ♂', gala: 'Gala', lydia: 'Lydia' };
  charList.forEach(c => {
    const w = document.createElement('div');
    w.className = 'char-wrap';
    w.id = 'char-' + c;
    w.innerHTML = `<div class="char-lbl">${labels[c] || c}</div>${SVG[c] || ''}`;
    wrap.appendChild(w);
  });
}

function setTalking(who) {
  document.querySelectorAll('.char-svg').forEach(s => s.classList.remove('talking'));
  const key = (who || '').toLowerCase();
  const el = document.querySelector('#char-' + key + ' .char-svg');
  if (el) el.classList.add('talking');
}

// Global Bridge Functions
function startChapter(ch) { QuestEngine.startChapter(ch); }
function nextLine() { QuestEngine.nextLine(); }

if (window.Game) {
  window.Game.quest = QuestEngine;
}

window.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') {
    const scene = document.getElementById('s-scene');
    if (scene && scene.classList.contains('active')) {
      nextLine();
    }
  }
});
