# AGENTS.md — AI & Developer Architecture Guide

Compact architectural reference, engineering constraints, and codebase guide for AI assistants and human developers.

---

## 🏗️ Architecture & Module Contracts

The game is a modular vanilla JavaScript/CSS web game designed for Telegram WebApps, desktop, and mobile browsers.

```
/
├── assets/          # Artwork, sprites, comic scans, puzzle photos & video (comic_heidelberg.jpg, ch1_puzzle.jpg, etc.)
├── css/             # Componentized stylesheets (base, title, map, scene, chat, puzzle, ending)
├── js/
│   ├── audio.js     # SoundEngine: 8-bit Web Audio API synthesizer, SFX & haptic sound bindings
│   ├── characters.js# SVG: Character sprite markup mapping ('man', 'gala', 'lydia')
│   ├── comicScene.js# ComicEngine: Vanilla WebGL multi-color pixel dissolve shader engine (zero external libraries)
│   ├── storyData.js # BG & CHAPTERS data: Pure content (dialogue, choices, chat quiz, comic panels, puzzle grids)
│   ├── lib/         # Third-party dependencies: konva.min.js & headbreaker.js (PixiJS removed)
│   ├── puzzle.js    # PuzzleGame: Headbreaker jigsaw engine, Retina DPR cap, async decode, drag haptics
│   ├── core.js      # CoreEngine, Game & HapticEngine: State management, screen transitions, Taptic Engine bridge
│   ├── quest.js     # QuestEngine: Visual novel dialogue engine with typewriter, comic reveal triggers & branching
│   ├── chat.js      # ChatEngine: Telegram group chat quiz minigame
│   ├── romanceBg.js # RomanceBg: Sensual falling petals, lightning & cocktail particle engine (auto-paused during puzzle)
│   └── main.js      # Page bootstrapping, Page Visibility API deep-sleep lifecycle & Telegram WebApp integration
├── index.html       # HTML entry point loading modular CSS and scripts
└── AGENTS.md        # This AI context and rules file
```

---

## 🔄 Screen Lifecycle & Game State

```
s-title (Title) ──▶ s-map (Chapter Select)
                         │
                         ├──▶ ch.type === 'puzzle'  ──▶ s-puzzle (Jigsaw) ──▶ completeChapter
                         │
                         └──▶ Visual Novel / Comic  ──▶ s-scene (Dialogue + Comic Canvas)
                                                              │
                                                              ├── (if ch.chat) ──▶ s-chat (Quiz) ──▶ completeChapter
                                                              └── (no chat)   ──▶ completeChapter
                                                                                      │
                                  All chapters complete? ─── YES ────────────────────┴──▶ s-end (Ending)
                                                         └─── NO  ───────────────────────▶ s-map (Next Chapter)
```

### Global Namespace: `window.Game` & Core Modules
- `Game.state`: `{ currentCh, completed: Set<string>, chatScore: number, chatTotal: number }`
- `Game.core`: `show(id)`, `buildMap()`, `completeChapter(ch)`, `resetState()`, `replayGame()`
- `Game.quest`: `startChapter(ch)`, `nextLine()`, `showLine(line)`, `pickChoice(branchId)`
- `Game.chat`: `startChat(ch)`, `endChat()`
- `Game.puzzle`: `start(ch)`, `togglePreview()`, `shuffle()`
- `Game.audio`: `SoundEngine` (`playClick()`, `playTypewriter()`, `playCorrect()`, `playWrong()`, `playFanfare()`, `startBGM()`, `pauseBGM()`, `resumeBGM()`)
- `Game.haptic`: `HapticEngine` (`impact(style)`, `notification(type)`, `selection()`, `startDrag(x, y)`, `onDragMove(x, y)`, `endDrag()`)
- `window.ComicEngine`: `loadComic(src, panels, initialIdx)`, `revealPanel(idx, immediate)`, `skipCurrentReveal()`, `revealAll()`, `reset()`, `resize()`, `destroy()`

---

## 🛑 Strict Engineering Guidelines & API Verification

