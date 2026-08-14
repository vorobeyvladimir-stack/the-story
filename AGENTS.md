# AGENTS.md — AI & Developer Architecture Guide

Compact architectural reference and codebase guide for AI assistants and developers.

## 🏗️ Architecture & Module Contracts

The game is a modular vanilla JS/CSS web game designed for Telegram WebApps and mobile browsers.

```
/
├── assets/          # Static PNG sprites & puzzle photos (man.png, gala.png, lydia.png, ch1_puzzle.jpg)
├── css/             # Componentized stylesheets (base, title, map, scene, chat, puzzle, ending)
├── js/
│   ├── audio.js     # SoundEngine: 8-bit Web Audio API synthesizer & sound effects
│   ├── characters.js# SVG: Character sprite markup mapping ('man', 'gala', 'lydia')
│   ├── storyData.js # BG & CHAPTERS data: Pure content (dialogue, choices, chat quiz, puzzle grids)
│   ├── lib/         # Third-party dependencies: konva.min.js & headbreaker.js
│   ├── puzzle.js    # PuzzleGame: Headbreaker jigsaw engine with directional adjacency checks
│   ├── core.js      # CoreEngine & Game: State management, screen transitions, chapter lifecycle
│   ├── quest.js     # QuestEngine: Visual novel dialogue engine with typewriter & branching
│   ├── chat.js      # ChatEngine: Telegram group chat quiz minigame
│   └── main.js      # Page bootstrapping and Telegram WebApp integration
├── index.html       # HTML entry point loading modular CSS and scripts
└── AGENTS.md        # This AI context file
```

---

## 🔄 Screen Lifecycle & Game State

```
s-title (Title) ──▶ s-map (Chapter Select)
                         │
                         ├──▶ ch.type === 'puzzle'  ──▶ s-puzzle (Jigsaw) ──▶ completeChapter
                         │
                         └──▶ Visual Novel Chapter ──▶ s-scene (Dialogue)
                                                             │
                                                             ├── (if ch.chat) ──▶ s-chat (Quiz) ──▶ completeChapter
                                                             └── (no chat)   ──▶ completeChapter
                                                                                     │
                                  All chapters complete? ─── YES ────────────────────┴──▶ s-end (Ending)
                                                         └─── NO  ───────────────────────▶ s-map (Next Chapter)
```

### Global Namespace: `window.Game`
- `Game.state`: `{ currentCh, completed: Set<string>, chatScore: number, chatTotal: number }`
- `Game.core`: `show(id)`, `buildMap()`, `completeChapter(ch)`, `resetState()`, `replayGame()`
- `Game.quest`: `startChapter(ch)`, `nextLine()`, `showLine(line)`, `pickChoice(branchId)`
- `Game.chat`: `startChat(ch)`, `endChat()`
- `Game.puzzle`: `start(ch)`, `togglePreview()`
- `Game.audio`: `SoundEngine` (`playClick()`, `playTypewriter()`, `playCorrect()`, `playWrong()`, `playFanfare()`)

---

## 📝 How to Add / Modify Chapters (Editing `storyData.js`)

To add or edit story content, modify **`js/storyData.js` ONLY**. Engine files never need changes.

1. **Linear Dialogue Chapter**:
   ```javascript
   {
     id: 'chapter_id', num: 1, title: 'Title', ico: '🌟', loc: 'Location',
     chars: ['gala', 'lydia'], bg: 'zoe',
     lines: [
       { who: 'NARRATOR', text: 'Story intro...' },
       { who: 'GALA', text: 'Hello!' }
     ]
   }
   ```

2. **Branching Dialogue with Choices**:
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

3. **Puzzle Chapter**:
   ```javascript
   {
     id: 'ch1_puzzle', num: '1b', title: 'Puzzle Title', ico: '🧩', loc: 'Photo Puzzle',
     type: 'puzzle', image: 'assets/ch1_puzzle.jpg',
     grid: { cols: 4, rows: 3 }
   }
   ```

---

## ⚠️ Headbreaker Library Critical Rules
- **Vector format**: Always pass `{ x: width, y: height }` (never `{ width, height }`).
- **Connection Dragging**: Must call `hbCanvas.puzzle.forceConnectionWhileDragging()` so clusters never detach.
- **Validation**: Use `hbCanvas.attachSolvedValidator()` and `hbCanvas.onValid(() => ...)`.
