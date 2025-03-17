/**
 * Dynamic Tracker
 * Tracks dynamic changes to the DOM
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
 * Track dynamically added buttons in the DOM
 * @param {HTMLElement} container - Container to observe
 * @param {Object} options - Configuration options
 * @param {boolean} options.highlight - Whether to highlight tracked buttons
 * @param {boolean} options.logClicks - Whether to log clicks
 */
function trackDynamicButtons(container = document.body, options = {}) {
    if (isNode) {
        debugTool.logWarning('Cannot track dynamic buttons in Node.js environment');
        return;
    }
    
    const highlight = options.highlight !== false;
    const logClicks = options.logClicks !== false;
    
    debugTool.logInfo(`Starting to track dynamic buttons in ${container.tagName || 'document.body'}`);
    
    const clickListeners = new Map();
    
    // Process a button element
    function processButton(button) {
        if (clickListeners.has(button)) {
            return; // Already processed
        }
        
        const buttonName = button.textContent?.trim() || 
                         button.id || 
                         button.name || 
                         button.className || 
                         'unnamed-button';
        
        if (highlight) {
            // Add visual indicator
            const originalBoxShadow = button.style.boxShadow;
            button.style.boxShadow = '0 0 2px 1px rgba(0, 255, 0, 0.2)';
            button.dataset.dynamicTracked = 'true';
        }
        
        if (logClicks) {
            // Add click listener
            const clickHandler = () => {
                debugTool.logInfo(`Dynamic button clicked: ${buttonName}`);
            };
            
            button.addEventListener('click', clickHandler);
            clickListeners.set(button, clickHandler);
        }
        
        debugTool.logInfo(`Tracking dynamic button: ${buttonName}`);
    }
    
    // Process existing buttons
    container.querySelectorAll('button').forEach(processButton);
    
    // Create an observer to monitor for new buttons
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    // Check if node is a button
                    if (node.nodeType === 1 && node.tagName === 'BUTTON') {
                        processButton(node);
                    }
                    
                    // Check for buttons within added nodes
                    if (node.nodeType === 1 && node.querySelectorAll) {
                        node.querySelectorAll('button').forEach(processButton);
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(container, {
        childList: true,
        subtree: true
    });
    
    // Return a function to stop tracking
    return () => {
        observer.disconnect();
        
        // Clean up click listeners
        clickListeners.forEach((listener, button) => {
            button.removeEventListener('click', listener);
            
            if (highlight && button.dataset.dynamicTracked === 'true') {
                button.style.boxShadow = '';
                delete button.dataset.dynamicTracked;
            }
        });
        
        clickListeners.clear();
        debugTool.logInfo('Stopped tracking dynamic buttons');
    };
}

/**
 * Track all DOM changes in a container
 * @param {HTMLElement} container - Container to observe
 * @param {Object} options - Options for tracking
 * @param {Array<string>} options.ignoreAttributes - Attributes to ignore
 * @param {number} options.throttleMs - Throttle reporting in milliseconds
 */
function trackDOMChanges(container = document.body, options = {}) {
    if (isNode) {
        debugTool.logWarning('Cannot track DOM changes in Node.js environment');
        return;
    }
    
    const ignoreAttributes = options.ignoreAttributes || ['class', 'style'];
    const throttleMs = options.throttleMs || 1000; // Default throttle is 1 second
    
    debugTool.logInfo(`Starting to track DOM changes in ${container.tagName || 'document.body'}`);
    
    let pendingChanges = [];
    let throttleTimeout = null;
    
    // Process and log changes
    function processChanges() {
        if (pendingChanges.length === 0) return;
        
        debugTool.logInfo(`${pendingChanges.length} DOM changes detected`);
        console.log('DOM changes:', pendingChanges);
        
        pendingChanges = [];
        throttleTimeout = null;
    }
    
    // Create an observer to monitor for DOM changes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            // Skip ignored attribute changes
            if (mutation.type === 'attributes' && 
                ignoreAttributes.includes(mutation.attributeName)) {
                return;
            }
            
            // Create a change record
            const change = {
                type: mutation.type,
                timestamp: new Date().toISOString()
            };
            
            if (mutation.target) {
                change.target = {
                    tagName: mutation.target.tagName,
                    id: mutation.target.id,
                    className: mutation.target.className
                };
            }
            
            if (mutation.type === 'attributes') {
                change.attribute = {
                    name: mutation.attributeName,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.getAttribute(mutation.attributeName)
                };
            } else if (mutation.type === 'childList') {
                change.childList = {
                    addedNodes: mutation.addedNodes.length,
                    removedNodes: mutation.removedNodes.length
                };
            }
            
            pendingChanges.push(change);
            
            // Throttle reporting
            if (!throttleTimeout) {
                throttleTimeout = setTimeout(processChanges, throttleMs);
            }
        });
    });
    
    // Start observing
    observer.observe(container, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
    
    // Return a function to stop tracking
    return () => {
        observer.disconnect();
        
        if (throttleTimeout) {
            clearTimeout(throttleTimeout);
            processChanges(); // Process any pending changes
        }
        
        debugTool.logInfo('Stopped tracking DOM changes');
    };
}

// Export functions
if (isNode) {
    module.exports = {
        trackDynamicButtons,
        trackDOMChanges
    };
} else {
    // For browser usage with ES modules
    export {
        trackDynamicButtons,
        trackDOMChanges
    };
} 