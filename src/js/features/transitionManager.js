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
let sceneRef = null;
let scrollManagerRef = null;
let rendererRef = null;

const TRANSITION_TIMEOUT = TRANSITION_DURATION * 2; // Double the duration as safety margin
let timeoutId = null;

function cleanupTween() {
    if (currentTween) {
        currentTween.stop();
        TWEEN.remove(currentTween);
        currentTween = null;
    }
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    if (rendererRef && cameraRef && sceneRef) {
        rendererRef.render(sceneRef, cameraRef);
    } else {
        console.error("[TransitionManager] Missing renderer, camera, or scene reference");
    }
}

export function initTransitionManager(pages, camera, scene, scrollManager, renderer) {
    console.log("[TransitionManager] Initializing...");
    if (!pages || !camera || !scene || !scrollManager || !renderer) {
         console.error("[TransitionManager] Missing dependencies (pages, camera, scene, scrollManager, or renderer).");
         throw new Error("TransitionManager failed to initialize due to missing dependencies.");
    }
    pagesRef = pages;
    cameraRef = camera;
    sceneRef = scene;
    scrollManagerRef = scrollManager;
    rendererRef = renderer;
    animate();
    console.log(`[TransitionManager] Initialized successfully with ${pagesRef.length} pages.`);
}

export function transitionToSection(targetIndex) {
    cleanupTween(); // Cleanup any existing animation
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

    timeoutId = setTimeout(() => {
        console.error('[Transition] Animation timeout! Cleaning up...');
        cleanupTween();
        if (scrollManagerRef) {
            scrollManagerRef.notifyTransitionComplete();
        }
    }, TRANSITION_TIMEOUT);
}

// ---vvv ADD LOGGING HERE vvv---
function handleTweenUpdate(data) {
    console.log('%c[Tween Update] Frame Start', 'color: orange');
    try {
        if (!cameraRef || !pagesRef) {
            console.error('[Tween Update] Missing cameraRef or pagesRef!');
            if (currentTween) currentTween.stop();
            return;
        }

        console.log(`[Tween Update] Updating camera position to: (${data.camX}, ${data.camY}, ${data.camZ})`);
        cameraRef.position.set(data.camX, data.camY, data.camZ);
        _lookAtInterpolation.set(data.lookAtX, data.lookAtY, data.lookAtZ);
        console.log(`[Tween Update] Updating camera lookAt to: (${data.lookAtX}, ${data.lookAtY}, ${data.lookAtZ})`);
        cameraRef.lookAt(_lookAtInterpolation);

        pagesRef.forEach((page, index) => {
            if (!page || !page.group || !page.pageData) {
                console.warn(`[Tween Update] Skipping invalid page at index ${index}`);
                return;
            }

            const id = page.pageData.id;
            const opacity = data[`p${id}O`];
            const scale = data[`p${id}S`];
            const zPos = data[`p${id}Z`];

            if (opacity !== undefined) {
                console.log(`[Tween Update] Updating page ${id} opacity to: ${opacity}`);
                page.setOpacity(opacity);
            }
            if (scale !== undefined) {
                console.log(`[Tween Update] Updating page ${id} scale to: ${scale}`);
                page.group.scale.set(scale, scale, scale);
            }
            if (zPos !== undefined) {
                console.log(`[Tween Update] Updating page ${id} z position to: ${zPos}`);
                page.group.position.z = zPos;
            }

            console.log(`[Tween Update] Updating CSS transforms for page ${id}`);
            page.updateCSSObjectTransform();
        });

        console.log('%c[Tween Update] Frame End', 'color: orange');
    } catch (error) {
        console.error('%c[TWEEN Update Error]', 'color: red; font-weight:bold;', error);
        if (currentTween) currentTween.stop();
    }
}
// ---^^^ END LOGGING AREA ^^^---

function handleTweenComplete(targetIndex, targetPage, finalCamPos, finalLookAt) {
    cleanupTween();
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