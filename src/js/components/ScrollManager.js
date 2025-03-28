import Lenis from '@studio-freight/lenis'

// *** Default debounce, can be overridden in constructor ***
const DEFAULT_TRANSITION_DEBOUNCE = 800; // ms cooldown

class ScrollManager {
    // *** FIX: Accept transitionDuration for debounce coordination ***
    constructor(totalSections, transitionDuration = DEFAULT_TRANSITION_DEBOUNCE) {
        console.log(`[ScrollManager Constructor] Initializing with ${totalSections} sections.`);
        this.totalSections = totalSections;
        this.currentSection = 0;
        this.isTransitioning = false; // Flag to prevent overlapping transitions
        this.lastScrollTime = 0;
        this.listeners = []; // Callbacks to notify on section change request
        // *** FIX: Coordinate debounce with transition duration ***
        this.transitionDebounce = transitionDuration; // Use provided duration
        console.log(`[ScrollManager Constructor] Transition Debounce set to: ${this.transitionDebounce}ms`);

        try {
            console.log('[ScrollManager Constructor] Creating Lenis instance...');
            this.lenis = new Lenis({
                lerp: 0.08,
                smoothWheel: true,
                // wheelMultiplier: 0.8, // Adjust scroll sensitivity if needed
            });
            console.log('[ScrollManager Constructor] Lenis instance created.');

            console.log('[ScrollManager Constructor] Adding Lenis "scroll" event listener.');
            this.lenis.on('scroll', this.handleScroll.bind(this)); // Bind 'this'
            console.log('[ScrollManager Constructor] Lenis "scroll" event listener added.');

            console.log('[ScrollManager Constructor] Starting Lenis RAF loop.');
            requestAnimationFrame(this.raf.bind(this)); // Bind 'this'
            console.log('[ScrollManager Constructor] Initial RAF requested.');

        } catch (error) {
            console.error('[ScrollManager Constructor] Error during Lenis setup:', error);
        }
        console.log('[ScrollManager Constructor] Initialization finished.');
    }

    // Lenis RequestAnimationFrame loop
    raf(time) {
        try {
            this.lenis.raf(time); // Update Lenis state
        } catch (error) {
            console.error('[ScrollManager RAF] Error during lenis.raf:', error);
        }
        requestAnimationFrame(this.raf.bind(this)); // Keep the loop going
    }

    // Lenis 'scroll' event handler
    handleScroll(lenisEvent) {
        // direction: 1 = scrolling down, -1 = scrolling up
        // velocity: speed of scroll
        const { direction, velocity } = lenisEvent;
        // console.log(`[handleScroll] Dir: ${direction.toFixed(2)}, Vel: ${velocity.toFixed(2)}`); // Noisy

        const now = Date.now();

        // --- Debounce/Cooldown Check ---
        // Ignore scroll if:
        // 1. A transition is currently animating (`isTransitioning` is true).
        // 2. Not enough time has passed since the *start* of the last triggered transition.
        if (this.isTransitioning || (now - this.lastScrollTime < this.transitionDebounce)) {
            // console.log(`[handleScroll] Debounced: isTransitioning=${this.isTransitioning}, timeSinceLast=${now - this.lastScrollTime}`);
            return;
        }

        // --- Determine Target Section based on scroll direction ---
        let targetSection = this.currentSection;
        let triggered = false;

        // Use a velocity threshold to avoid triggering on tiny wheel movements
        const velocityThreshold = 0.2;

        // Scrolling Down?
        if (direction > 0 && velocity > velocityThreshold && this.currentSection < this.totalSections - 1) {
            console.log('[handleScroll] Direction: Down detected');
            targetSection = this.currentSection + 1;
            triggered = true;
        }
        // Scrolling Up?
        else if (direction < 0 && velocity > velocityThreshold && this.currentSection > 0) {
            console.log('[handleScroll] Direction: Up detected');
            targetSection = this.currentSection - 1;
            triggered = true;
        }

        // --- Trigger Transition ---
        if (triggered) {
            console.log(`%c[handleScroll] *** TRIGGERING TRANSITION *** from ${this.currentSection} to ${targetSection}`, 'color: magenta; font-weight: bold;');

            // 1. Set `isTransitioning` flag immediately to start debounce
            this.isTransitioning = true;
            // 2. Update `lastScrollTime` to mark the start of the debounce period
            this.lastScrollTime = now;
            // 3. Update the logical `currentSection`
            this.currentSection = targetSection;

            // 4. Notify listeners (main.js) to START the visual transition
            console.log(`[handleScroll] Notifying ${this.listeners.length} listeners about target index: ${this.currentSection}`);
            this.notifyListeners(this.currentSection);

            // 5. *** IMPORTANT: `isTransitioning` should be reset by main.js via `notifyTransitionComplete()`
            //    after the TWEEN animation finishes, not with a fixed setTimeout here. ***
            //    Remove the setTimeout that resets isTransitioning.
            // console.log(`[handleScroll] isTransitioning set to true. Waiting for external completion signal.`);
        }
    }

