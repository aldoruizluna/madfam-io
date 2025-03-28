// --- START OF FILE backgroundElements.js ---

import * as THREE from 'three';
import { PAGE_SPACING } from '../core/config.js';

let particleSystem = null;

export function setupBackground(scene, pages) {
    console.log('[Background] Setting up background particles...');
    try {
        const particleCount = 600;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const totalVerticalRange = pages?.length > 1 ? (pages.length - 1) * PAGE_SPACING : 50;
        const verticalCenter = pages?.length > 1 ? -totalVerticalRange / 2 : 0;

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i]   = (Math.random() - 0.5) * 100;
            positions[i+1] = verticalCenter + (Math.random() - 0.5) * (totalVerticalRange + PAGE_SPACING * 3);
            positions[i+2] = (Math.random() - 0.5) * 100;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x9faded, size: 0.12, sizeAttenuation: true,
            transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending
        });
        particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        particleSystem.position.z = -25;
        particleSystem.renderOrder = -1;
        scene.add(particleSystem);
        console.log('[Background] Particle system added.');
    } catch (error) {
        console.error('[Background] Error creating particle system:', error);
        particleSystem = null;
    }
    return particleSystem; // Return the system for the animation loop
}

export function updateBackground(time) {
     // Update background elements in the animation loop
     const elapsedTime = time / 1000;
     if (particleSystem) {
         particleSystem.rotation.y = elapsedTime * 0.03;
     }
}


// --- END OF FILE backgroundElements.js ---