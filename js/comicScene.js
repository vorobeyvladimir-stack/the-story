/* ═══════════════════════════════════════════════════════════════
   COMIC ENGINE (PixiJS 7.x)
   Owns: Fullscreen comic presentation, panel segmentation,
   custom WebGL Pixel Dissolve Shaders, and responsive auto-framing.
   Exports (globals): ComicEngine
   ═══════════════════════════════════════════════════════════════ */

(function (window) {
  'use strict';

  // Natural resolution of the Heidelberg Comic
  const COMIC_NATURAL_W = 571;
  const COMIC_NATURAL_H = 1024;

  const HEIDELBERG_PANELS = [
    { id: 1, x: 14, y: 15, w: 356, h: 237, title: "Arrival in Heidelberg" },
    { id: 2, x: 382, y: 15, w: 175, h: 237, title: "City Center Meeting" },
    { id: 3, x: 14, y: 260, w: 178, h: 237, title: "Gala: So... you really came" },
    { id: 4, x: 202, y: 260, w: 170, h: 237, title: "Lydia: I told you I might" },
    { id: 5, x: 382, y: 260, w: 175, h: 237, title: "Dangerous in Person" },
    { id: 6, x: 14, y: 507, w: 318, h: 236, title: "Immediate Attraction" },
    { id: 7, x: 342, y: 507, w: 215, h: 236, title: "Gala: Coffee first?" },
    { id: 8, x: 14, y: 753, w: 241, h: 257, title: "Lydia: Coffee. Definitely coffee." },
    { id: 9, x: 265, y: 753, w: 292, h: 257, title: "Entering the Restaurant" }
  ];

  // Custom GLSL Fragment Shader for Pixel Dissolve Reveal
  const pixelDissolveFrag = `
    precision highp float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float uProgress;      // 0.0 (hidden) to 1.0 (revealed)
    uniform float uBlockSize;     // Pixel block size (e.g. 8.0)
    uniform vec2 uResolution;     // Panel resolution in pixels
    uniform vec4 uEdgeColor;      // Glowing edge tint (RGBA)
    uniform float uEdgeWidth;     // Width of dissolving edge
    uniform float uNoiseBias;     // Directional bias

    // High quality deterministic pseudo-random hash
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    void main(void) {
      vec4 texColor = texture2D(uSampler, vTextureCoord);
      
      if (uProgress <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
      }
      
      if (uProgress >= 1.0) {
        gl_FragColor = texColor;
        return;
      }

      vec2 pixelCoord = vTextureCoord * uResolution;
      vec2 blockCoord = floor(pixelCoord / uBlockSize);
      
      float randVal = hash(blockCoord);
      float dirFactor = (vTextureCoord.x * 0.35 + vTextureCoord.y * 0.65);
      float threshold = mix(randVal, (randVal * 0.6 + dirFactor * 0.4), uNoiseBias);

      float diff = uProgress - threshold;

      if (diff < 0.0) {
        // Pixel block has not yet dissolved in
        gl_FragColor = vec4(0.0);
      } else if (diff < uEdgeWidth) {
        // Glowing neon dissolve edge
        float edgeFactor = 1.0 - (diff / uEdgeWidth);
        vec3 glow = mix(texColor.rgb, uEdgeColor.rgb * 1.8, edgeFactor * 0.85);
        gl_FragColor = vec4(glow, texColor.a);
      } else {
        // Fully revealed pixel block
        gl_FragColor = texColor;
      }
    }
  `;

  class ComicSceneEngine {
    constructor() {
      this.app = null;
      this.containerEl = null;
      this.baseTexture = null;
      this.comicContainer = null;
      this.panels = [];
      this.activePanelIdx = -1;
      this.isInitialized = false;
      this.currentImageSrc = "";
      this.currentPanelDefs = HEIDELBERG_PANELS;
      this.resizeObserver = null;
      this.panelTweens = [];
    }

    /**
     * Initializes PixiJS Application inside the DOM container
     * @param {HTMLElement} [containerEl]
     */
    async init(containerEl) {
      if (this.isInitialized && this.app) return;
      if (!window.PIXI) {
        console.error("PixiJS not found! Ensure pixi.min.js is loaded.");
        return;
      }

      this.containerEl = containerEl || document.getElementById("comic-container");
      if (!this.containerEl) {
        console.warn("Comic container element not found.");
        return;
      }

      this.containerEl.innerHTML = "";
      const rect = this.containerEl.getBoundingClientRect();
      const initW = rect.width || window.innerWidth;
      const initH = rect.height || (window.innerHeight - 200);

      this.app = new PIXI.Application({
        width: initW,
        height: initH,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true
      });

      this.containerEl.appendChild(this.app.view);

      this._onResize = () => this.resize();
      window.addEventListener("resize", this._onResize);

      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.containerEl);
      }

      this.isInitialized = true;
    }

    /**
     * Loads comic texture and sets up panels
     * @param {string} [imageSrc]
     * @param {Array} [panelDefs]
     */
    async loadComic(imageSrc = "assets/comic_heidelberg.jpg", panelDefs = HEIDELBERG_PANELS) {
      if (!this.isInitialized) {
        await this.init();
      }

      this.currentImageSrc = imageSrc;
      this.currentPanelDefs = panelDefs;

      this.clearScene();

      try {
        let texture;
        if (PIXI.Assets && PIXI.Assets.load) {
          texture = await PIXI.Assets.load(imageSrc);
        } else {
          texture = PIXI.Texture.from(imageSrc);
          if (!texture.baseTexture.valid) {
            await new Promise(resolve => texture.baseTexture.once("loaded", resolve));
          }
        }

        this.baseTexture = texture.baseTexture;

        this.comicContainer = new PIXI.Container();
        this.comicContainer.sortableChildren = true;
        this.app.stage.addChild(this.comicContainer);

        // 1. Ghosted / Darkened Background Plate
        const bgPlate = new PIXI.Sprite(texture);
        bgPlate.width = COMIC_NATURAL_W;
        bgPlate.height = COMIC_NATURAL_H;
        bgPlate.tint = 0x1a0d28;
        bgPlate.alpha = 0.28;
        bgPlate.zIndex = 1;
        this.comicContainer.addChild(bgPlate);

        // 2. Build Panel Sprites with Pixel Dissolve Filter
        this.panels = [];

        panelDefs.forEach((pDef, idx) => {
          const rect = new PIXI.Rectangle(pDef.x, pDef.y, pDef.w, pDef.h);
          const panelTexture = new PIXI.Texture(this.baseTexture, rect);
          const panelSprite = new PIXI.Sprite(panelTexture);

          panelSprite.position.set(pDef.x, pDef.y);
          panelSprite.width = pDef.w;
          panelSprite.height = pDef.h;
          panelSprite.zIndex = 10 + idx;

          // Glowing border outline container
          const borderGlow = new PIXI.Graphics();
          borderGlow.lineStyle(2, 0x00f3ff, 0.0);
          borderGlow.drawRoundedRect(0, 0, pDef.w, pDef.h, 2);
          panelSprite.addChild(borderGlow);

          // Pixel Dissolve Filter
          const uniforms = {
            uProgress: 0.0,
            uBlockSize: 8.0,
            uResolution: [pDef.w, pDef.h],
            uEdgeColor: [1.0, 0.16, 0.61, 1.0], // Neon Pink Glow
            uEdgeWidth: 0.12,
            uNoiseBias: 0.35
          };

          const filter = new PIXI.Filter(null, pixelDissolveFrag, uniforms);
          filter.autoFit = false;
          panelSprite.filters = [filter];

          this.comicContainer.addChild(panelSprite);

          this.panels.push({
            id: pDef.id,
            def: pDef,
            sprite: panelSprite,
            borderGlow: borderGlow,
            filter: filter,
            revealed: false,
            progress: 0.0
          });
        });

        this.activePanelIdx = -1;
        this.resize();
      } catch (err) {
        console.error("Failed to load comic texture:", err);
      }
    }

    /**
     * Reveals a panel by index with the Pixel Dissolve effect
     * @param {number} panelIdx
     * @param {boolean} [immediate=false]
     */
    revealPanel(panelIdx, immediate = false) {
      if (!this.panels || this.panels.length === 0) return;

      const idx = Math.max(0, Math.min(panelIdx, this.panels.length - 1));
      const targetPanel = this.panels[idx];
      if (!targetPanel) return;

      this.activePanelIdx = idx;

      if (this.panelTweens[idx]) {
        this.panelTweens[idx].kill();
      }

      if (immediate) {
        targetPanel.progress = 1.0;
        targetPanel.filter.uniforms.uProgress = 1.0;
        targetPanel.revealed = true;
        this.highlightActivePanel(idx, true);
        return;
      }

      if (window.gsap) {
        this.highlightActivePanel(idx);

        const tween = gsap.to(targetPanel, {
          progress: 1.0,
          duration: 0.85,
          ease: "power2.out",
          onUpdate: () => {
            targetPanel.filter.uniforms.uProgress = targetPanel.progress;
          },
          onComplete: () => {
            targetPanel.revealed = true;
            targetPanel.filter.uniforms.uProgress = 1.0;
          }
        });
        this.panelTweens[idx] = tween;
      } else {
        let start = null;
        const duration = 850;
        const animate = (timestamp) => {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const p = Math.min(1.0, elapsed / duration);
          targetPanel.progress = p;
          targetPanel.filter.uniforms.uProgress = p;
          if (p < 1.0) {
            requestAnimationFrame(animate);
          } else {
            targetPanel.revealed = true;
          }
        };
        requestAnimationFrame(animate);
      }
    }

    /**
     * Highlight active panel border glow
     * @param {number} idx
     * @param {boolean} [skipAnim=false]
     */
    highlightActivePanel(idx, skipAnim = false) {
      this.panels.forEach((p, i) => {
        if (!p.borderGlow) return;
        p.borderGlow.clear();
        if (i === idx) {
          p.borderGlow.lineStyle(2.5, 0x00f3ff, 0.95);
          p.borderGlow.drawRoundedRect(0, 0, p.def.w, p.def.h, 2);
          if (!skipAnim && window.gsap) {
            gsap.fromTo(p.borderGlow, { alpha: 1 }, { alpha: 0.35, duration: 1.2, ease: "power2.out" });
          }
        }
      });
    }

    /**
     * Instantly finishes revealing the current panel if player skips typewriter
     */
    skipCurrentReveal() {
      if (this.activePanelIdx >= 0 && this.panels[this.activePanelIdx]) {
        this.revealPanel(this.activePanelIdx, true);
      }
    }

    /**
     * Unlocks all panels instantly
     */
    revealAll() {
      this.panels.forEach((_, idx) => this.revealPanel(idx, true));
    }

    /**
     * Resets all panels to unrevealed
     */
    reset() {
      this.panelTweens.forEach(t => t && t.kill());
      this.panelTweens = [];
      this.activePanelIdx = -1;
      this.panels.forEach(p => {
        p.progress = 0.0;
        p.filter.uniforms.uProgress = 0.0;
        p.revealed = false;
        if (p.borderGlow) p.borderGlow.clear();
      });
    }

    /**
     * Scales and centers the comic within the viewport
     */
    resize() {
      if (!this.app || !this.containerEl || !this.comicContainer) return;

      const rect = this.containerEl.getBoundingClientRect();
      const viewW = rect.width || window.innerWidth;
      const viewH = rect.height || (window.innerHeight - 200);

      this.app.renderer.resize(viewW, viewH);

      const padding = 6;
      const availW = Math.max(100, viewW - padding * 2);
      const availH = Math.max(100, viewH - padding * 2);

      const scale = Math.min(availW / COMIC_NATURAL_W, availH / COMIC_NATURAL_H);

      this.comicContainer.scale.set(scale);
      this.comicContainer.x = (viewW - COMIC_NATURAL_W * scale) / 2;
      this.comicContainer.y = (viewH - COMIC_NATURAL_H * scale) / 2;
    }

    /**
     * Clears scene elements
     */
    clearScene() {
      this.reset();
      if (this.comicContainer && this.app) {
        this.app.stage.removeChild(this.comicContainer);
        this.comicContainer.destroy({ children: true });
        this.comicContainer = null;
      }
      this.panels = [];
    }

    /**
     * Destroys engine instance
     */
    destroy() {
      this.clearScene();
      if (this._onResize) {
        window.removeEventListener("resize", this._onResize);
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      if (this.app) {
        this.app.destroy(true, { children: true, texture: false, baseTexture: false });
        this.app = null;
      }
      this.isInitialized = false;
    }
  }

  window.ComicEngine = new ComicSceneEngine();

})(window);
