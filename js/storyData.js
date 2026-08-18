/* ═══════════════════════════════════════
   STORY DATA
   Owns: BG (per-chapter background gradient/decor/label) and CHAPTERS
   (the whole chapter list — dialogue lines, branching nodes, chat minigame lines,
   or type:'puzzle' + grid/image for a puzzle chapter).
   Exports (globals): BG, CHAPTERS
   Depends on: nothing — pure content, no logic
   Used by: core.js (buildMap), quest.js (startChapter), puzzle.js (start)
═══════════════════════════════════════ */

/**
 * @typedef {Object} DialogueChoice
 * @property {string} text - Button label shown to the player
 * @property {string} next - Target branch identifier in chapter.branches
 */

/**
 * @typedef {Object} DialogueLine
 * @property {string} who - Speaker name ('NARRATOR' | 'MAN' | 'GALA' | 'LYDIA')
 * @property {string} text - Dialogue message text
 * @property {boolean} [choice] - Whether this line opens a choice menu
 * @property {DialogueChoice[]} [choices] - Array of selectable choices
 */

/**
 * @typedef {Object} ChatQuizLine
 * @property {string} who - Sender name ('man' | 'gala' | 'lydia')
 * @property {string} text - Message text
 * @property {boolean} hidden - If true, player must guess the sender
 * @property {string} answer - Correct sender key ('man' | 'gala' | 'lydia')
 */

/**
 * @typedef {Object} Chapter
 * @property {string} id - Unique chapter ID
 * @property {number | string} num - Display chapter number
 * @property {string} title - Chapter title
 * @property {string} ico - Emoji icon for map card
 * @property {string} loc - Short location name
 * @property {string} [type] - Chapter type ('puzzle' or omitted for visual novel)
 * @property {string} [bg] - Key in BG object
 * @property {string[]} [chars] - Active character keys shown on screen
 * @property {DialogueLine[]} [lines] - Sequential dialogue lines
 * @property {Record<string, DialogueLine[]>} [branches] - Named branching dialogue paths
 * @property {boolean} [chat] - Whether a chat quiz follows the dialogue
 * @property {ChatQuizLine[]} [chatLines] - Chat quiz messages
 * @property {string} [image] - Image path for puzzle chapters
 * @property {{ cols: number, rows: number }} [grid] - Puzzle grid dimensions
 */

/** @type {Record<string, { bg: string, deco: string, lbl: string }>} */
const BG = {
  zoe: { bg: 'linear-gradient(160deg,#080d20,#0d1f40)', deco: '📱💫🌙', lbl: '📱 ZOE APP — Where It Started' },
  heidelberg: { bg: 'linear-gradient(160deg,#150a25,#2a1550)', deco: '🏰🌸🌃', lbl: '🏰 Heidelberg, Germany' },
  stockholm: { bg: 'linear-gradient(160deg,#0a1525,#152035)', deco: '🇸🇪❄️🌊', lbl: '🇸🇪 Stockholm, Sweden' },
  kyiv: { bg: 'linear-gradient(160deg,#0f1a12,#182a1e)', deco: '🌻🐾🏠', lbl: "🇺🇦 Kyiv — Lydia's Apartment" },
  frankfurt: { bg: 'linear-gradient(160deg,#15100a,#25180e)', deco: '🌉🏨🥂', lbl: '🇩🇪 Frankfurt & Stuttgart' },
  chat: { bg: 'linear-gradient(160deg,#0a0a18,#14142a)', deco: '💬💕📲', lbl: '💬 The Three — Group Chat' }
};

