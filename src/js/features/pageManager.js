// --- START OF FILE pageManager.js ---

import * as THREE from 'three';
import PageContent from '../components/PageContent.js'; // Assuming PageContent.js is in the same directory
import { pageDefinitions } from '../data/pageData.js';
import { PAGE_SPACING } from '../core/config.js';
import { scrollProxyElement } from '../core/domElements.js';

let createdPages = [];

export function createPages(webGLScene, cssScene) {
    console.log('[PageManager] Creating Page Objects...');
    createdPages = pageDefinitions.map((data, index) => {
        const position = new THREE.Vector3(0, -index * PAGE_SPACING, 0);
        try {
            // Pass the texture getter result, which might be null initially
            const page = new PageContent(data, position);
            page.addToScene(webGLScene, cssScene);
            console.log(`[PageManager] Created and added Page ${data.id} at Y=${position.y.toFixed(2)}`);
            return page;
        } catch (error) {
            console.error(`[PageManager] Error creating/adding Page ${data.id}:`, error);
            return null;
        }
    }).filter(page => page !== null);

    if (createdPages.length !== pageDefinitions.length) {
        console.warn('[PageManager] Some pages failed to initialize.');
    }
    console.log(`[PageManager] Finished creating ${createdPages.length} Page Objects.`);

    updateScrollProxyHeight(createdPages);

    return createdPages; // Return the array of page instances
}

export function getPages() {
    return createdPages;
}

export function updateScrollProxyHeight(pages) {
    if (scrollProxyElement && pages?.length > 0) {
        const totalScrollHeight = pages.length * window.innerHeight;
        scrollProxyElement.style.height = `${totalScrollHeight}px`;
        console.log(`%c[PageManager] Set #scroll-proxy height: ${totalScrollHeight}px`, 'color: blue');
    } else if (pages?.length > 0) {
        console.error('[PageManager] #scroll-proxy element not found, scrolling will not work.');
    } else {
        console.warn('[PageManager] No pages available, skipping scroll proxy height setup.');
    }
}

// --- END OF FILE pageManager.js ---