1. **NO ASSUMPTIONS OR GUESSES (CRITICAL)**:
   - Never make intuitive, logical, or estimated assumptions about method names, event payloads, library signatures, or SDK behaviors.
2. **VERIFY AGAINST REAL SOURCE & SPECS**:
   - Always inspect the actual library source code (e.g., `telegram-web-app.js`, `headbreaker.js`, `konva.js`), official protocol specs, or verify via automated browser tests before writing implementation code.
3. **AUDIT HIDDEN GUARDS & GATES**:
   - Always verify internal version checks, WebKit/Safari restrictions, and silent failure branches in external SDKs.
4. **IMAGE RENDERING & COMIC QUALITY SAFEGUARD**:
   - All comic canvases and images must strictly use `image-rendering: auto !important` and `gl.LINEAR` texture filtering. Never apply `image-rendering: pixelated` to comic artwork (neither in veiled/hidden state nor in revealed state).

---

## 🚀 Git & GitHub Workflow (STRICT CRITICAL RULES)

- ⛔ **ZERO TOLERANCE FOR AUTO-COMMITS & AUTO-PUSH**:
   - **NEVER** run `git commit` and **NEVER** run `git push` without an explicit, direct command from the user in their current prompt (e.g., "commit this", "push to github", "make a commit").
   - All file modifications, tests, and refactors MUST stay in the local working directory until the user explicitly requests a Git commit or push.
- **Default Branch**: Strictly use `main` for all pushes (never `master`).
- **Remote Origin**: Configured with Personal Access Token (PAT) for automated non-interactive deployment.
- **Push Command**: `git push origin main` (execute ONLY when user explicitly asks).

---

## 📝 How to Add / Modify Chapters (Editing `storyData.js`)

To add or edit story content, modify **`js/storyData.js` ONLY**. Engine files never need changes.

### 1. Linear Dialogue Chapter (Character Avatars)
```javascript
{
  id: 'chapter_id', num: 1, title: 'Title', ico: '📱', loc: 'Location',
  chars: ['gala', 'lydia'], bg: 'zoe',
  lines: [
    { who: 'NARRATOR', text: 'Story intro...' },
    { who: 'GALA', text: 'Hello!' }
  ]
}
```

### 2. Branching Dialogue with Choices
```javascript
lines: [
  { who: 'NARRATOR', text: 'Make a choice...', choice: true,
    choices: [
      { text: 'Option A', next: 'branch_a' },
      { text: 'Option B', next: 'branch_b' }
    ]
  },
  { who: 'NARRATOR', text: 'Resume common storyline...' }
],
branches: {
  branch_a: [ { who: 'GALA', text: 'Path A response...' } ],
  branch_b: [ { who: 'GALA', text: 'Path B response...' } ]
}
```

### 3. Comic Chapter with Vanilla WebGL Pixel Dissolve
```javascript
{
  id: 'heidelberg', num: 2, title: 'Meeting in', ico: '🏰', loc: 'Heidelberg',
  comic: 'assets/comic_heidelberg.jpg',
  chars: ['gala', 'lydia'], bg: 'heidelberg',
  lines: [
    { who: 'NARRATOR', text: 'Story begins...', panel: 0 },
    { who: 'NARRATOR', text: 'Next moment...', panel: 1 },
    { who: 'GALA', text: 'Dialogue line...', panel: 2 }
  ],
  chat: true,
  chatLines: [ ... ]
}
```

### 4. Jigsaw Puzzle Chapter
```javascript
{
  id: 'ch1_puzzle', num: '1b', title: 'Puzzle Title', ico: '🧩', loc: 'Photo Puzzle',
  type: 'puzzle', image: 'assets/ch1_puzzle.jpg',
  grid: { cols: 4, rows: 3 }
}
```

---

## ⚠️ Headbreaker Library Critical Rules
- **Vector Format**: Always pass `{ x: width, y: height }` (never `{ width, height }`).
- **Connection Dragging**: Must call `hbCanvas.puzzle.forceConnectionWhileDragging()` so connected clusters never detach during movement.
- **Validation**: Use `hbCanvas.attachSolvedValidator()` and `hbCanvas.onValid(() => ...)`.
