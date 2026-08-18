/* ═══════════════════════════════════════
   CHARACTER SPRITES
   Owns: the SVG/Image markup mapping character keys ('man'/'gala'/'lydia')
   to their respective raster asset paths.
   Exports (globals): SVG
   Depends on: nothing
   Used by: quest.js (buildChars)
═══════════════════════════════════════ */

/**
 * @typedef {'man' | 'vvv' | 'gala' | 'lydia'} CharacterKey
 */

/** @type {Record<CharacterKey, string>} */
const SVG = {
  man: `<img src='assets/man.png' class='char-svg' style='width:auto;height:160px;image-rendering:pixelated;display:block' alt='VVV'/>`,
  vvv: `<img src='assets/man.png' class='char-svg' style='width:auto;height:160px;image-rendering:pixelated;display:block' alt='VVV'/>`,
  gala: `<img src='assets/gala.png' class='char-svg' style='width:auto;height:160px;image-rendering:pixelated;display:block' alt='Gala'/>`,
  lydia: `<img src='assets/lydia.png' class='char-svg' style='width:auto;height:160px;image-rendering:pixelated;display:block' alt='Lydia'/>`
};