/** @type {Chapter[]} */
const CHAPTERS = [
  {
    id: 'zoe',
    num: 1,
    title: 'The Match',
    ico: '📱',
    loc: 'ZOE App',
    chars: ['gala', 'lydia'],
    bg: 'zoe',
    lines: [
      { who: 'NARRATOR', text: 'Lydia arrived in Heidelberg on a rainy afternoon, carrying a small suitcase and a much bigger secret.' },
      { who: 'NARRATOR', text: 'They met in the city center. For one suspended moment, the noise of the streets seemed to disappear.' },
      { who: 'GALA', text: '*smiling* So... you really came.' },
      { who: 'LYDIA', text: '*looking her up and down* I told you I might.' },
      { who: 'GALA', text: 'You look even more dangerous in person.' },
      { who: 'LYDIA', text: 'And you look like trouble I should have prepared for.' },
      { who: 'NARRATOR', text: 'One look was enough. The attraction between them was immediate, unmistakable... and becoming very difficult to ignore.' },
      { who: 'GALA', text: 'Coffee first?' },
      { who: 'LYDIA', text: 'Coffee. Definitely coffee.' },
      { who: 'NARRATOR', text: 'They found a cozy restaurant and tried to behave like two perfectly ordinary women meeting for the first time.' },
      { who: 'GALA', text: 'You keep staring at me.' },
      { who: 'LYDIA', text: 'I’m trying to decide whether you’re more beautiful when you smile or when you pretend to be innocent.' },
      { who: 'GALA', text: 'That sounds like a dangerous decision.' },
      { who: 'LYDIA', text: 'I’ve already made it.' },
      { who: 'NARRATOR', text: 'The coffee disappeared quickly. Their excuses disappeared even faster.' },
      { who: 'NARRATOR', text: 'Soon, they were walking toward Lydia’s hotel room...' },
      { who: 'LYDIA', text: 'Are you always this confident?' },
      { who: 'GALA', text: 'Only when I’m absolutely sure.' },
      { who: 'LYDIA', text: 'And what are you absolutely sure about?' },
      { who: 'GALA', text: 'That you want me here.' },
      { who: 'LYDIA', text: '*after a pause* I do.' },
      { who: 'NARRATOR', text: 'The moment the door closed behind them, the city was left outside.' },
      { who: 'GALA', text: 'You can relax now. No more pretending.' },
      { who: 'LYDIA', text: 'I’m not sure I remember how.' },
      { who: 'GALA', text: 'Then let me remind you.' },
      { who: 'NARRATOR', text: 'Gala reached for her hand, giving Lydia every chance to change her mind. Lydia answered by stepping closer.' },
      { who: 'LYDIA', text: 'You’re very persistent.' },
      { who: 'GALA', text: 'Only when the answer is worth waiting for.' },
      { who: 'NARRATOR', text: 'Lydia stripped off all her clothes, starting with her dress and down to her panties' },
      { who: 'LYDIA', text: 'I don’t think I want you to wait.' },
      { who: 'NARRATOR', text: 'Their first kiss was soft. The second one was not.' },
      { who: 'NARRATOR', text: 'Laughter, whispered promises and lingering kisses filled the room ...' },
      { who: 'LYDIA', text: '*breathless* You planned this, didn’t you?' },
      { who: 'GALA', text: 'I planned the coffee. The rest is your fault.' },
      { who: 'LYDIA', text: 'My fault?' },
      { who: 'GALA', text: 'You looked at me first.' },
      { who: 'NARRATOR', text: 'Later, they moved toward the shower no longer interested in keeping their distance.' },
      { who: 'LYDIA', text: 'I’ve never done anything like this before.' },
      { who: 'GALA', text: 'Then we’ll take it slowly.' },
      { who: 'LYDIA', text: 'Slowly?' },
      { who: 'GALA', text: 'Unless you ask for something else.' },
      { who: 'LYDIA', text: '*smiles* I might.' },
      { who: 'NARRATOR', text: 'Behind the steamed-up glass, Lydia discovered a side of herself she had never dared to explore.' },
      { who: 'NARRATOR', text: 'And judging by the smile on her face, she had no intention of forgetting it.' },
      { who: 'NARRATOR', text: 'What happened next stayed between them, the warm water... and something far more interesting' }
    ],
    chat: true,
    chatLines: [
      { who: 'lydia', text: 'I thought I was ready for Heidelberg... I wasn’t ready for her. 😏', hidden: true, answer: 'lydia' },
      { who: 'gala', text: 'She asked whether I was sure. I told her I was... then I waited for her answer. 😉', hidden: true, answer: 'gala' },
      { who: 'lydia', text: 'I think I left my last bit of hesitation somewhere between the hotel door and the shower. 🙈❤️', hidden: true, answer: 'lydia' },
      { who: 'gala', text: 'Some memories belong to the city. Others belong behind a closed door. 😏', hidden: true, answer: 'gala' },
      { who: 'gala', text: 'By the time the coffee arrived, neither of us was thinking about coffee anymore. ☕😉', hidden: true, answer: 'gala' },
      { who: 'lydia', text: 'I thought undressing in front of a girl would be easier... but taking off my underwear was a whole different story. 🙈', hidden: true, answer: 'lydia' },
      { who: 'lydia', text: 'Let’s just say the shower was much warmer than the coffee. 🔥', hidden: true, answer: 'lydia' }
    ]
  },
  {
    id: 'ch1_puzzle',
    num: '1b',
    title: 'The Match Puzzle',
    ico: '🧩',
    loc: 'Photo Puzzle',
    type: 'puzzle',
    image: 'assets/ch1_puzzle.jpg',
    grid: { cols: 4, rows: 3 } // 12 pieces (photo natural size: 858x854 px, ~1:1 square)
  },
  {
    id: 'heidelberg',
    num: 2,
    title: 'First Meeting',
    ico: '🏰',
    loc: 'Heidelberg',
    chars: ['gala', 'lydia'],
    bg: 'heidelberg',
    lines: [
      { who: 'NARRATOR', text: 'Heidelberg. A city of cobblestones, a castle on the hill, and golden evening light.' },
      { who: 'NARRATOR', text: 'Lydia arrived at the hotel. Gala was already waiting in the lobby.' },
      { who: 'GALA', text: "*sees Lydia* Oh my god you're even prettier in person! 😍" },
      { who: 'LYDIA', text: '*laughs* Stop it! So are you! Come here!' },
      { who: 'NARRATOR', text: 'They hugged like they had known each other for years.' },
      { who: 'LYDIA', text: 'This city is so beautiful...' },
      { who: 'GALA', text: 'I know the best spots. Shall we walk?' },
      { who: 'NARRATOR', text: 'They walked along the Neckar river as the sun went down...' },
      { who: 'LYDIA', text: "Gala... I'm really glad I came." },
      { who: 'GALA', text: '*squeezes her hand* Me too, Lida. Me too.' },
      {
        who: 'NARRATOR',
        text: 'Later that evening, Gala has a decision...',
        choice: true,
        choices: [
          { text: 'Tell Lydia about VVV', next: 'tell' },
          { text: 'Keep it for later...', next: 'later' }
        ]
      },
      { who: 'NARRATOR', text: 'The evening ended with laughter and a stolen kiss goodnight...' }
    ],
    branches: {
      tell: [
        { who: 'GALA', text: 'You know... I have a husband. His name is VVV. And he\'s wonderful.' },
        { who: 'LYDIA', text: 'Oh! *blinks* And he knows you\'re here?' },
        { who: 'GALA', text: 'Not yet... but I\'ll tell him. I promise.' }
      ],
      later: [
        { who: 'GALA', text: '*gazes at the river* There\'s so much I want to share with you... step by step.' },
        { who: 'LYDIA', text: '*smiles warmly* Take your time. We have all the time in the world.' }
      ]
    },
    chat: true,
    chatLines: [
      { who: 'gala', text: "She's even better in real life 😍", hidden: true, answer: 'gala' },
      { who: 'lydia', text: 'Heidelberg castle at night... magical ✨', hidden: true, answer: 'lydia' },
      { who: 'gala', text: 'Already miss her and she just left 🥺', hidden: true, answer: 'gala' },
      { who: 'lydia', text: 'I left my sunglasses in the hotel lobby lol', hidden: false, answer: 'lydia' }
    ]
  },
  {
    id: 'stockholm',
    num: 3,
    title: 'Stockholm Surprise',
    ico: '🇸🇪',
    loc: 'Stockholm',
    chars: ['gala', 'lydia'],
    bg: 'stockholm',
    lines: [
      { who: 'NARRATOR', text: 'Months passed. Messages flowed daily between Kyiv and Germany.' },
      { who: 'NARRATOR', text: "VVV had noticed Gala's distant smile... the glow on her face when her phone buzzed." },
      { who: 'VVV', text: '*finds the messages* ...Who is Lydia?' },
      { who: 'NARRATOR', text: 'At first, anger. Then curiosity. He asked Gala to show him her photos.' },
      { who: 'VVV', text: "She's... wow. Tell me about her." },
      { who: 'GALA', text: "*surprised* You're not angry?" },
      { who: 'VVV', text: "I was. Now I'm just... fascinated. By both of you. 😊" },
      { who: 'NARRATOR', text: 'Stockholm. A new chapter. Gala flew to meet Lydia again.' },
      { who: 'LYDIA', text: '*at the harbour* This city feels like a fairytale!' },
      { who: 'GALA', text: 'VVV says hi, by the way...' },
      { who: 'LYDIA', text: '*laughs* Does he now? 😏' },
      { who: 'GALA', text: "He wants to video call... if you're okay with it?" },
      { who: 'LYDIA', text: '*smiles slowly* ...Sure. Let\'s call him.' },
      { who: 'NARRATOR', text: 'And just like that — three strangers became something more.' }
    ],
    chat: true,
    chatLines: [
      { who: 'vvv', text: 'Stockholm photos look amazing, both of you 😍', hidden: true, answer: 'vvv' },
      { who: 'lydia', text: 'Your husband is actually really sweet 💙', hidden: true, answer: 'lydia' },
      { who: 'gala', text: "I can't believe this is my life lol 😄", hidden: true, answer: 'gala' },
      { who: 'vvv', text: 'When do I get to actually meet her?? 😅', hidden: false, answer: 'vvv' }
    ]
  },
  {
    id: 'kyiv',
    num: 4,
    title: 'Home in Kyiv',
    ico: '🇺🇦',
    loc: 'Kyiv',
    chars: ['gala', 'lydia'],
    bg: 'kyiv',
    lines: [
      { who: 'NARRATOR', text: "Gala visited Kyiv. Lydia's apartment — white walls, blue accents, soft grey light." },
      { who: 'LYDIA', text: 'Welcome to my place! *a little dog runs in*' },
      { who: 'GALA', text: 'OHHH who is THIS? 🐾' },
      { who: 'LYDIA', text: "That's my baby. Say hi!" },
      { who: 'NARRATOR', text: 'They cooked together, walked through Kyiv, visited a museum...' },
      { who: 'GALA', text: 'Your city is so beautiful, Lida. I understand why you love it.' },
      { who: 'LYDIA', text: "It's home. Even now. *looks out the window*" },
      { who: 'NARRATOR', text: 'That evening — the group chat was very active...' },
      { who: 'NARRATOR', text: 'Now — a special challenge! Guess who sent each message! 🎮' }
    ],
    chat: true,
    chatLines: [
      { who: 'vvv', text: "How's my favourite Ukrainian? 😊", hidden: true, answer: 'vvv' },
      { who: 'lydia', text: 'Gala just ate my entire pasta dish 😤', hidden: true, answer: 'lydia' },
      { who: 'gala', text: 'IT WAS DELICIOUS IN MY DEFENSE 🍝', hidden: false, answer: 'gala' },
      { who: 'vvv', text: 'Send photos of the dog IMMEDIATELY', hidden: true, answer: 'vvv' },
      { who: 'lydia', text: 'You two are chaos 😂', hidden: true, answer: 'lydia' },
      { who: 'gala', text: 'Miss you here babe ❤️', hidden: true, answer: 'gala' },
      { who: 'lydia', text: 'Next time VVV comes too. Final answer.', hidden: true, answer: 'lydia' }
    ]
  },
  {
    id: 'frankfurt',
    num: 5,
    title: 'All Three Together',
    ico: '🌉',
    loc: 'Frankfurt & Stuttgart',
    chars: ['vvv', 'gala', 'lydia'],
    bg: 'frankfurt',
    lines: [
      { who: 'NARRATOR', text: 'Winter. Frankfurt. The moment everyone had been waiting for.' },
      { who: 'NARRATOR', text: 'Lydia stepped off the train. VVV saw her for the first time in person.' },
      { who: 'VVV', text: '*quietly* Hi, Lydia.' },
      { who: 'LYDIA', text: "*smiles* Hi, VVV. I've heard so much about you." },
      { who: 'GALA', text: "*beaming* And now we're all HERE! 🥹" },
      { who: 'NARRATOR', text: 'Three people who found each other by accident... and chose to stay.' },
      { who: 'LYDIA', text: "*looks at both of them* I still can't believe this is real." },
      { who: 'VVV', text: 'It is. All of it.' },
      { who: 'NARRATOR', text: 'A few days later — Stuttgart. Another hotel, another adventure.' },
      { who: 'GALA', text: '*laughing over dinner* We need to do this every season!' },
      { who: 'LYDIA', text: 'I volunteer for summer in Kyiv 🌻' },
      { who: 'VVV', text: 'And somewhere new in winter... maybe Paris?' },
      { who: 'LYDIA', text: "*looks at both* You know... I'm really happy." },
      { who: 'GALA', text: 'We are too, Lida. We really are. ❤️' },
      { who: 'NARRATOR', text: 'Every day — messages, laughs, plans. Three hearts in three cities, together.' }
    ],
    chat: false
  },
  {
    id: 'chat',
    num: 6,
    title: 'Daily Magic',
    ico: '💬',
    loc: 'The Group Chat',
    chars: ['vvv', 'gala', 'lydia'],
    bg: 'chat',
    lines: [
      { who: 'NARRATOR', text: 'Every single day — morning messages, jokes, photos, good nights...' },
      { who: 'NARRATOR', text: 'Three people, three cities, one chat window. ❤️' },
      { who: 'NARRATOR', text: 'Now for the FINAL CHALLENGE — the ultimate chat quiz! 🎮' }
    ],
    chat: true,
    chatLines: [
      { who: 'lydia', text: 'Good morning from Kyiv ☀️ Coffee time', hidden: true, answer: 'lydia' },
      { who: 'vvv', text: 'Good morning beautiful ❤️', hidden: true, answer: 'vvv' },
      { who: 'gala', text: "It's 7am and you two are already ??? 😤", hidden: true, answer: 'gala' },
      { who: 'lydia', text: 'Who ate the last ramen I was saving??', hidden: true, answer: 'lydia' },
      { who: 'vvv', text: '...I plead the fifth 😇', hidden: false, answer: 'vvv' },
      { who: 'gala', text: 'HE CONFESSED OMFG 😂', hidden: true, answer: 'gala' },
      { who: 'lydia', text: 'Book the flights already!! 🛫', hidden: true, answer: 'lydia' },
      { who: 'gala', text: "Done. March. We're coming to you 🇺🇦💕", hidden: true, answer: 'gala' },
      { who: 'vvv', text: "Lydia you're our favourite Ukrainian. Don't tell anyone.", hidden: true, answer: 'vvv' },
      { who: 'lydia', text: '*sends 47 heart emojis*', hidden: true, answer: 'lydia' }
    ]
  }
];
