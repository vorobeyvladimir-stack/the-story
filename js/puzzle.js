/* ═══════════════════════════════════════
   PUZZLE MINIGAME (headbreaker.js + konva.min.js)
   Owns: the whole jigsaw screen — grid/piece generation, connection rules,
   image scaling, magnetic snap sparks, and completion.
   Exports (globals): PuzzleGame (start, togglePreview, shuffle, hintSnap)
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
    const bar = document.getElementById('puz-bar-fill');
    if (bar && total > 0) {
      bar.style.width = `${(solved / total) * 100}%`;
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

      const hudCh = document.getElementById('hud-ch');
      if (hudCh) hudCh.textContent = `Ch.${ch.num}: ${ch.title}`;

      const titleEl = document.getElementById('puz-title-text');
      if (titleEl) {
        titleEl.textContent = `Ch.${ch.num}: ${ch.title}`;
      }

      const prevImg = document.getElementById('puz-preview-img');
      if (prevImg) prevImg.src = ch.image;

      const pipImg = document.getElementById('puz-pip-img');
      if (pipImg) pipImg.src = ch.image;

      show('s-puzzle');

      const boardEl = document.getElementById('puzzle-board');
      if (!boardEl) return;
      boardEl.innerHTML = '';

      const cols = ch.grid ? ch.grid.cols : 4;
      const rows = ch.grid ? ch.grid.rows : 3;

      const counterEl = document.getElementById('puz-counter');
      if (counterEl) {
        counterEl.textContent = `0 / ${cols * rows}`;
      }
      const barEl = document.getElementById('puz-bar-fill');
      if (barEl) {
        barEl.style.width = '0%';
      }

      const img = new Image();
      let hasLoaded = false;

      const initHeadbreaker = () => {
        if (hasLoaded) return;
        hasLoaded = true;

        // Cap DPR to 2x for optimal mobile GPU performance (saves 50%+ video memory on iPhone Retina 3x)
        const safeDPR = Math.min(window.devicePixelRatio || 1, 2);
        if (window.Konva) {
          window.Konva.pixelRatio = safeDPR;
        }

        const imgW = (img.naturalWidth && img.naturalWidth > 0) ? img.naturalWidth : 858;
        const imgH = (img.naturalHeight && img.naturalHeight > 0) ? img.naturalHeight : 854;

        const availW = Math.min(window.innerWidth * 0.94, 540);
        const availH = Math.max(340, Math.min(window.innerHeight * 0.52, 480));

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

        pieceW = Math.max(32, Math.floor(pieceW));
        pieceH = Math.max(32, Math.floor(pieceH));

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
            maxPiecesCount: { x: cols, y: rows },
            pixelRatio: safeDPR
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

          // iOS 17+ / Telegram WebApp Taptic Engine piece drag tactile sensation
          if (hbCanvas.stage) {
            hbCanvas.stage.on('dragstart', () => {
              const pos = hbCanvas.stage.getPointerPosition() || { x: 0, y: 0 };
              if (window.HapticEngine) HapticEngine.startDrag(pos.x, pos.y);
            });
            hbCanvas.stage.on('dragmove', () => {
              const pos = hbCanvas.stage.getPointerPosition();
              if (pos && window.HapticEngine) HapticEngine.onDragMove(pos.x, pos.y);
            });
            hbCanvas.stage.on('dragend', () => {
              if (window.HapticEngine) HapticEngine.endDrag();
            });
          }

          hbCanvas.onConnect(() => {
            SoundEngine.playCorrect();
            if (window.HapticEngine) HapticEngine.impact('medium');
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
            if (window.HapticEngine) HapticEngine.notification('success');
            notify('🎉 Puzzle Complete!');
            const counter = document.getElementById('puz-counter');
            if (counter) counter.textContent = `${cols * rows} / ${cols * rows}`;
            const bar = document.getElementById('puz-bar-fill');
            if (bar) bar.style.width = '100%';
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

          requestAnimationFrame(() => {
            if (hbCanvas) {
              hbCanvas.redraw();
            }
          });

        } catch(err) {
          console.error("Headbreaker initialization error:", err);
        }
      };

      const runWithAsyncDecode = async () => {
        if ('decode' in img) {
          try {
            await img.decode();
          } catch (e) {
            // Graceful fallback if decode is unsupported or image is already cached
          }
        }
        initHeadbreaker();
      };

      img.onload = runWithAsyncDecode;
      img.src = ch.image;

      if (img.complete && img.naturalWidth > 0) {
        runWithAsyncDecode();
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
    },

    hintSnap: function() {
      if (!hbCanvas || !hbCanvas.puzzle) return;
      SoundEngine.playClick();
      const loose = hbCanvas.puzzle.pieces.filter(p => !p.fixed && !p.connected);
      if (loose.length > 0) {
        const piece = loose[0];
        const pos = gridPos(piece);
        if (pos) {
          const pw = hbCanvas.puzzle.pieceWidth;
          const ph = hbCanvas.puzzle.pieceHeight;
          const marginX = Math.floor(pw / 2);
          const marginY = Math.floor(ph / 2);
          piece.relocateTo(marginX + pos.c * pw + pw / 2, marginY + pos.r * ph + ph / 2);
          hbCanvas.puzzle.autoconnect();
          hbCanvas.redraw();
          SoundEngine.playCorrect();
          spawnMagneticSparks(piece);
          notify('💡 Piece guided home!');
          setTimeout(updateCounter, 20);
        }
      } else {
        notify('✨ All pieces already assembled!');
      }
    }
  };
})();

if (window.Game) {
  window.Game.puzzle = PuzzleGame;
}
