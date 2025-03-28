// --- START OF FILE animationLoop.js ---

import TWEEN from '@tweenjs/tween.js';
import { updateBackground } from '../features/backgroundElements.js'; // Import particle update logic

let isAnimating = false;
let lastFrameTime = 0;
let rafId = null;

// Store references to objects needed in the loop
let rendererRefs = { webGLRenderer: null, cssRenderer: null };
let sceneRefs = { webGLScene: null, cssScene: null };
let cameraRef = null;

export function initAnimationLoop(renderers, scenes, camera) {
     console.log("[AnimationLoop] Initializing...");
     if(!renderers.webGLRenderer || !renderers.cssRenderer || !scenes.webGLScene || !scenes.cssScene || !camera) {
         console.error("[AnimationLoop] Missing dependencies for initialization.");
         return;
     }
     rendererRefs = renderers;
     sceneRefs = scenes;
     cameraRef = camera;
     console.log("[AnimationLoop] Initialized.");
}

export function startAnimationLoop() {
    if (isAnimating) {
        console.warn("[AnimationLoop] Loop already running.");
        return;
    }
    if (!rendererRefs.webGLRenderer || !cameraRef) {
         console.error("[AnimationLoop] Cannot start: Loop not initialized with dependencies.");
         return;
    }
    console.log("[AnimationLoop] Starting animation loop.");
    isAnimating = true;
    lastFrameTime = performance.now();
    animate(lastFrameTime); // Start the loop
}

export function stopAnimationLoop() {
    if (!isAnimating) {
        console.warn("[AnimationLoop] Loop not running.");
        return;
    }
    console.log("[AnimationLoop] Stopping animation loop.");
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    isAnimating = false;
}

function animate(time) {
    // 1. Request next frame immediately
    rafId = requestAnimationFrame(animate);

    // 2. Calculate delta time (optional)
    const delta = time - lastFrameTime;
    lastFrameTime = time;

    // 3. Update TWEEN
    try {
        TWEEN.update(time);
    } catch (error) {
         console.error(`[Animate] Error during TWEEN.update:`, error);
         stopAnimationLoop(); // Stop loop on critical error
         return;
    }

    // 4. Update other animations (background)
    updateBackground(time);

    // 5. Render scenes
    try {
        rendererRefs.webGLRenderer.render(sceneRefs.webGLScene, cameraRef);
        rendererRefs.cssRenderer.render(sceneRefs.cssScene, cameraRef);
    } catch (error) {
        console.error(`[Animate] Error during rendering:`, error);
        stopAnimationLoop(); // Stop loop on render error
        return;
    }
}


// --- END OF FILE animationLoop.js ---