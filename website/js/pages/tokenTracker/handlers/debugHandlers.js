/**
 * Debug Handlers Module
 * Setup and management of debug tools for Token Tracker
 */

const { 
    debugTool, 
    trackAllButtons, 
    inspectAllButtons, 
    highlightTrackedButtons 
} = require('../../../utils/debug/index.js');

/**
 * Set up debug tools for the token tracker
 * @returns {void}
 */
export function setupDebugTools() {
    debugTool.logInfo("Setting up debug tools for TokenTracker");
    
    // Track all buttons in the token tracker container
    if (this.container) {
        const buttonCount = trackAllButtons(this.container, {
            section: 'TokenTracker',
            preventUnhandledEvents: false
        });
        
        debugTool.logInfo(`Tracked ${buttonCount} buttons in TokenTracker`);
        
        // Log detailed info about all buttons
        inspectAllButtons(this.container, 'TokenTracker');
        
        // Add visual indicators for tracked buttons in debug mode
        highlightTrackedButtons(this.container);
        
        // Set up event delegation for all buttons in token tracker
        this.setupEventDelegation();
    } else {
        debugTool.logError("Cannot set up debug tools - container not found");
    }
} 