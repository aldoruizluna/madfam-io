import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// Constants for plane dimensions and CSS scaling
const PAGE_WIDTH = 10; // Width of the plane in 3D units
const PAGE_HEIGHT = 14.14; // Height matching A4 ratio (approx)
const CSS_SCALE = 0.01; // Scale down CSS pixels to 3D units (1000px width in CSS = 10 units in 3D)

class PageContent {
    constructor(pageData, position, rotation = new THREE.Euler(0, 0, 0)) {
        // console.log(`[PageContent ${pageData.id}] Constructor start`); // Less noisy logs
        this.pageData = pageData;
        this.position = position;
        this.rotation = rotation;

        // Main group for this page's elements
        this.group = new THREE.Group();
        this.group.position.copy(position);
        this.group.rotation.copy(rotation);
        // console.log(`[PageContent ${pageData.id}] Group created at Y=${position.y.toFixed(2)}`);

        // --- CSS3D Object (HTML Content) ---
        this.htmlElement = document.createElement('div');
        this.htmlElement.className = 'page-content-container'; // Base CSS styles
        this.htmlElement.innerHTML = pageData.htmlContent;   // Inner HTML content
        this.cssObject = new CSS3DObject(this.htmlElement);   // The 3D object wrapper
        // *** NOTE: Scale is applied in updateCSSObjectTransform ***
        // console.log(`[PageContent ${pageData.id}] CSS3DObject created`);

        // --- WebGL Backing Plane (Optional Texture Background) ---
        // console.log(`[PageContent ${pageData.id}] Creating WebGL Plane... Texture provided: ${!!pageData.texture}`);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: pageData.texture ? 0xffffff : 0x151a2f, // White if texture, dark blue/grey otherwise
            map: pageData.texture || null, // Use provided texture or null
            opacity: 0.0,                  // Start fully transparent
            transparent: true,             // Enable transparency
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 0.7,
        });
        const planeGeometry = new THREE.PlaneGeometry(PAGE_WIDTH, PAGE_HEIGHT);
        this.webGLPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.webGLPlane.position.z = -0.01; // Position slightly behind the CSS content plane
        this.group.add(this.webGLPlane); // Add the WebGL plane to the group
        // console.log(`[PageContent ${pageData.id}] WebGL Plane added`);

        // --- Initial State (applied in main.js after all pages are created) ---
        this.group.visible = false; // Start hidden
        // console.log(`[PageContent ${pageData.id}] Initial state set (hidden, transparent)`);
    }

    // Set opacity for both HTML (CSS) and WebGL plane
    setOpacity(opacity) {
        const clampedOpacity = Math.max(0, Math.min(1, opacity));
        // Update HTML element opacity via style
        this.htmlElement.style.opacity = clampedOpacity.toFixed(2); // Use fixed decimal for style

        // Update WebGL plane material opacity
        if (this.webGLPlane?.material) {
            this.webGLPlane.material.opacity = clampedOpacity;
            // Only enable transparency if opacity is less than 1
            this.webGLPlane.material.transparent = clampedOpacity < 1.0;
            this.webGLPlane.material.needsUpdate = true; // Signal material change
        }
    }

    // Get current opacity (reading from HTML style for consistency)
    getOpacity() {
        // Default to 0 if style.opacity is not set or invalid
        return parseFloat(this.htmlElement.style.opacity || '0');
    }

    // Make the group visible (actual fade-in handled by TWEEN in main.js)
    show() {
        // console.log(`[PageContent ${this.pageData.id}] show() called - setting group.visible = true`);
        this.group.visible = true;
    }

    // Add the group to WebGL scene and the CSS object to CSS scene
    addToScene(webGLScene, cssScene) {
        // console.log(`[PageContent ${this.pageData.id}] addToScene - Adding group to webGLScene`);
        webGLScene.add(this.group);
        // console.log(`[PageContent ${this.pageData.id}] addToScene - Adding cssObject to cssScene`);
        cssScene.add(this.cssObject);
        this.updateCSSObjectTransform(); // Perform initial sync
        // console.log(`[PageContent ${this.pageData.id}] addToScene - Initial CSS transform update done`);
    }

    // *** CRITICAL METHOD ***
    // Syncs the CSS3DObject's world transform with the THREE.Group's world transform
    updateCSSObjectTransform() {
        // Ensure the group's world matrix is up-to-date
        // The 'true' argument forces update down the hierarchy if needed
        this.group.updateMatrixWorld(true);

        // Decompose the group's world matrix into position, quaternion (rotation), and scale
        const matrix = this.group.matrixWorld;
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        matrix.decompose(position, quaternion, scale);

        // Apply the decomposed transforms to the CSS3DObject
        this.cssObject.position.copy(position);
        this.cssObject.quaternion.copy(quaternion);

        // *** IMPORTANT: Apply the base CSS_SCALE *in addition* to the group's scale ***
        this.cssObject.scale.copy(scale).multiplyScalar(CSS_SCALE);
    }
}

export default PageContent;