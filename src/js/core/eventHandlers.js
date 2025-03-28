// --- START OF FILE eventHandlers.js ---

import { updateScrollProxyHeight } from '../features/pageManager.js'; // Need this to update on resize

let cameraRef = null;
let rendererRefs = { webGLRenderer: null, cssRenderer: null };
let pagesRef = [];

export function setupEventHandlers(camera, renderers, pages) {
    console.log("[Events] Setting up event handlers...");
     if (!camera || !renderers.webGLRenderer || !renderers.cssRenderer || !pages) {
         console.error("[Events] Missing dependencies for event handlers.");
         return;
     }
    cameraRef = camera;
    rendererRefs = renderers;
    pagesRef = pages;

    window.addEventListener('resize', handleWindowResize);
    console.log("[Events] Resize listener added.");
}

function handleWindowResize() {
    console.log('[Resize] Window resized.');
    if (!cameraRef || !rendererRefs.webGLRenderer || !rendererRefs.cssRenderer || !pagesRef) return;

    // Update camera
    cameraRef.aspect = window.innerWidth / window.innerHeight;
    cameraRef.updateProjectionMatrix();

    // Update renderers
    rendererRefs.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    rendererRefs.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    rendererRefs.webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Update scroll proxy height
    updateScrollProxyHeight(pagesRef);

    console.log('[Resize] Updates applied.');
}

export function removeEventHandlers() {
     console.log("[Events] Removing event handlers...");
     window.removeEventListener('resize', handleWindowResize);
     console.log("[Events] Resize listener removed.");
}


// --- END OF FILE eventHandlers.js ---