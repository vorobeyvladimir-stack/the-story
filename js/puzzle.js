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

    const counter = document.getElementById('puz-counter');
    if (counter) {
      counter.textContent = `${solved} / ${total}`;
    }
    const ringBar = document.getElementById('puz-ring-bar');
    if (ringBar && total > 0) {
      const circumference = 175.93;
      const ratio = solved / total;
      ringBar.style.strokeDashoffset = String(circumference * (1 - ratio));
    }
  }

  function oppInsert(ins) {
    if (!ins) return null;
    return ins === headbreaker.Tab ? headbreaker.Slot : headbreaker.Tab;
  }

  function gridPos(piece) {
    const m = /^p_(\d+)_(\d+)$/.exec(piece.metadata && piece.metadata.id);
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

      const counterEl = document.getElementById('puz-counter');
      if (counterEl) {
        counterEl.textContent = `0 / ${cols * rows}`;
      }
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

        const availW = Math.min(screenW * 0.96, 560);
        const availH = Math.max(420, Math.min(screenH * 0.76, 660));

        const basePieceW = availW / (cols + 0.8);
        const basePieceH = availH / (rows + 0.8);

        const imgAspect = imgW / imgH;
        const gridAspect = cols / rows;

        let pieceW, pieceH;
        if (imgAspect >= gridAspect) {
          pieceW = basePieceW;
          pieceH = (pieceW * cols / imgAspect) / rows;
          if (pieceH * (rows + 0.8) > availH) {
            pieceH = basePieceH;
            pieceW = (pieceH * rows * imgAspect) / cols;
          }
        } else {
          pieceH = basePieceH;
          pieceW = (pieceH * rows * imgAspect) / cols;
          if (pieceW * (cols + 0.8) > availW) {
            pieceW = basePieceW;
            pieceH = (pieceW * cols / imgAspect) / rows;
          }
        }

        pieceW = Math.max(36, Math.floor(pieceW));
        pieceH = Math.max(36, Math.floor(pieceH));

        const marginX = Math.floor(pieceW / 2);
        const marginY = Math.floor(pieceH / 2);
        const boardW = pieceW * cols + marginX * 2;
        const boardH = pieceH * rows + marginY * 2;

        boardEl.style.width = `${boardW}px`;
        boardEl.style.height = `${boardH}px`;

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

          hbCanvas.puzzle.attachHorizontalConnectionRequirement(isImmediatelyLeftOf);
          hbCanvas.puzzle.attachVerticalConnectionRequirement(isImmediatelyAbove);
          hbCanvas.puzzle.forceConnectionWhileDragging();

          const gridIsWiderThanPhoto =
            hbCanvas.puzzleDiameter.x / hbCanvas.puzzleDiameter.y > imgW / imgH;
          if (gridIsWiderThanPhoto) {
            hbCanvas.adjustImagesToPuzzleWidth();
          } else {
            hbCanvas.adjustImagesToPuzzleHeight();
          }

          hbCanvas.imageMetadata.offset = {
            x: pieceW / 2 - marginX,
            y: pieceH / 2 - marginY
          };

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
              const posX = marginX + c * pieceW + pieceW / 2;
              const posY = marginY + r * pieceH + pieceH / 2;

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
            const counter = document.getElementById('puz-counter');
            if (counter) counter.textContent = `${cols * rows} / ${cols * rows}`;
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
