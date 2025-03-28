// --- START OF FILE scrollHandler.js ---

import ScrollManager from '../components/ScrollManager.js'; // Assuming ScrollManager.js is in the same directory
import { TRANSITION_DURATION, CAMERA_Z_OFFSET, PAGE_SCALE_INACTIVE, PAGE_Z_INACTIVE } from '../core/config.js';

let scrollManagerInstance = null;

// Requires pages, camera, and the function to call when scroll triggers a transition
export function initializeScrollHandling(pages, camera, onScrollTransitionRequest) {
    console.log('[ScrollHandler] Initializing ScrollManager...');
    if (!pages?.length) {
        console.error("[ScrollHandler] Cannot initialize: No pages available.");
        return null;
    }
    if (scrollManagerInstance) {
        console.warn("[ScrollHandler] ScrollManager already initialized.");
        return scrollManagerInstance;
    }
     if (typeof onScrollTransitionRequest !== 'function') {
        console.error("[ScrollHandler] Invalid transition request callback provided.");
        return null;
    }

    try {
        scrollManagerInstance = new ScrollManager(pages.length, TRANSITION_DURATION);

        scrollManagerInstance.addListener((targetIndex) => {
            console.log(`%c[Scroll Listener] Requesting transition to index: ${targetIndex}`, 'color: #FFD700');
            onScrollTransitionRequest(targetIndex); // Call the provided function (e.g., transitionToSection)
        });

        // Set Initial Page and Camera State
        console.log("[ScrollHandler] Setting initial page visibility and camera position...");
        pages.forEach((page, index) => {
            if (index === 0) { // First page
                page.show();
                page.setOpacity(1);
                page.group.scale.set(1, 1, 1);
                page.group.position.z = 0;
            } else { // Other pages
                page.setOpacity(0);
                page.group.scale.set(PAGE_SCALE_INACTIVE, PAGE_SCALE_INACTIVE, PAGE_SCALE_INACTIVE);
                page.group.position.z = PAGE_Z_INACTIVE;
                page.group.visible = false;
            }
            page.updateCSSObjectTransform();
        });

        const initialPagePos = pages[0].group.position;
        camera.position.set(initialPagePos.x, initialPagePos.y, initialPagePos.z + CAMERA_Z_OFFSET);
        camera.lookAt(initialPagePos);
        camera.updateProjectionMatrix();

        console.log(`[ScrollHandler] Initial camera position: Y=${camera.position.y.toFixed(2)}, Z=${camera.position.z.toFixed(2)}`);
        console.log("[ScrollHandler] ScrollManager initialized successfully.");
        return scrollManagerInstance;

    } catch (error) {
        console.error("[ScrollHandler] Error during ScrollManager initialization:", error);
        scrollManagerInstance = null;
        return null;
    }
}

export function getScrollManagerInstance() {
    return scrollManagerInstance;
}

// --- END OF FILE scrollHandler.js ---