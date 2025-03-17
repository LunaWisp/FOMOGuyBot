/**
 * Debug Tools Index
 * Exports all debugging utilities
 */

// Detect environment
const isNode = typeof window === 'undefined' && typeof process !== 'undefined';

// Load debugTool first - it's the core module
let debugTool;
let debugTools;

if (isNode) {
    // Node.js environment - CommonJS exports
    debugTool = require('./debugTool');
    debugTools = require('./debugTools');
    
    // Initialize live logging for Node.js
    debugTools.initConsoleLogger();
    
    // Server-specific debug utilities
    const serverDebug = require('./server');
    
    // Export for Node.js
    module.exports = {
        debugTool,
        debugTools,
        serverDebug
    };
} else {
    // Browser environment
    // Use the global debugTool if available
    debugTool = window.debugTool;
    debugTools = window.debugTools;
    
    // These variables are just for documentation
    const buttonTools = ['trackButton', 'trackAllButtons', 'highlightTrackedButtons'];
    const elementTools = ['inspectElement', 'inspectAllButtons', 'monitorElement', 'findAndInspectElements'];
    const trackerTools = ['trackDynamicButtons', 'trackDOMChanges'];
    const checkTools = ['debugAddTokenButton', 'debugFormSubmission'];
    const utilTools = ['registerGlobalDebugTool', 'applyAllDebugTools', 'cleanupAllDebugTools', 
                      'toggleDebugTool', 'setupPageChangeListeners'];
    
    // Browser-specific exports and functions
    // These will be handled by <script type="module"> in the browser
    
    // Define helper functions for lazy-loading modules
    const getButtonTools = () => import('./tools/buttonDebugger.js');
    const getElementTools = () => import('./tools/elementLogger.js');
    const getTrackerTools = () => import('./trackers/dynamicTracker.js');
    const getCheckTools = () => import('./checks/debugCheck.js');
    const getUtilTools = () => import('./utils/applyToAllPages.js');
    const initDebugPanel = async () => {
        const { debugPanel } = await import('./debugPanel.js');
        return debugPanel;
    };
    
    // Initialize live logging when in browser
    if (debugTools && typeof debugTools.initConsoleLogger === 'function') {
        // Wait until DOM is ready to initialize
        const initLogging = () => {
            debugTools.initConsoleLogger();
            console.log('Live logging initialized for browser');
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLogging);
        } else {
            initLogging();
        }
    }
    
    // Make available globally for traditional scripts
    if (typeof window !== 'undefined') {
        window.debugUtils = {
            debugTool,
            debugTools,
            getButtonTools,
            getElementTools,
            getTrackerTools,
            getCheckTools,
            getUtilTools,
            initDebugPanel
        };
    }
} 