// --- START OF FILE transitionManager.js --- (with added logging)

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import {
    TRANSITION_DURATION, CAMERA_Z_OFFSET,
    PAGE_SCALE_INACTIVE, PAGE_Z_INACTIVE
} from '../core/config.js'; // Corrected path assumption

let currentTween = null;
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3();
const _lookAtInterpolation = new THREE.Vector3();

let pagesRef = [];
let cameraRef = null;
let scrollManagerRef = null;

export function initTransitionManager(pages, camera, scrollManager) {
    console.log("[TransitionManager] Initializing...");
    if (!pages || !camera || !scrollManager) {
         console.error("[TransitionManager] Missing dependencies (pages, camera, or scrollManager).");
         throw new Error("TransitionManager failed to initialize due to missing dependencies."); // Make error clearer
    }
    pagesRef = pages;
    cameraRef = camera;
    scrollManagerRef = scrollManager;
    console.log(`[TransitionManager] Initialized successfully with ${pagesRef.length} pages.`); // Log count
}

export function transitionToSection(targetIndex) {
    console.log(`%c[Transition] Initiating to index: ${targetIndex}`, 'color: yellow');

    if (!pagesRef || !cameraRef || !scrollManagerRef) { // Re-check dependencies
        console.error("[Transition] Cannot transition: Manager not initialized or dependencies missing.");
        return;
    }
    if (targetIndex < 0 || targetIndex >= pagesRef.length) {
        console.warn(`[Transition] Invalid target index ${targetIndex}. Aborting.`);
        return;
    }
    const targetPage = pagesRef[targetIndex];
    if (!targetPage?.group) {
        console.error(`[Transition] Target page or group invalid for index ${targetIndex}. Aborting.`);
        return;
    }

    _targetCamPos.set(targetPage.group.position.x, targetPage.group.position.y, targetPage.group.position.z + CAMERA_Z_OFFSET);
    _targetLookAt.copy(targetPage.group.position);

    targetPage.show();

    if (currentTween) {
        currentTween.stop();
        TWEEN.remove(currentTween);
    }

    cameraRef.getWorldDirection(_currentLookAt);
    _currentLookAt.multiplyScalar(10).add(cameraRef.position);

    const transitionData = { /* ... same as before ... */ };
    pagesRef.forEach(page => { /* ... same as before ... */ });

    const targetState = { /* ... same as before ... */ };
    pagesRef.forEach(page => { /* ... same as before ... */ });

    console.log('[Transition] Starting TWEEN animation...');
    currentTween = new TWEEN.Tween(transitionData)
        .to(targetState, TRANSITION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(handleTweenUpdate) // Use named handler
        .onComplete(() => handleTweenComplete(targetIndex, targetPage, _targetCamPos, _targetLookAt)) // Use named handler
        .start(performance.now());
}

// ---vvv ADD LOGGING HERE vvv---
function handleTweenUpdate(data) {
    console.log('%c[Tween Update] Frame Start', 'color: orange'); // <-- START LOG
    try {
        if (!cameraRef || !pagesRef) {
             console.error("[Tween Update] Missing cameraRef or pagesRef!"); // <-- Check refs
             if (currentTween) currentTween.stop();
             return;
        }

        // console.log('[Tween Update] Updating Camera'); // <-- Optional finer log
        cameraRef.position.set(data.camX, data.camY, data.camZ);
        _lookAtInterpolation.set(data.lookAtX, data.lookAtY, data.lookAtZ);
        cameraRef.lookAt(_lookAtInterpolation);

        // console.log('[Tween Update] Updating Pages...'); // <-- Optional finer log
        pagesRef.forEach((page, index) => { // Add index
            // console.log(`[Tween Update] Processing page index ${index}`); // <-- Log loop iteration

            // Add more robust check for page validity
            if (!page || !page.group || !page.pageData) {
                console.warn(`[Tween Update] Skipping invalid page at index ${index}`);
                return; // Skip this iteration
            }
            const id = page.pageData.id;
            // console.log(`[Tween Update] Page ID: ${id}`); // <-- Log page ID

            const opacity = data[`p${id}O`];
            const scale = data[`p${id}S`];
            const zPos = data[`p${id}Z`];

            if (opacity !== undefined) page.setOpacity(opacity);
            if (scale !== undefined) page.group.scale.set(scale, scale, scale);
            if (zPos !== undefined) page.group.position.z = zPos;

            // Log BEFORE the critical call
            // console.log(`[Tween Update] BEFORE updateCSSObjectTransform for page ${id}`); // <-- Log before critical call
            page.updateCSSObjectTransform(); // CRITICAL SYNC
            // Log AFTER the critical call
            // console.log(`[Tween Update] AFTER updateCSSObjectTransform for page ${id}`); // <-- Log after critical call

        });
         // console.log('[Tween Update] Finished page updates.'); // <-- Optional finer log

    } catch (error) {
         console.error(`%c[TWEEN Update Error]`, 'color: red; font-weight:bold;', error);
         if (currentTween) currentTween.stop(); // Stop tween on error
    }
    console.log('%c[Tween Update] Frame End', 'color: orange'); // <-- END LOG
}
// ---^^^ END LOGGING AREA ^^^---


function handleTweenComplete(targetIndex, targetPage, finalCamPos, finalLookAt) {
     // ... (rest of handleTweenComplete remains the same) ...
     console.log(`%c[Transition] TWEEN Complete for index ${targetIndex}`, 'color: cyan;');
     if (!cameraRef || !pagesRef || !scrollManagerRef) return;

     cameraRef.position.copy(finalCamPos);
     cameraRef.lookAt(finalLookAt);

     pagesRef.forEach(page => { /* ... cleanup logic ... */ });

     currentTween = null;

     if (scrollManagerRef && typeof scrollManagerRef.notifyTransitionComplete === 'function') {
         scrollManagerRef.notifyTransitionComplete();
         console.log("[Transition] Notified ScrollManager of completion.");
     } else {
         console.warn("[Transition] Could not notify ScrollManager (instance or method missing).");
     }

     console.log(`%c[Transition] Cleanup finished for index ${targetIndex}`, 'color: cyan;');
}


// --- END OF FILE transitionManager.js ---