// --- START OF FILE domElements.js ---

console.log('[DOM] Getting DOM Elements...');

export const webGLCanvas = document.getElementById('webgl-canvas');
export const css3DContainer = document.getElementById('css3d-container');
export const loadingScreenElementRef = document.getElementById('loading-screen');
export const scrollProxyElement = document.getElementById('scroll-proxy');

export function checkDOMReady() {
    if (!webGLCanvas || !css3DContainer || !loadingScreenElementRef || !scrollProxyElement) {
        console.error('[DOM] Critical DOM element(s) missing! Aborting setup.');
        if (loadingScreenElementRef) {
            loadingScreenElementRef.innerHTML = "<p>Error: Could not initialize page elements. Please try refreshing.</p>";
        }
        // Stop further execution if critical elements are missing
        throw new Error("Missing critical DOM elements.");
    }
    console.log('[DOM] All required DOM Elements found.');
    return true; // Indicate success
}

// --- END OF FILE domElements.js ---