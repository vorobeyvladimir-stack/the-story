/* ═══════════════════════════════════════
   HEADBREAKER.JS JIGSAW PUZZLE ENGINE
   Rounded Lines Implementation (16 Pieces - 4x4)
═══════════════════════════════════════ */

const PuzzleGame = (function() {
  let currentCh = null;
  let hbCanvas = null;

  function updateCounter() {
    if (!hbCanvas || !hbCanvas.pieces) return;
    const total = hbCanvas.pieces.length;
    const solved = hbCanvas.pieces.filter(p => p.fixed || p.connected).length;

    const counter = document.getElementById('puz-counter');
    if (counter) {
      counter.textContent = `${solved} / ${total}`;
    }
  }

  function oppInsert(ins) {
    return ins === headbreaker.Tab ? headbreaker.Slot : headbreaker.Tab;
  }

  return {
    start: function(ch) {
      currentCh = ch;

      document.getElementById('hud-ch').textContent = `Ch.${ch.num}: ${ch.title}`;
      document.getElementById('puz-title-text').textContent = `🧩 ${ch.title}`;
      document.getElementById('puz-preview-img').src = ch.image;

      // 1. Show screen FIRST so DOM container is visible
      show('s-puzzle');

      const boardEl = document.getElementById('puzzle-board');
      if (!boardEl) return;
      boardEl.innerHTML = '';

      // Default 4x4 grid (16 pieces)
      const cols = ch.grid ? ch.grid.cols : 4;
      const rows = ch.grid ? ch.grid.rows : 4;

      const counterEl = document.getElementById('puz-counter');
      if (counterEl) {
        counterEl.textContent = `0 / ${cols * rows}`;
      }

      const img = new Image();
      let hasLoaded = false;

      const initHeadbreaker = () => {
        if (hasLoaded) return;
        hasLoaded = true;

        const imgW = (img.naturalWidth && img.naturalWidth > 0) ? img.naturalWidth : 600;
        const imgH = (img.naturalHeight && img.naturalHeight > 0) ? img.naturalHeight : 400;

        const maxW = Math.min(window.innerWidth * 0.92, 540);
        const pieceW = Math.floor(maxW / cols);
        const aspect = (imgH / rows) / (imgW / cols);
        const pieceH = Math.floor(pieceW * aspect);

        // Playfield dimensions match exact grid bounds
        const boardW = pieceW * cols;
        const boardH = pieceH * rows;

        boardEl.style.width = `${boardW}px`;
        boardEl.style.height = `${boardH}px`;
        boardEl.innerHTML = '';

        try {
          // Initialize Headbreaker Canvas with Rounded Lines outline
          hbCanvas = new headbreaker.Canvas('puzzle-board', {
            width: boardW,
            height: boardH,
            pieceSize: {
              x: pieceW,
              y: pieceH
            },
            proximity: 20,
            borderFill: 0, // CRITICAL: 0 borderFill for 100% seamless image texture alignment
            strokeWidth: 2,
            strokeColor: '#e8457a',
            outline: new headbreaker.outline.Rounded(),
            image: img,
            preventOffstageDrag: false, // CRITICAL: Allows connected piece clusters to drag smoothly without detaching
            maxPiecesCount: { x: cols, y: rows }
          });

          // CRITICAL: Lock connected pieces permanently while dragging so they NEVER detach!
          hbCanvas.puzzle.forceConnectionWhileDragging();

          // Activate image scaling according to Headbreaker documentation
          hbCanvas.adjustImagesToPuzzleHeight();

          // Generate 100% guaranteed complementary Tab & Slot objects for all inside edges
          const horiz = [], vert = [];
          for (let r = 0; r < rows - 1; r++) {
            horiz.push(Array.from({length: cols}, () => Math.random() < 0.5 ? headbreaker.Tab : headbreaker.Slot));
          }
          for (let r = 0; r < rows; r++) {
            vert.push(Array.from({length: cols - 1}, () => Math.random() < 0.5 ? headbreaker.Tab : headbreaker.Slot));
          }

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const structObj = {};
              if (r > 0) structObj.up = oppInsert(horiz[r - 1][c]);
              if (r < rows - 1) structObj.down = horiz[r][c];
              if (c > 0) structObj.left = oppInsert(vert[r][c - 1]);
              if (c < cols - 1) structObj.right = vert[r][c];

              const id = `p_${r}_${c}`;
              // CRITICAL: Target position MUST start at (0,0) to prevent texture wrapping from opposite sides
              const posX = c * pieceW;
              const posY = r * pieceH;

              hbCanvas.sketchPiece({
                structure: structObj,
                metadata: {
                  id: id,
                  targetPosition: { x: posX, y: posY },
                  currentPosition: { x: posX, y: posY }
                }
              });
            }
          }

          // Shuffle pieces across the board
          hbCanvas.shuffle(0.7);

          // Audio triggers & deferred counter updates
          hbCanvas.onConnect(() => {
            SoundEngine.playCorrect();
            setTimeout(updateCounter, 20);
          });

          hbCanvas.onDisconnect(() => {
            SoundEngine.playClick();
            setTimeout(updateCounter, 20);
          });

          // Solved trigger
          hbCanvas.attachSolvedValidator();
          hbCanvas.onValid(() => {
            SoundEngine.playFanfare();
            notify('🧩 Interlocking Jigsaw Solved!');
            setTimeout(() => {
              completeChapter(currentCh);
            }, 1500);
          });

          // Initial draw
          hbCanvas.draw();
          updateCounter();

          // Scheduled redraws to force paint after CSS transitions settle
          [30, 100, 250, 500].forEach(delay => {
            setTimeout(() => {
              if (hbCanvas) {
                hbCanvas.redraw();
              }
            }, delay);
          });

          requestAnimationFrame(() => {
            if (hbCanvas) {
              hbCanvas.redraw();
            }
          });

        } catch(err) {
          console.error("Headbreaker initialization error:", err);
        }
      };

      img.onload = initHeadbreaker;
      img.src = ch.image;

      if (img.complete && img.naturalWidth > 0) {
        initHeadbreaker();
      }
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
