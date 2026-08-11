/* ═══════════════════════════════════════
   HEADBREAKER.JS JIGSAW PUZZLE ENGINE
   Official "Background Code" Implementation
═══════════════════════════════════════ */

const PuzzleGame = (function() {
  let currentCh = null;
  let hbCanvas = null;

  function updateCounter() {
    if (!hbCanvas || !hbCanvas.pieces) return;
    const total = hbCanvas.pieces.length;
    let solved = 0;

    hbCanvas.pieces.forEach(p => {
      if (p.fixed || (p.connectionCount && p.connectionCount() > 0)) {
        solved++;
      }
    });

    const counter = document.getElementById('puz-counter');
    if (counter) {
      counter.textContent = `${solved} / ${total}`;
    }
  }

  return {
    start: function(ch) {
      currentCh = ch;

      document.getElementById('hud-ch').textContent = `Ch.${ch.num}: ${ch.title}`;
      document.getElementById('puz-title-text').textContent = `🧩 ${ch.title}`;
      document.getElementById('puz-preview-img').src = ch.image;

      // 1. Show screen FIRST so DOM container is visible before rendering
      show('s-puzzle');

      const boardEl = document.getElementById('puzzle-board');
      if (!boardEl) return;
      boardEl.innerHTML = '';

      const cols = ch.grid ? ch.grid.cols : 6;
      const rows = ch.grid ? ch.grid.rows : 4;

      const img = new Image();
      img.onload = () => {
        const maxW = Math.min(window.innerWidth * 0.92, 540);
        const pieceW = Math.floor(maxW / cols);
        const aspect = (img.naturalHeight / rows) / (img.naturalWidth / cols);
        const pieceH = Math.floor(pieceW * aspect);

        const boardW = pieceW * cols;
        const boardH = pieceH * rows;

        boardEl.style.width = `${boardW}px`;
        boardEl.style.height = `${boardH}px`;
        boardEl.innerHTML = '';

        try {
          // Official Headbreaker Background Configuration with 0 borderFill for 100% seamless image matching
          hbCanvas = new headbreaker.Canvas('puzzle-board', {
            width: boardW,
            height: boardH,
            pieceSize: {
              width: pieceW,
              height: pieceH
            },
            proximity: 20,
            borderFill: 0, // CRITICAL: 0 borderFill prevents texture offsets between adjacent pieces
            strokeWidth: 2,
            strokeColor: '#e8457a',
            lineSoftness: 0.18,
            image: img,
            maxPiecesCount: { x: cols, y: rows }
          });

          // Activate image scaling according to Headbreaker documentation
          hbCanvas.adjustImagesToPuzzle();

          // Autogenerate 6x4 interlocking jigsaw pieces
          hbCanvas.autogenerate({
            horizontalPiecesCount: cols,
            verticalPiecesCount: rows
          });

          // Shuffle pieces across the board
          hbCanvas.shuffle(0.7);

          // Audio triggers
          hbCanvas.onConnect(() => {
            SoundEngine.playCorrect();
            updateCounter();
          });

          hbCanvas.onDisconnect(() => {
            SoundEngine.playClick();
            updateCounter();
          });

          // Solved trigger
          hbCanvas.onValidating(() => {
            SoundEngine.playFanfare();
            notify('🧩 Interlocking Jigsaw Solved!');
            setTimeout(() => {
              completeChapter(currentCh);
            }, 1500);
          });

          // Force immediate render on next frame so pieces appear without needing a click
          requestAnimationFrame(() => {
            if (hbCanvas) {
              hbCanvas.draw();
              updateCounter();
            }
            setTimeout(() => {
              if (hbCanvas) {
                hbCanvas.draw();
              }
            }, 60);
          });

        } catch(err) {
          console.error("Headbreaker initialization error:", err);
        }
      };
      img.src = ch.image;
    },

    togglePreview: function() {
      const modal = document.getElementById('puzzle-preview-modal');
      if (modal) {
        modal.classList.toggle('show');
        SoundEngine.playClick();
      }
    }
  };
})();
