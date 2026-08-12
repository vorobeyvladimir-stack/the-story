/* ═══════════════════════════════════════
   CHAT MINIGAME
   Owns: the "guess who wrote this message" screen shown after a chapter's
   dialogue, when that chapter has chatLines.
   Exports (globals): startChat, endChat
   Depends on: state, completeChapter, show, notify (core.js),
   SoundEngine (audio.js)
   Loaded by: core.js calls startChat() from its endChapter() dispatch
═══════════════════════════════════════ */

/* ── CHAPTER ENDING & CHAT MINIGAME ── */
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

// Chat body needs momentum scrolling on iOS.
const chatBody = document.getElementById('chat-body');
if (chatBody) chatBody.style['-webkit-overflow-scrolling'] = 'touch';
