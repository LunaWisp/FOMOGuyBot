/**
 * Apply To All Pages Utility
 * Provides functionality to apply debug tools across all pages
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
 * Register a debug tool to be applied to all pages
 * @param {string} name - Name of the debug tool
 * @param {Function} initFunction - Function to initialize the tool
 * @param {Function} cleanupFunction - Function to clean up the tool
 */
function registerGlobalDebugTool(name, initFunction, cleanupFunction) {
    if (isNode) {
        debugTool.logWarning('Cannot register global debug tools in Node.js environment');
        return;
    }
    
    // Store in global registry if it doesn't exist
    if (!window._debugToolRegistry) {
        window._debugToolRegistry = {};
    }
    
    window._debugToolRegistry[name] = {
        init: initFunction,
        cleanup: cleanupFunction,
        active: false
    };
    
    debugTool.logInfo(`Registered global debug tool: ${name}`);
}

/**
 * Apply all registered debug tools to the current page
 */
function applyAllDebugTools() {
    if (isNode) {
        debugTool.logWarning('Cannot apply debug tools in Node.js environment');
        return;
    }
    
    if (!window._debugToolRegistry) {
        debugTool.logWarning('No debug tools registered');
        return;
    }
    
    const registry = window._debugToolRegistry;
    
    Object.keys(registry).forEach(toolName => {
        const tool = registry[toolName];
        
        if (!tool.active && typeof tool.init === 'function') {
            try {
                tool.cleanupFunction = tool.init();
                tool.active = true;
                debugTool.logInfo(`Applied debug tool: ${toolName}`);
            } catch (error) {
                debugTool.logError(`Failed to apply debug tool ${toolName}: ${error.message}`);
            }
        }
    });
}

/**
 * Clean up all active debug tools
 */
function cleanupAllDebugTools() {
    if (isNode) {
        debugTool.logWarning('Cannot clean up debug tools in Node.js environment');
        return;
    }
    
    if (!window._debugToolRegistry) {
        return;
    }
    
    const registry = window._debugToolRegistry;
    
    Object.keys(registry).forEach(toolName => {
        const tool = registry[toolName];
        
        if (tool.active && typeof tool.cleanupFunction === 'function') {
            try {
                tool.cleanupFunction();
                tool.active = false;
                debugTool.logInfo(`Cleaned up debug tool: ${toolName}`);
            } catch (error) {
                debugTool.logError(`Failed to clean up debug tool ${toolName}: ${error.message}`);
            }
        }
    });
}

/**
 * Toggle a specific debug tool on/off
 * @param {string} toolName - Name of the tool to toggle
 */
function toggleDebugTool(toolName) {
    if (isNode) {
        debugTool.logWarning('Cannot toggle debug tools in Node.js environment');
        return;
    }
    
    if (!window._debugToolRegistry || !window._debugToolRegistry[toolName]) {
        debugTool.logWarning(`Debug tool not found: ${toolName}`);
        return;
    }
    
    const tool = window._debugToolRegistry[toolName];
    
    if (tool.active) {
        if (typeof tool.cleanupFunction === 'function') {
            try {
                tool.cleanupFunction();
                tool.active = false;
                debugTool.logInfo(`Disabled debug tool: ${toolName}`);
            } catch (error) {
                debugTool.logError(`Failed to disable debug tool ${toolName}: ${error.message}`);
            }
        }
    } else {
        if (typeof tool.init === 'function') {
            try {
                tool.cleanupFunction = tool.init();
                tool.active = true;
                debugTool.logInfo(`Enabled debug tool: ${toolName}`);
            } catch (error) {
                debugTool.logError(`Failed to enable debug tool ${toolName}: ${error.message}`);
            }
        }
    }
}

/**
 * Setup page change listening to automatically apply or clean up tools
 * @param {Object} options - Configuration options
 * @param {boolean} options.applyOnLoad - Whether to apply tools on page load
 * @param {boolean} options.cleanupOnUnload - Whether to clean up tools on page unload
 */
function setupPageChangeListeners(options = { applyOnLoad: true, cleanupOnUnload: true }) {
    if (isNode) {
        debugTool.logWarning('Cannot set up page change listeners in Node.js environment');
        return;
    }
    
    if (options.applyOnLoad) {
        window.addEventListener('load', () => {
            applyAllDebugTools();
        });
    }
    
    if (options.cleanupOnUnload) {
        window.addEventListener('beforeunload', () => {
            cleanupAllDebugTools();
        });
    }
    
    // Set up for SPA navigation if applicable
    if (typeof document !== 'undefined') {
        // Check for URL changes (basic SPA detection)
        let lastUrl = window.location.href;
        
        const observer = new MutationObserver(() => {
            if (lastUrl !== window.location.href) {
                debugTool.logInfo('SPA navigation detected');
                lastUrl = window.location.href;
                
                // Clean up old tools
                cleanupAllDebugTools();
                
                // Apply tools for new page
                setTimeout(applyAllDebugTools, 500);
            }
        });
        
        observer.observe(document, { subtree: true, childList: true });
    }
    
    debugTool.logInfo('Page change listeners set up for debug tools');
}

// Export the functions
if (isNode) {
    module.exports = {
        registerGlobalDebugTool,
        applyAllDebugTools,
        cleanupAllDebugTools,
        toggleDebugTool,
        setupPageChangeListeners
    };
} else {
    // Export for browser usage with ES modules
    export {
        registerGlobalDebugTool,
        applyAllDebugTools,
        cleanupAllDebugTools,
        toggleDebugTool,
        setupPageChangeListeners
    };
} 