/* ═══════════════════════════════════════
   CHAT MINIGAME
   Owns: the "guess who wrote this message" screen shown after a chapter's
   dialogue, when that chapter has chatLines.
   Exports (globals): ChatEngine, startChat, endChat
   Depends on: state, completeChapter, show, notify (core.js),
   SoundEngine (audio.js)
═══════════════════════════════════════ */

const ChatEngine = {
  /**
   * Starts Telegram-style group chat quiz for a chapter
   * @param {import('./storyData.js').Chapter} ch
   */
  startChat: function(ch) {
    const body = document.getElementById('chat-body');
    if (!body) return;
    body.innerHTML = '';

    const foot = document.getElementById('chat-foot');
    if (foot) foot.style.display = 'none';

    let score = 0;
    let total = 0;
    const msgs = Array.isArray(ch.chatLines) ? ch.chatLines : [];

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
            row.querySelectorAll('.g-btn').forEach(x => {
              /** @type {HTMLButtonElement} */ (x).disabled = true;
            });

            if (name === m.answer) {
              b.classList.add('ok');
              score++;
              SoundEngine.playCorrect();
              const whoEl = div.querySelector('.msg-who');
              if (whoEl) whoEl.textContent = name.toUpperCase() + ' ✓';
              div.className = `msg msg-${name}`;
            } else {
              b.classList.add('no');
              SoundEngine.playWrong();
              row.querySelectorAll('.g-btn').forEach(x => {
                if (x.textContent && x.textContent.toLowerCase() === m.answer) {
                  x.classList.add('ok');
                }
              });
              const whoEl = div.querySelector('.msg-who');
              if (whoEl) whoEl.textContent = m.answer.toUpperCase() + ' ✗';
            }

            const cScore = document.getElementById('c-score');
            if (cScore) cScore.textContent = String(score);

            const answered = body.querySelectorAll('[data-answered]').length;
            if (answered >= total) {
              if (foot) foot.style.display = 'flex';
              const res = document.getElementById('chat-res');
              const pct = total > 0 ? Math.round((score / total) * 100) : 100;
              if (res) {
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

    const cScore = document.getElementById('c-score');
    if (cScore) cScore.textContent = '0';

    const cTot = document.getElementById('c-tot');
    if (cTot) cTot.textContent = String(total);

    show('s-chat');
  },

  endChat: function() {
    SoundEngine.playClick();
    if (state.currentCh) {
      completeChapter(state.currentCh);
    }
  }
};

// Global Bridge Functions
function startChat(ch) { ChatEngine.startChat(ch); }
function endChat() { ChatEngine.endChat(); }

if (window.Game) {
  window.Game.chat = ChatEngine;
}

// iOS touch momentum scrolling
const chatBody = document.getElementById('chat-body');
if (chatBody) chatBody.style['-webkit-overflow-scrolling'] = 'touch';
