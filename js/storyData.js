/* ═══════════════════════════════════════
   STORY DATA
   Owns: BG (per-chapter background gradient/decor/label) and CHAPTERS
   (the whole chapter list — dialogue lines, choices, chat minigame lines,
   or type:'puzzle' + grid/image for a puzzle chapter).
   Exports (globals): BG, CHAPTERS
   Depends on: nothing — pure content, no logic
   Used by: core.js (buildMap), quest.js (startChapter), puzzle.js (start)
   Editing the STORY (text/branching/which chapters exist) only ever
   touches this file — it never needs the engine files below to change.
═══════════════════════════════════════ */
const BG = {
  zoe:{bg:'linear-gradient(160deg,#080d20,#0d1f40)',deco:'📱💫🌙',lbl:'📱 ZOE APP — Where It Started'},
  heidelberg:{bg:'linear-gradient(160deg,#150a25,#2a1550)',deco:'🏰🌸🌃',lbl:'🏰 Heidelberg, Germany'},
  stockholm:{bg:'linear-gradient(160deg,#0a1525,#152035)',deco:'🇸🇪❄️🌊',lbl:'🇸🇪 Stockholm, Sweden'},
  kyiv:{bg:'linear-gradient(160deg,#0f1a12,#182a1e)',deco:'🌻🐾🏠',lbl:'🇺🇦 Kyiv — Lydia\'s Apartment'},
  frankfurt:{bg:'linear-gradient(160deg,#15100a,#25180e)',deco:'🌉🏨<ctrl42>',lbl:'🇩🇪 Frankfurt & Stuttgart'},
  chat:{bg:'linear-gradient(160deg,#0a0a18,#14142a)',deco:'💬💕📲',lbl:'💬 The Three — Group Chat'},
  puzzle:{bg:'linear-gradient(160deg,#1b0e29,#2d123d)',deco:'🧩✨💕',lbl:'🧩 Photo Puzzle — 24 Pieces'}
};

