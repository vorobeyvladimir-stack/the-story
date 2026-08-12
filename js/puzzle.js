/* ═══════════════════════════════════════
   PUZZLE MINIGAME (headbreaker.js + konva.min.js)
   Owns: the whole jigsaw screen — grid/piece generation, connection rules,
   image scaling, and completion.
   Exports (globals): PuzzleGame (start, togglePreview)
   Depends on: show, completeChapter, notify (core.js), SoundEngine
   (audio.js), headbreaker/konva (js/lib)
   Used by: core.js (buildMap, for chapters with type:'puzzle')
   Self-contained: this is the one module that can be edited, replaced, or
   have its whole minigame swapped out without touching quest.js or chat.js.
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
  }

  function oppInsert(ins) {
    return ins === headbreaker.Tab ? headbreaker.Slot : headbreaker.Tab;
  }

  // Piece ids are 'p_{row}_{col}' (see sketchPiece below). Parsing them lets
  // the connection requirement verify TRUE photo-adjacency, independent of
  // whatever Tab/Slot shape randomly ended up on that edge.
  function gridPos(piece) {
    const m = /^p_(\d+)_(\d+)$/.exec(piece.metadata && piece.metadata.id);
    return m ? { r: +m[1], c: +m[2] } : null;
  }

  // headbreaker only checks shape (Tab<->Slot) + on-canvas proximity before
  // connecting two pieces — it has no idea which pieces are supposed to be
  // neighbours in the source photo. With only two possible edge shapes,
  // unrelated edges will randomly match, so without this check pieces that
  // aren't adjacent in the photo could snap together. This requirement adds
  // that missing check: connection is only allowed between grid cells that
  // are exactly one step apart (i.e. real neighbours).
  function isPhotoAdjacent(one, other) {
    const a = gridPos(one);
    const b = gridPos(other);
    if (!a || !b) return false;
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
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

        // Reserve room for one extra piece-width/height (half a piece of margin on
        // each side) within the same on-screen budget. During normal play, pieces
        // are shuffled and reconnected freehand — the final assembled picture ends
        // up wherever the player happened to build it, not pinned to the board's
        // top-left corner. Without this margin, a cluster built even slightly off
        // from that corner runs past the board edge and gets clipped by its
        // overflow:hidden, showing "missing" half-pieces on the far side(s).
        const maxW = Math.min(window.innerWidth * 0.92, 540);
        const pieceW = Math.floor(maxW / (cols + 1));
        const aspect = (imgH / rows) / (imgW / cols);
        const pieceH = Math.floor(pieceW * aspect);
        const marginX = pieceW / 2;
        const marginY = pieceH / 2;

        // Playfield is the grid plus that margin on every side
        const boardW = pieceW * cols + marginX * 2;
        const boardH = pieceH * rows + marginY * 2;

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

          // Reject connections between pieces that aren't real photo-neighbours,
          // even when their Tab/Slot shapes happen to match (see isPhotoAdjacent above).
          hbCanvas.puzzle.attachConnectionRequirement(isPhotoAdjacent);

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
              // headbreaker positions a piece by its CENTER (central anchor), not its
              // top-left corner, so the +pieceW/2,+pieceH/2 below is needed on top of
              // the cell's own top-left. marginX/marginY shift the whole grid so it
              // sits centered within the larger, margin-padded board (see boardW/H).
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

          // headbreaker's own piece.drop() only auto-connects the ONE piece you
          // physically dragged (puzzle.autoconnectWith(that piece)). When you drag
          // an already-connected cluster of pieces next to another cluster, several
          // OTHER pairs along that shared seam become truly adjacent too, but they
          // never get tested — only the pair right under the cursor does. Those
          // other pairs have perfectly valid, matching Tab/Slot connectors; they just
          // never get a chance to connect. Patch drop() on these pieces (instance-only,
          // not the shared prototype) to sweep the whole board afterwards, so every
          // pair that's now genuinely touching actually gets linked.
          hbCanvas.puzzle.pieces.forEach(piece => {
            const originalDrop = piece.drop.bind(piece);
            piece.drop = () => {
              originalDrop();
              hbCanvas.puzzle.autoconnect();
            };
          });

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
