/* ═══════════════════════════════════════
   8-BIT WEB AUDIO API SYNTHESIZER
   Retro chiptune SFX and BGM generator.
   Exports (globals): SoundEngine (playClick, playTypewriter, playCorrect,
   playWrong, playFanfare, startBGM, stopBGM, toggleMute, isMuted,
   updateHudIcon, init)
   Depends on: nothing (self-initializes at the bottom of this file)
   Used by: core.js, quest.js, chat.js, puzzle.js — every module that plays
   a sound or touches the mute button goes through this one.
═══════════════════════════════════════ */

const SoundEngine = (function() {
  let ctx = null;
  let muted = localStorage.getItem('game_audio_muted') === 'true';
  let bgmInterval = null;
  let bgmStep = 0;

  function initCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function playTone(freq, type, duration, gainVal = 0.1, fadeOut = true) {
    if (muted) return;
    initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      if (fadeOut) {
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback safety
    }
  }

  // 8-bit Chiptune Background Melody Notes (Frequencies in Hz)
  const bgmNotes = [
    261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
    349.23, 440.00, 523.25, 698.46, // F4, A4, C5, F5
    392.00, 493.88, 587.33, 783.99, // G4, B4, D5, G5
    329.63, 392.00, 523.25, 659.25  // E4, G4, C5, E5
  ];

  return {
    init: function() {
      // Enable Web Audio & BGM on initial user interaction (click, tap, touch)
      const enableAudio = () => {
        initCtx();
        if (!muted) {
          SoundEngine.startBGM();
        }
        window.removeEventListener('click', enableAudio);
        window.removeEventListener('keydown', enableAudio);
        window.removeEventListener('touchstart', enableAudio);
        window.removeEventListener('pointerdown', enableAudio);
      };
      window.addEventListener('click', enableAudio);
      window.addEventListener('keydown', enableAudio);
      window.addEventListener('touchstart', enableAudio, { passive: true });
      window.addEventListener('pointerdown', enableAudio);
    },

    isMuted: function() {
      return muted;
    },

    toggleMute: function() {
      muted = !muted;
      localStorage.setItem('game_audio_muted', muted);
      if (muted) {
        this.stopBGM();
      } else {
        initCtx();
        this.startBGM();
      }
      this.updateHudIcon();
      return muted;
    },

    updateHudIcon: function() {
      const btn = document.getElementById('hud-sound-btn');
      if (btn) {
        btn.textContent = muted ? '🔇' : '🔊';
        btn.title = muted ? 'Unmute Audio' : 'Mute Audio';
      }
    },

    // --- SFX METHODS ---

    // Typewriter text tick sound
    playTypewriter: function() {
      if (muted) return;
      const pitch = 580 + Math.random() * 80;
      playTone(pitch, 'square', 0.025, 0.02);
    },

    // Button click tone
    playClick: function() {
      if (window.HapticEngine) {
        try { HapticEngine.impact('light'); } catch(e) {}
      }
      if (muted) return;
      initCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch(e) {}
    },

    // Correct answer arpeggio (C5 -> E5 -> G5 -> C6)
    playCorrect: function() {
      if (window.HapticEngine) {
        try { HapticEngine.impact('medium'); } catch(e) {}
      }
      if (muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playTone(freq, 'triangle', 0.08, 0.08);
        }, idx * 60);
      });
    },

    // Wrong answer buzzer
    playWrong: function() {
      if (window.HapticEngine) {
        try { HapticEngine.notification('error'); } catch(e) {}
      }
      if (muted) return;
      initCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.18);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } catch(e) {}
    },

    // Chapter / Game complete victory fanfare
    playFanfare: function() {
      if (window.HapticEngine) {
        try { HapticEngine.victory(); } catch(e) {}
      }
      if (muted) return;
      const melody = [
        { f: 523.25, d: 0.1, t: 0 },
        { f: 659.25, d: 0.1, t: 100 },
        { f: 783.99, d: 0.1, t: 200 },
        { f: 1046.50, d: 0.3, t: 300 },
        { f: 880.00, d: 0.1, t: 550 },
        { f: 1046.50, d: 0.4, t: 680 }
      ];
      melody.forEach(n => {
        setTimeout(() => {
          playTone(n.f, 'square', n.d, 0.09);
        }, n.t);
      });
    },

    // --- BGM SYNTHESIZER ---

    startBGM: function() {
      if (bgmInterval || muted) return;
      initCtx();
      bgmStep = 0;
      bgmInterval = setInterval(() => {
        if (muted) return;
        const note = bgmNotes[bgmStep % bgmNotes.length];
        playTone(note, 'triangle', 0.18, 0.02, true);
        bgmStep++;
      }, 350);
    },

    stopBGM: function() {
      if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
      }
    },

    pauseBGM: function() {
      if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
      }
      if (ctx && ctx.state === 'running') {
        try { ctx.suspend(); } catch(e) {}
      }
    },

    resumeBGM: function() {
      if (ctx && ctx.state === 'suspended' && !muted) {
        try { ctx.resume(); } catch(e) {}
      }
      if (!muted && !bgmInterval) {
        this.startBGM();
      }
    }
  };
})();

// Auto-initialize audio listeners
SoundEngine.init();