/* ═══════════════════════════════════════
   CHAPTERS DATA
═══════════════════════════════════════ */
const CHAPTERS = [
{
  id:'zoe', num:1, title:'The Match', ico:'📱', loc:'ZOE App',
  chars:['gala','lydia'],
  bg:'zoe',
  lines:[
    {who:'NARRATOR',text:'It all started on a dating app called ZOE...'},
    {who:'NARRATOR',text:'Gala was curious. She made a profile, browsed a little...'},
    {who:'GALA',text:'*scrolling* Oh wow... she\'s beautiful...'},
    {who:'NARRATOR',text:'A blonde girl with grey eyes and a playful smile caught her attention.'},
    {who:'GALA',text:'*types nervously* Hi there! Your photos are stunning... 😊'},
    {who:'LYDIA',text:'*looks at message* Oh! She seems sweet... ❤️'},
    {who:'LYDIA',text:'Hi! Thanks so much 😊 You have a really warm face!'},
    {who:'GALA',text:'I\'m Gala, from Germany... this is new for me haha 😅'},
    {who:'LYDIA',text:'I\'m Lydia, from Kyiv 🇺🇦 Don\'t be nervous, I don\'t bite 😄'},
    {who:'NARRATOR',text:'They talked for hours. Something special was already growing...'},
    {who:'GALA',text:'Hey... would you ever come to Germany?'},
    {who:'LYDIA',text:'*smiles* For you? Maybe... 💕'},
    {who:'NARRATOR',text:'A trip was planned. Heidelberg awaited.'},
  ],
  chat:true,
  chatLines:[
    {who:'gala',text:'I keep thinking about you 💕',hidden:true,answer:'gala'},
    {who:'lydia',text:'When does your train arrive?? 🚂',hidden:true,answer:'lydia'},
    {who:'gala',text:'I\'m nervous but excited omg',hidden:false,answer:'gala'},
    {who:'lydia',text:'Same... I packed 3 different outfits 😅',hidden:true,answer:'lydia'},
  ]
},
{
  id:'ch1_puzzle', num:'1b', title:'The Match Puzzle', ico:'🧩', loc:'Photo Puzzle',
  type:'puzzle',
  image:'assets/ch1_puzzle.jpg',
  grid:{ cols:4, rows:4 }
},
{
  id:'heidelberg', num:2, title:'First Meeting', ico:'🏰', loc:'Heidelberg',
  chars:['gala','lydia'],
  bg:'heidelberg',
  lines:[
    {who:'NARRATOR',text:'Heidelberg. A city of cobblestones, a castle on the hill, and golden evening light.'},
    {who:'NARRATOR',text:'Lydia arrived at the hotel. Gala was already waiting in the lobby.'},
    {who:'GALA',text:'*sees Lydia* Oh my god you\'re even prettier in person! 😍'},
    {who:'LYDIA',text:'*laughs* Stop it! So are you! Come here!'},
    {who:'NARRATOR',text:'They hugged like they had known each other for years.'},
    {who:'LYDIA',text:'This city is so beautiful...'},
    {who:'GALA',text:'I know the best spots. Shall we walk?'},
    {who:'NARRATOR',text:'They walked along the Neckar river as the sun went down...'},
    {who:'LYDIA',text:'Gala... I\'m really glad I came.'},
    {who:'GALA',text:'*squeezes her hand* Me too, Lida. Me too.'},
    {
      who:'NARRATOR',
      text:'Later that evening, Gala has a decision...',
      choice:true,
      choices:[
        {text:'Tell Lydia about Man',next:'tell'},
        {text:'Keep it for later...',next:'later'}
      ]
    },
    {who:'GALA',text:'You know... I have a husband. His name is Man. And he\'s wonderful.',hidden:'later'},
    {who:'LYDIA',text:'Oh! *blinks* And he knows you\'re here?',hidden:'later'},
    {who:'GALA',text:'Not yet... but I\'ll tell him. I promise.',hidden:'later'},
    {who:'NARRATOR',text:'The evening ended with laughter and a stolen kiss goodnight...'},
  ],
  chat:true,
  chatLines:[
    {who:'gala',text:'She\'s even better in real life 😍',hidden:true,answer:'gala'},
    {who:'lydia',text:'Heidelberg castle at night... magical ✨',hidden:true,answer:'lydia'},
    {who:'gala',text:'Already miss her and she just left 🥺',hidden:true,answer:'gala'},
    {who:'lydia',text:'I left my sunglasses in the hotel lobby lol',hidden:false,answer:'lydia'},
  ]
},
{
  id:'stockholm', num:3, title:'Stockholm Surprise', ico:'🇸🇪', loc:'Stockholm',
  chars:['gala','lydia'],
  bg:'stockholm',
  lines:[
    {who:'NARRATOR',text:'Months passed. Messages flowed daily between Kyiv and Germany.'},
    {who:'NARRATOR',text:'Man had noticed Gala\'s distant smile... the glow on her face when her phone buzzed.'},
    {who:'MAN',text:'*finds the messages* ...Who is Lydia?'},
    {who:'NARRATOR',text:'At first, anger. Then curiosity. He asked Gala to show him her photos.'},
    {who:'MAN',text:'She\'s... wow. Tell me about her.'},
    {who:'GALA',text:'*surprised* You\'re not angry?'},
    {who:'MAN',text:'I was. Now I\'m just... fascinated. By both of you. 😊'},
    {who:'NARRATOR',text:'Stockholm. A new chapter. Gala flew to meet Lydia again.'},
    {who:'LYDIA',text:'*at the harbour* This city feels like a fairytale!'},
    {who:'GALA',text:'Man says hi, by the way...'},
    {who:'LYDIA',text:'*laughs* Does he now? 😏'},
    {who:'GALA',text:'He wants to video call... if you\'re okay with it?'},
    {who:'LYDIA',text:'*smiles slowly* ...Sure. Let\'s call him.'},
    {who:'NARRATOR',text:'And just like that — three strangers became something more.'},
  ],
  chat:true,
  chatLines:[
    {who:'man',text:'Stockholm photos look amazing, both of you 😍',hidden:true,answer:'man'},
    {who:'lydia',text:'Your husband is actually really sweet 💙',hidden:true,answer:'lydia'},
    {who:'gala',text:'I can\'t believe this is my life lol 😄',hidden:true,answer:'gala'},
    {who:'man',text:'When do I get to actually meet her?? 😅',hidden:false,answer:'man'},
  ]
},
{
  id:'kyiv', num:4, title:'Home in Kyiv', ico:'🇺🇦', loc:'Kyiv',
  chars:['gala','lydia'],
  bg:'kyiv',
  isMinigame:true,
  lines:[
    {who:'NARRATOR',text:'Gala visited Kyiv. Lydia\'s apartment — white walls, blue accents, soft grey light.'},
    {who:'LYDIA',text:'Welcome to my place! *a little dog runs in*'},
    {who:'GALA',text:'OHHH who is THIS? 🐾'},
    {who:'LYDIA',text:'That\'s my baby. Say hi!'},
    {who:'NARRATOR',text:'They cooked together, walked through Kyiv, visited a museum...'},
    {who:'GALA',text:'Your city is so beautiful, Lida. I understand why you love it.'},
    {who:'LYDIA',text:'It\'s home. Even now. *looks out the window*'},
    {who:'NARRATOR',text:'That evening — the group chat was very active...'},
    {who:'NARRATOR',text:'Now — a special challenge! Guess who sent each message! 🎮'},
  ],
  chat:true,
  chatLines:[
    {who:'man',text:'How\'s my favourite Ukrainian? 😊',hidden:true,answer:'man'},
    {who:'lydia',text:'Gala just ate my entire pasta dish 😤',hidden:true,answer:'lydia'},
    {who:'gala',text:'IT WAS DELICIOUS IN MY DEFENSE 🍝',hidden:false,answer:'gala'},
    {who:'man',text:'Send photos of the dog IMMEDIATELY',hidden:true,answer:'man'},
    {who:'lydia',text:'You two are chaos 😂',hidden:true,answer:'lydia'},
    {who:'gala',text:'Miss you here babe ❤️',hidden:true,answer:'man'},
    {who:'lydia',text:'Next time Man comes too. Final answer.',hidden:true,answer:'lydia'},
  ]
},
{
  id:'frankfurt', num:5, title:'All Three Together', ico:'🌉', loc:'Frankfurt & Stuttgart',
  chars:['man','gala','lydia'],
  bg:'frankfurt',
  lines:[
    {who:'NARRATOR',text:'Winter. Frankfurt. The moment everyone had been waiting for.'},
    {who:'NARRATOR',text:'Lydia stepped off the train. Man saw her for the first time in person.'},
    {who:'MAN',text:'*quietly* Hi, Lydia.'},
    {who:'LYDIA',text:'*smiles* Hi, Man. I\'ve heard so much about you.'},
    {who:'GALA',text:'*beaming* And now we\'re all HERE! 🥹'},
    {who:'NARRATOR',text:'Three people who found each other by accident... and chose to stay.'},
    {who:'LYDIA',text:'*looks at both of them* I still can\'t believe this is real.'},
    {who:'MAN',text:'It is. All of it.'},
    {who:'NARRATOR',text:'A few days later — Stuttgart. Another hotel, another adventure.'},
    {who:'GALA',text:'*laughing over dinner* We need to do this every season!'},
    {who:'LYDIA',text:'I volunteer for summer in Kyiv 🌻'},
    {who:'MAN',text:'And somewhere new in winter... maybe Paris?'},
    {who:'LYDIA',text:'*looks at both* You know... I\'m really happy.'},
    {who:'GALA',text:'We are too, Lida. We really are. ❤️'},
    {who:'NARRATOR',text:'Every day — messages, laughs, plans. Three hearts in three cities, together.'},
  ],
  chat:false,
},
{
  id:'chat', num:6, title:'Daily Magic', ico:'💬', loc:'The Group Chat',
  chars:['man','gala','lydia'],
  bg:'chat',
  isMinigame:true,
  lines:[
    {who:'NARRATOR',text:'Every single day — morning messages, jokes, photos, good nights...'},
    {who:'NARRATOR',text:'Three people, three cities, one chat window. ❤️'},
    {who:'NARRATOR',text:'Now for the FINAL CHALLENGE — the ultimate chat quiz! 🎮'},
  ],
  chat:true,
  chatLines:[
    {who:'lydia',text:'Good morning from Kyiv ☀️ Coffee time',hidden:true,answer:'lydia'},
    {who:'man',text:'Good morning beautiful ❤️',hidden:true,answer:'man'},
    {who:'gala',text:'It\'s 7am and you two are already ??? 😤',hidden:true,answer:'gala'},
    {who:'lydia',text:'Who ate the last ramen I was saving??',hidden:true,answer:'lydia'},
    {who:'man',text:'...I plead the fifth 😇',hidden:false,answer:'man'},
    {who:'gala',text:'HE CONFESSED OMFG 😂',hidden:true,answer:'gala'},
    {who:'lydia',text:'Book the flights already!! 🛫',hidden:true,answer:'lydia'},
    {who:'gala',text:'Done. March. We\'re coming to you 🇺🇦💕',hidden:true,answer:'gala'},
    {who:'man',text:'Lydia you\'re our favourite Ukrainian. Don\'t tell anyone.',hidden:true,answer:'man'},
    {who:'lydia',text:'*sends 47 heart emojis*',hidden:true,answer:'lydia'},
  ]
}
];
