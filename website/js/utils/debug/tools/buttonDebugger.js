/**
 * Button Debugger
 * Tools for debugging button events and interactions
 */

let debugTool;

// Check if we're in a Node.js environment
const isNode = typeof window === 'undefined';

if (isNode) {
    // Import debugTool in Node.js environment
    debugTool = require('../debugTool');
} else {
    // In browser, use the global debugTool
    debugTool = window.debugTool || console;
}

/**
 * Tracks a button's click events
 * @param {HTMLElement} button - The button to track
 * @param {string} buttonName - Name to identify this button in logs
 */
function trackButton(button, buttonName) {
    if (!button) {
        debugTool.logWarning(`Button "${buttonName}" not found`);
        return;
    }
    
    debugTool.logInfo(`Tracking button: ${buttonName}`);
    
    button.addEventListener('click', () => {
        debugTool.logInfo(`Button clicked: ${buttonName}`);
    });
    
    // Add a subtle indicator that the button is being tracked
    const originalBorder = button.style.border;
    button.style.border = '1px solid rgba(0, 255, 0, 0.2)';
    
    // Return a function to stop tracking
    return () => {
        button.style.border = originalBorder;
        debugTool.logInfo(`Stopped tracking: ${buttonName}`);
    };
}

/**
 * Tracks all buttons within a container
 * @param {HTMLElement} container - Container element to search for buttons
 * @param {string} containerName - Name to identify this container in logs
 */
function trackAllButtons(container, containerName = 'unnamed-container') {
    if (!container) {
        debugTool.logWarning(`Container "${containerName}" not found`);
        return [];
    }
    
    const buttons = container.querySelectorAll('button');
    const stopFunctions = [];
    
    debugTool.logInfo(`Tracking ${buttons.length} buttons in ${containerName}`);
    
    buttons.forEach((button, index) => {
        const buttonName = button.textContent.trim() || 
                          button.id || 
                          button.className || 
                          `${containerName}-button-${index}`;
        
        const stopTracking = trackButton(button, buttonName);
        stopFunctions.push(stopTracking);
    });
    
    // Return a function to stop tracking all buttons
    return () => {
        stopFunctions.forEach(stopFn => stopFn());
        debugTool.logInfo(`Stopped tracking all buttons in ${containerName}`);
    };
}

/**
 * Highlights buttons being tracked for visual debugging
 * @param {HTMLElement} container - Container with buttons
 * @param {boolean} highlight - Whether to add or remove highlighting
 */
function highlightTrackedButtons(container, highlight = true) {
    if (!container) {
        debugTool.logWarning('Container not found for button highlighting');
        return;
    }
    
    const buttons = container.querySelectorAll('button');
    
    buttons.forEach(button => {
        if (highlight) {
            button.dataset.debugHighlight = 'true';
            button.style.boxShadow = '0 0 3px 2px rgba(0, 255, 0, 0.3)';
        } else {
            delete button.dataset.debugHighlight;
            button.style.boxShadow = '';
        }
    });
    
    debugTool.logInfo(`${highlight ? 'Highlighted' : 'Removed highlights from'} ${buttons.length} buttons`);
}

// Export functions
if (isNode) {
    module.exports = {
        trackButton,
        trackAllButtons,
        highlightTrackedButtons
    };
} else {
    // For browser usage with ES modules
    export {
        trackButton,
        trackAllButtons,
        highlightTrackedButtons
    };
} 