    // *** FIX: Add method to be called when TWEEN transition completes ***
    notifyTransitionComplete() {
        console.log(`%c[ScrollManager notifyTransitionComplete] Received completion signal. Resetting isTransitioning flag.`, 'color: magenta;');
        this.isTransitioning = false;
        // We can also update lastScrollTime here if we want the debounce period
        // to last until the *end* of the transition, but starting it at trigger time is usually better.
        // this.lastScrollTime = Date.now();
    }


    // --- Listener Management ---
    addListener(callback) {
        console.log('[ScrollManager addListener] Adding listener:', callback);
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            console.log(`[ScrollManager addListener] Listener added. Total: ${this.listeners.length}`);
        } else {
            console.error('[ScrollManager addListener] Invalid callback provided.');
        }
    }

    removeListener(callback) {
        console.log('[ScrollManager removeListener] Attempting to remove listener.');
        const initialLength = this.listeners.length;
        this.listeners = this.listeners.filter(listener => listener !== callback);
        if (this.listeners.length < initialLength) {
            console.log(`[ScrollManager removeListener] Listener removed. Total: ${this.listeners.length}`);
        } else {
            console.warn('[ScrollManager removeListener] Listener not found.');
        }
    }

    // Notify all registered listeners about the target index
    notifyListeners(targetIndex) {
        console.log(`[ScrollManager notifyListeners] Notifying about target index: ${targetIndex}`);
        if (this.listeners.length === 0) {
            console.warn('[ScrollManager notifyListeners] No listeners registered.');
            return;
        }
        // Iterate over a copy in case listeners modify the array during iteration
        [...this.listeners].forEach((listener, index) => {
            try {
                console.log(`[ScrollManager notifyListeners] Calling listener ${index + 1}`);
                listener(targetIndex); // Execute the callback (e.g., transitionToSection in main.js)
            } catch (error) {
                console.error(`[ScrollManager notifyListeners] Error in listener ${index + 1}:`, error);
                // Optionally remove the faulty listener: this.removeListener(listener);
            }
        });
        console.log(`[ScrollManager notifyListeners] Finished notifying.`);
    }

    // --- Public Methods ---
    // Programmatically go to a section (optional)
    goToSection(index, immediate = false) {
        console.log(`[ScrollManager goToSection] Requested section ${index}, immediate=${immediate}`);
        if (index < 0 || index >= this.totalSections || index === this.currentSection) {
            console.warn(`[ScrollManager goToSection] Invalid or current index ${index}. Aborting.`);
            return;
        }
        if (this.isTransitioning) {
            console.warn(`[ScrollManager goToSection] Transition already in progress. Aborting.`);
            return;
        }

        console.log(`%c[ScrollManager goToSection] *** TRIGGERING TRANSITION *** from ${this.currentSection} to ${index}`, 'color: magenta; font-weight: bold;');
        this.isTransitioning = true;
        this.lastScrollTime = Date.now(); // Start debounce
        this.currentSection = index;
        this.notifyListeners(this.currentSection);

        if (immediate && this.lenis) {
             // TODO: Implement immediate jump using lenis.scrollTo if needed,
             // but this usually conflicts with smooth transitions.
             console.warn("[ScrollManager goToSection] Immediate jump not fully implemented with TWEEN transitions.");
             // Maybe just skip TWEEN? Needs careful handling.
             // For now, 'immediate' flag is mostly ignored for smooth scroll.
        }
    }

    stop() {
        console.log('[ScrollManager stop] Stopping Lenis.');
        this.lenis?.stop();
    }

    start() {
        console.log('[ScrollManager start] Starting Lenis.');
        this.lenis?.start();
    }

    destroy() {
         console.log('[ScrollManager destroy] Destroying Lenis instance and removing listener.');
         this.lenis?.off('scroll', this.handleScroll);
         this.lenis?.destroy();
         this.listeners = []; // Clear listeners
    }
}

export default ScrollManager;