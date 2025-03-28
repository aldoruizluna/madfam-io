// --- START OF FILE sceneSetup.js ---

import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { BACKGROUND_COLOR, FOG_NEAR, FOG_FAR, CAMERA_Z_OFFSET } from './config.js';
import { webGLCanvas, css3DContainer } from './domElements.js';

export function setupSceneAndCamera() {
    console.log('[SceneSetup] Setting up Scenes and Camera...');
    const webGLScene = new THREE.Scene();
    const cssScene = new THREE.Scene();
    webGLScene.fog = new THREE.Fog(BACKGROUND_COLOR, FOG_NEAR, FOG_FAR);
    webGLScene.background = new THREE.Color(BACKGROUND_COLOR);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, CAMERA_Z_OFFSET); // Initial temp position

    console.log('[SceneSetup] Scenes and Camera created.');
    return { webGLScene, cssScene, camera };
}

export function setupRenderers() {
    console.log('[SceneSetup] Setting up Renderers...');
    let webGLRenderer, cssRenderer;
    try {
        webGLRenderer = new THREE.WebGLRenderer({
            canvas: webGLCanvas,
            antialias: true,
            alpha: true
        });
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        webGLRenderer.outputColorSpace = THREE.SRGBColorSpace;
        webGLRenderer.shadowMap.enabled = true;
        webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        webGLRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        webGLRenderer.toneMappingExposure = 1.0;

        cssRenderer = new CSS3DRenderer();
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
        css3DContainer.appendChild(cssRenderer.domElement);

        console.log('[SceneSetup] Renderers configured.');
        return { webGLRenderer, cssRenderer };
    } catch (error) {
        console.error('[SceneSetup] Error setting up renderers:', error);
        throw error; // Propagate error
    }
}

export function setupLighting(scene) {
    console.log('[SceneSetup] Setting up Lighting...');
    const ambientLight = new THREE.AmbientLight(0xadcafc, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfff5e1, 1.8);
    directionalLight.position.set(8, 20, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    // Configure shadow camera frustum (adjust as needed)
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    const pointLight1 = new THREE.PointLight(0x8a2be2, 0.7, 60, 1.5);
    pointLight1.position.set(-12, 8, -10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.6, 60, 1.5);
    pointLight2.position.set(12, -8, -20);
    scene.add(pointLight2);
    console.log('[SceneSetup] Lighting setup complete.');
}

// --- END OF FILE sceneSetup.js ---