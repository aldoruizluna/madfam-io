// --- START OF FILE pageData.js ---

// Pre-assign textures if loaded elsewhere (e.g., main.js orchestrator)
// Or load them here if this module manages textures
export let level1TextureRef = null; // Will be assigned by main.js

// You might import a texture loading function here if preferred
// import { preloadTexture } from './assetLoader.js';
// const level1Texture = preloadTexture('assets/images/level1-visual.jpg');

export const pageDefinitions = [
    { id: 1, htmlContent: `<div class="page-hero"><h1>Catálogo de Ofertas...</h1>...</div>` },
    { id: 2, htmlContent: `<div class="page-content"><h2>Resumen Ejecutivo</h2>...</div>` },
    { id: 3, htmlContent: `<div class="page-content"><h2>Visión General de Servicios</h2>...</div>` },
    {
      id: 4,
      htmlContent: `<div class="page-columns">...<h2>Nivel 1...</h2>...</div>`,
      // Use the reference that will be assigned
      get texture() { return level1TextureRef; }
    },
    { id: 5, htmlContent: `<div class="page-content"><h2>Nivel 2...</h2>...</div>`},
    { id: 6, htmlContent: `<div class="page-content"><h2>Nivel 3...</h2>...</div>`},
    { id: 7, htmlContent: `<div class="page-content"><h2>Nivel 4...</h2>...</div>`},
    { id: 8, htmlContent: `<div class="page-content"><h2>Nivel 5...</h2>...</div>`},
    { id: 9, htmlContent: `<div class="page-content"><h2>Términos...</h2>...</div>`},
    { id: 10, htmlContent: `<div style="text-align:center;"><h2>Conclusión...</h2>...</div>`},
];
console.log(`[PageData] Defined ${pageDefinitions.length} pages.`);

// Function to assign the preloaded texture reference
export function assignLevel1Texture(texture) {
    console.log("[PageData] Assigning level 1 texture reference.");
    level1TextureRef = texture;
}

// --- END OF FILE pageData.js ---