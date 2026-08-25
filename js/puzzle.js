/* ═══════════════════════════════════════
   PUZZLE MINIGAME (headbreaker.js + konva.min.js)
   Owns: the whole jigsaw screen — grid/piece generation, connection rules,
   image scaling, and completion.
   Exports (globals): PuzzleGame (start, togglePreview, shuffle)
   Depends on: show, completeChapter, notify (core.js), SoundEngine (audio.js),
   headbreaker/konva (js/lib)
═══════════════════════════════════════ */

const PuzzleGame = (function() {
  let currentCh = null;
  let hbCanvas = null;

  function updateCounter() {
    if (!hbCanvas || !hbCanvas.puzzle) return;
    const total = hbCanvas.puzzle.pieces.length;
    const solved = hbCanvas.puzzle.pieces.filter(p => p.fixed || p.connected).length;

    const ringBar = document.getElementById('puz-ring-bar');
    if (ringBar && total > 0) {
      const circumference = 175.93;
      const ratio = solved / total;
      ringBar.style.strokeDashoffset = String(circumference * (1 - ratio));
    }
  }

  function gridPos(piece) {
    if (!piece || !piece.metadata) return null;
    if (typeof piece.metadata.r === 'number' && typeof piece.metadata.c === 'number') {
      return { r: piece.metadata.r, c: piece.metadata.c };
    }
    const m = /^p_(\d+)_(\d+)$/.exec(piece.metadata.id);
    return m ? { r: +m[1], c: +m[2] } : null;
  }

  function isImmediatelyLeftOf(p1, p2) {
    const a = gridPos(p1);
    const b = gridPos(p2);
    return !!(a && b && a.r === b.r && a.c + 1 === b.c);
  }

  function isImmediatelyAbove(p1, p2) {
    const a = gridPos(p1);
    const b = gridPos(p2);
    return !!(a && b && a.c === b.c && a.r + 1 === b.r);
  }

  return {
    start: function(ch) {
      currentCh = ch;

      const prevImg = document.getElementById('puz-preview-img');
      if (prevImg) prevImg.src = ch.image;

      const pipImg = document.getElementById('puz-pip-img');
      if (pipImg) pipImg.src = ch.image;

      show('s-puzzle');

      const boardEl = document.getElementById('puzzle-board');
      if (!boardEl) return;
      
      // Clean up previous Headbreaker / Konva canvas stage to avoid canvas stacking
      if (hbCanvas) {
        try {
          if (hbCanvas.__konvaLayer__) {
            const stage = hbCanvas.__konvaLayer__.getStage();
            if (stage) stage.destroy();
          }
        } catch(e) {}
        hbCanvas = null;
      }
      boardEl.innerHTML = '';

      const cols = ch.grid ? ch.grid.cols : 4;
      const rows = ch.grid ? ch.grid.rows : 3;

      const ringBar = document.getElementById('puz-ring-bar');
      if (ringBar) {
        ringBar.style.strokeDashoffset = '175.93';
      }

      let isInitialized = false;

      const initHeadbreaker = (img) => {
        if (isInitialized) return;
        isInitialized = true;

        const imgW = (img.naturalWidth && img.naturalWidth > 0) ? img.naturalWidth : 858;
        const imgH = (img.naturalHeight && img.naturalHeight > 0) ? img.naturalHeight : 854;

        const screenW = window.innerWidth || document.documentElement.clientWidth || 390;
        const screenH = window.innerHeight || document.documentElement.clientHeight || 844;

        // 1. Board fills all remaining vertical space directly below the top controls
        const boardW = Math.floor(Math.min(screenW * 0.98, 560));
        const boardH = Math.floor(Math.max(430, Math.min(screenH - 74, 880)));

        // 2. Keep piece size exact (do NOT increase piece size, allowing generous drag room)
        const imgAspect = imgW / imgH;
        let pieceW = Math.min(Math.floor((boardW * 0.82) / cols), 78);
        let pieceH = Math.floor((pieceW * cols / imgAspect) / rows);

        if (pieceH * rows > boardH * 0.52) {
          pieceH = Math.floor((boardH * 0.52) / rows);
          pieceW = Math.floor((pieceH * rows * imgAspect) / cols);
        }

        pieceW = Math.max(48, Math.min(pieceW, 80));
        pieceH = Math.max(48, Math.min(pieceH, 80));

        // 3. Center the assembled puzzle inside the large board canvas
        const puzzleTotalW = pieceW * cols;
        const puzzleTotalH = pieceH * rows;
        const originX = Math.floor((boardW - puzzleTotalW) / 2);
        const originY = Math.floor((boardH - puzzleTotalH) / 2);

        boardEl.style.width = `${boardW}px`;
        boardEl.style.height = `${boardH}px`;

        const floatControls = document.querySelector('.puz-floating-controls');
        if (floatControls) {
          floatControls.style.maxWidth = `${boardW}px`;
        }

        try {
          hbCanvas = new headbreaker.Canvas('puzzle-board', {
            width: boardW,
            height: boardH,
            pieceSize: { x: pieceW, y: pieceH },
            proximity: 22,
            borderFill: 0,
            strokeWidth: 2.5,
            strokeColor: '#ff2a9d',
            lineSoftness: 0.18,
            outline: new headbreaker.outline.Rounded(),
            image: img,
            preventOffstageDrag: false,
            maxPiecesCount: { x: cols, y: rows }
          });

          const gridIsWiderThanPhoto =
            hbCanvas.puzzleDiameter.x / hbCanvas.puzzleDiameter.y > imgW / imgH;
          if (gridIsWiderThanPhoto) {
            hbCanvas.adjustImagesToPuzzleWidth();
          } else {
            hbCanvas.adjustImagesToPuzzleHeight();
          }

          // Build metadata grid to track exact row and column for every piece
          const meta = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              meta.push({ r, c, id: `p_${r}_${c}` });
            }
          }

          // Generate randomized puzzle topology for any chapter grid with metadata
          hbCanvas.autogenerate({
            horizontalPiecesCount: cols,
            verticalPiecesCount: rows,
            insertsGenerator: headbreaker.generators.random,
            metadata: meta
          });

          // Strict neighbor connection rules & prevent disconnection on drag
          hbCanvas.puzzle.attachHorizontalConnectionRequirement(isImmediatelyLeftOf);
          hbCanvas.puzzle.attachVerticalConnectionRequirement(isImmediatelyAbove);
          hbCanvas.puzzle.forceConnectionWhileDragging();

          hbCanvas.puzzle.pieces.forEach(piece => {
            const originalDrop = piece.drop.bind(piece);
            piece.drop = () => {
              originalDrop();
              hbCanvas.puzzle.autoconnect();
            };
          });

          hbCanvas.shuffle(0.75);

          if (boardEl && !boardEl.dataset.hapticsBound) {
            boardEl.dataset.hapticsBound = '1';
            boardEl.addEventListener('pointerdown', () => {
              if (window.HapticEngine) HapticEngine.impact('light');
            }, { passive: true });
          }

          hbCanvas.onConnect(() => {
            SoundEngine.playCorrect();
            if (window.HapticEngine) HapticEngine.snap();
            setTimeout(updateCounter, 20);
          });

          hbCanvas.onDisconnect(() => {
            SoundEngine.playClick();
            if (window.HapticEngine) HapticEngine.impact('light');
            setTimeout(updateCounter, 20);
          });

          hbCanvas.attachSolvedValidator();
          hbCanvas.onValid(() => {
            SoundEngine.playFanfare();
            if (window.HapticEngine) HapticEngine.victory();
            notify('🎉 Puzzle Complete!');
            const ringBar = document.getElementById('puz-ring-bar');
            if (ringBar) ringBar.style.strokeDashoffset = '0';
            setTimeout(() => {
              completeChapter(currentCh);
            }, 1400);
          });

          hbCanvas.draw();
          updateCounter();

          [30, 100, 250, 500].forEach(delay => {
            setTimeout(() => {
              if (hbCanvas) {
                hbCanvas.redraw();
              }
            }, delay);
          });
        } catch(err) {
          console.error("Headbreaker initialization error:", err);
        }
      };

      const img = new Image();
      let loadTriggered = false;

      const onImageReady = () => {
        if (loadTriggered) return;
        loadTriggered = true;
        initHeadbreaker(img);
      };

      img.onload = onImageReady;
      img.onerror = onImageReady;
      img.src = ch.image;

      if (img.complete && img.naturalWidth > 0) {
        onImageReady();
      }
    },

    togglePreview: function() {
      const modal = document.getElementById('puzzle-preview-modal');
      if (modal) {
        modal.classList.toggle('show');
        SoundEngine.playClick();
      }
    },

    shuffle: function() {
      if (!hbCanvas || !hbCanvas.puzzle) return;
      SoundEngine.playClick();
      hbCanvas.shuffle(0.8);
      hbCanvas.redraw();
      notify('🔄 Pieces shuffled!');
      updateCounter();
    }
  };
})();

if (window.Game) {
  window.Game.puzzle = PuzzleGame;
}
