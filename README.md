# Innovaciones MADFAM - Interactive Scroll Experience

This project is a single-page interactive website designed to showcase company services or catalog items in an engaging, scroll-driven 3D environment. It utilizes Three.js for the WebGL background and effects, CSS3DRenderer for embedding standard HTML content within the 3D space, TWEEN.js for smooth animations, and Lenis for enhanced smooth scrolling.

![Screenshot Placeholder](placeholder.png)
*(Suggestion: Replace `placeholder.png` with an actual screenshot or GIF of the running application)*

## Features

*   **Smooth Scroll Navigation:** Uses Lenis to capture scroll input and trigger transitions between content sections.
*   **3D Environment:** Employs Three.js to create a 3D scene with camera movement and background elements (like particles).
*   **HTML Content in 3D:** Leverages `CSS3DRenderer` to display standard HTML/CSS content on planes within the 3D scene, allowing for easy content updates and rich text formatting.
*   **Animated Transitions:** Uses TWEEN.js for smooth camera movements and page fade/scale animations between sections.
*   **Modular JavaScript:** Code is broken down into ES Modules for better organization, maintainability, and debugging.
*   **Loading Indicator:** Shows a loading screen while initial assets are being fetched.

## Tech Stack

*   **Core:** HTML5, CSS3, JavaScript (ES Modules)
*   **3D Engine:** [Three.js](https://threejs.org/)
*   **Animation:** [TWEEN.js](https://github.com/tweenjs/tween.js/)
*   **Smooth Scroll:** [Lenis](https://github.com/studio-freight/lenis)
*   **Development Server (Recommended):** [live-server](https://www.npmjs.com/package/live-server) or Python's built-in HTTP server.

## Project Structure

The project follows a modular structure located primarily within the `src/` directory:

your-project-root/
├── src/
│ ├── js/
│ │ ├── core/ # Core engine setup (Scene, Loader, Config, etc.)
│ │ ├── components/ # Reusable classes (PageContent, ScrollManager)
│ │ ├── features/ # Specific features (Page transitions, Scroll logic, etc.)
│ │ ├── data/ # Page content definitions
│ │ └── main.js # Main application entry point & orchestrator
│ ├── css/ # Stylesheets
│ └── ...
├── assets/ # Static files (images, models)
├── node_modules/ # Dependencies (installed via npm)
├── index.html # Main HTML file
├── package.json # Project manifest
└── README.md # This file
└── FOLDER_STRUCTURE.md # Detailed structure visualization

For a detailed breakdown, see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md).

## Core Module Overview

*   **`main.js`:** Orchestrates the entire setup process, initializes modules in order.
*   **`config.js`:** Holds tweakable constants (speeds, distances, colors).
*   **`domElements.js`:** Gets references to required HTML elements.
*   **`sceneSetup.js`:** Creates Three.js scenes, camera, renderers, and lighting.
*   **`assetLoader.js`:** Manages the Three.js LoadingManager and asset preloading.
*   **`pageData.js`:** Defines the HTML content and associated data for each scrollable "page".
*   **`pageManager.js`:** Creates `PageContent` instances based on `pageData`.
*   **`PageContent.js`:** Class managing a single page's WebGL plane and CSS3D object.
*   **`backgroundElements.js`:** Creates and updates background visuals (e.g., particles).
*   **`ScrollManager.js`:** Class wrapping Lenis for scroll detection and debouncing.
*   **`scrollHandler.js`:** Initializes `ScrollManager` and links scroll events to transitions.
*   **`transitionManager.js`:** Manages the TWEEN-based animations for transitioning between pages.
*   **`animationLoop.js`:** Defines and controls the main `requestAnimationFrame` loop.
*   **`eventHandlers.js`:** Sets up browser event listeners (like window resize).

## Setup

1.  **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) and npm installed (npm comes with Node.js).
2.  **Clone/Download:** Get the project files onto your local machine.
3.  **Navigate:** Open your terminal or command prompt and navigate (`cd`) into the project's root directory.
4.  **Install Dependencies:** Run the following command:
    ```bash
    npm install
    ```
    This will download Three.js, TWEEN.js, and Lenis into the `node_modules` folder.

## Running Locally

Because the project uses ES Modules, you need to run it through a local web server. Direct opening of `index.html` via the `file:///` protocol will not work.

**Recommended Method:**

1.  Make sure you are in the project's root directory in your terminal.
2.  Run:
    ```bash
    npx live-server
    ```
3.  Your default browser should automatically open to the correct address (e.g., `http://127.0.0.1:8080`). If not, open the URL shown in the terminal.
4.  `live-server` also provides hot-reloading, automatically refreshing the browser when you save file changes.
5.  To stop the server, go back to the terminal and press `Ctrl + C`.

**Alternative (Python 3):**

1.  In the project's root directory, run:
    ```bash
    python -m http.server
    ```
2.  Open `http://localhost:8000` in your browser.
3.  Stop with `Ctrl + C`.

## Configuration

Basic parameters can be adjusted in `src/js/core/config.js`:

*   `PAGE_SPACING`: Vertical distance between page centers in 3D space.
*   `TRANSITION_DURATION`: Animation time (in milliseconds) for page transitions. Should match the debounce time in `ScrollManager`.
*   `CAMERA_Z_OFFSET`: Distance of the camera from the currently focused page.
*   `PAGE_SCALE_INACTIVE`: How much non-focused pages are scaled down.
*   `PAGE_Z_INACTIVE`: How far back non-focused pages are pushed.

## Updating Content

To change the text, images, or structure of the pages:

1.  Edit the `htmlContent` properties within the `pageDefinitions` array in `src/js/data/pageData.js`.
2.  Standard HTML tags can be used within the `htmlContent` strings.
3.  Styling is controlled by `src/css/style.css`. Target elements within the `.page-content-container` class.
4.  To associate a background texture with a specific page (like page 4 in the example), ensure the texture is loaded (e.g., in `main.js` using `assetLoader.js`) and assigned correctly in `pageData.js`. If you add new images within the HTML, ensure the image paths are correct relative to the final deployed structure (usually relative to `index.html`).

## License

*(Optional: Specify your license, e.g., MIT)*
See the LICENSE file for details.