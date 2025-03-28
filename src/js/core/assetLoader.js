// --- START OF FILE assetLoader.js ---

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadingScreenElementRef } from './domElements.js';
import { TRANSITION_DURATION } from './config.js';

export const loadingManager = new THREE.LoadingManager();
export const textureLoader = new THREE.TextureLoader(loadingManager);
export const gltfLoader = new GLTFLoader(loadingManager); // If needed

let onAllAssetsLoadedCallback = null;

export function initAssetLoader(onLoadedCallback) {
    console.log('[Assets] Initializing Asset Loader...');
    onAllAssetsLoadedCallback = onLoadedCallback;

    loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
        console.log(`[Assets] Started loading: ${url} (${itemsLoaded}/${itemsTotal})`);
    };
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        // console.log(`[Assets] Loading: ${url} (${itemsLoaded}/${itemsTotal})`); // Can be noisy
    };
    loadingManager.onError = (url) => {
        console.error(`%c[Assets] Error loading: ${url}`, 'color: red; font-weight: bold;');
    };
    loadingManager.onLoad = handleLoadingComplete;
    console.log('[Assets] LoadingManager configured.');
}

function handleLoadingComplete() {
    console.log('%c[Assets] All assets loaded successfully!', 'color: lightgreen; font-weight: bold;');

    // 1. Hide Loading Screen
    if (loadingScreenElementRef) {
        loadingScreenElementRef.classList.add('fade-out');
        loadingScreenElementRef.addEventListener('transitionend', () => {
            if (loadingScreenElementRef) loadingScreenElementRef.style.display = 'none';
        }, { once: true });
        // Failsafe hide
        setTimeout(() => {
             if (loadingScreenElementRef && window.getComputedStyle(loadingScreenElementRef).display !== 'none') {
                 console.warn("[Assets Failsafe] Forcing loading screen hide.");
                 loadingScreenElementRef.style.display = 'none';
             }
        }, TRANSITION_DURATION + 500);
    } else {
        console.error("[Assets] Loading screen element not found after load!");
    }

    // 2. Execute the callback provided during initialization
    if (typeof onAllAssetsLoadedCallback === 'function') {
        console.log("[Assets] Executing post-load setup callback...");
        try {
            onAllAssetsLoadedCallback();
        } catch (error) {
            console.error("%c[Assets] Error in post-load callback:", 'color: orange;', error);
            // Display error to user?
        }
    } else {
        console.warn("[Assets] No post-load callback provided or it's not a function.");
    }
}

// Optional: Function to preload specific assets
export function preloadTexture(path) {
    let texture = null;
    try {
        console.log(`[Assets] Initiating texture preload: ${path}`);
        texture = textureLoader.load(
            path,
            () => { console.log(`%c[Assets] Texture loaded: ${path}`, 'color: cyan'); },
            undefined, // onProgress
            (err) => { console.error(`%c[Assets] FAILED to load texture: ${path}`, 'color: red;', err); }
        );
    } catch (error) {
        console.error(`[Assets] Error initiating texture load for ${path}:`, error);
    }
    return texture;
}


// --- END OF FILE assetLoader.js ---