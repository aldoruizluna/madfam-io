// --- START OF FILE main.js --- orchestrator

import * as config from './core/config.js';
import * as dom from './core/domElements.js';
import { setupSceneAndCamera, setupRenderers, setupLighting } from './core/sceneSetup.js';
import { initAssetLoader, preloadTexture } from './core/assetLoader.js';
import { pageDefinitions, assignLevel1Texture } from './data/pageData.js'; // Import ref assigner
import { createPages, getPages } from './features/pageManager.js';
import { setupBackground } from './features/backgroundElements.js';
import { initTransitionManager, transitionToSection } from './features/transitionManager.js';
import { initializeScrollHandling, getScrollManagerInstance } from './features/scrollHandler.js';
import { initAnimationLoop, startAnimationLoop } from './core/animationLoop.js';
import { setupEventHandlers } from './core/eventHandlers.js';

console.log('%c[MAIN] Orchestrator Script Start', 'color: #aabbff; font-weight: bold;');

// --- Global Refs --- (Keep track of key created objects)
let sceneRefs = { webGLScene: null, cssScene: null };
let camera = null;
let rendererRefs = { webGLRenderer: null, cssRenderer: null };
let pages = [];
let scrollManager = null;
let particleSystem = null;

// --- Main Setup Function ---
function initializeExperience() {
    console.log('[MAIN] Initializing Experience...');

    // 1. Check DOM Readiness
    try {
        dom.checkDOMReady();
    } catch (error) {
        console.error("[MAIN] Initialization aborted due to missing DOM elements.", error);
        return; // Stop if DOM isn't ready
    }

    // 2. Setup Scene, Camera, Renderers, Lighting
    try {
        const sceneSetup = setupSceneAndCamera();
        sceneRefs = { webGLScene: sceneSetup.webGLScene, cssScene: sceneSetup.cssScene };
        camera = sceneSetup.camera;

        rendererRefs = setupRenderers();

        setupLighting(sceneRefs.webGLScene);
    } catch (error) {
        console.error("[MAIN] Initialization aborted during scene/renderer setup.", error);
        // Display error to user via loading screen?
        if (dom.loadingScreenElementRef) dom.loadingScreenElementRef.innerHTML = "<p>Error: Graphics setup failed.</p>";
        return;
    }

    // 3. Initialize Animation Loop (but don't start yet)
    initAnimationLoop(rendererRefs, sceneRefs, camera);

    // 4. Initialize Asset Loader - Pass the function to run AFTER loading
    initAssetLoader(onAssetsReady);

    // 5. Start Preloading Critical Assets (non-blocking)
    const level1Texture = preloadTexture('assets/images/level1-visual.jpg'); // <<< VERIFY PATH
    assignLevel1Texture(level1Texture); // Assign the texture ref in pageData

    console.log('[MAIN] Initial setup complete. Waiting for assets...');
    // Asset loader's onLoad will trigger onAssetsReady
}

// --- Function Called After Assets Loaded ---
function onAssetsReady() {
    console.log('%c[MAIN] All assets ready. Performing post-load setup...', 'color: lightgreen;');

    try {
        // 6. Create Pages
        pages = createPages(sceneRefs.webGLScene, sceneRefs.cssScene);
        if (!pages || pages.length === 0) {
            throw new Error("Page creation failed or resulted in no pages.");
        }

        // 7. Setup Background Elements
        particleSystem = setupBackground(sceneRefs.webGLScene, pages);
        // Note: particleSystem ref needs to be accessible by animationLoop's updateBackground

        // 8. Initialize Scroll Handling (Needs pages, camera, and the transition function)
        // Pass `transitionToSection` as the callback
        scrollManager = initializeScrollHandling(pages, camera, transitionToSection);
        if (!scrollManager) {
             throw new Error("Scroll Manager initialization failed.");
        }

        // 9. Initialize Transition Manager (Needs pages, camera, and the scrollManager instance)
        initTransitionManager(pages, camera, scrollManager);

        // 10. Setup Event Handlers (Resize, etc.)
        setupEventHandlers(camera, rendererRefs, pages);

        // 11. Start the Animation Loop NOW
        startAnimationLoop();

        console.log('%c[MAIN] Experience initialization complete and running!', 'color: lightgreen; font-weight: bold;');

    } catch (error) {
        console.error("%c[MAIN] CRITICAL ERROR during post-load setup:", 'color: red; font-weight: bold;', error);
        // Display a user-friendly error message
         if (dom.loadingScreenElementRef && dom.loadingScreenElementRef.style.display !== 'none') {
             dom.loadingScreenElementRef.innerHTML = `<p>An error occurred loading the experience.<br>Please try refreshing the page.</p>`;
             dom.loadingScreenElementRef.classList.remove('fade-out'); // Make sure it's visible
             dom.loadingScreenElementRef.style.opacity = '1';
         } else {
             alert("An error occurred loading the experience. Please try refreshing the page.");
         }
    }
}

// --- Start Initialization Process ---
initializeExperience();


// --- END OF FILE main.js --- orchestrator