/**
 * Token Tracker Page Module
 * Main entry point for the Token Tracker functionality
 */

const { BasePage } = require('../common/index.js');
const { TokenTrackerCore } = require('./core/index.js');
const { debugTool } = require('../../utils/debug/index.js');

export class TokenTrackerPage extends BasePage {
    constructor() {
        super('token-tracker');
        
        // Initialize core functionality
        this.core = new TokenTrackerCore();
    }
    
    /**
     * Initialize the token tracker page
     */
    initialize() {
        debugTool.logInfo('Initializing TokenTrackerPage');
        
        // Call base initialize to set up container
        super.initialize();
        
        // Initialize core functionality
        this.core.initialize();
    }
    
    /**
     * Clean up resources when leaving the page
     */
    cleanup() {
        debugTool.logInfo('Cleaning up TokenTrackerPage');
        
        // Clean up core functionality
        this.core.cleanup();
        
        // Call base cleanup
        super.cleanup();
    }
}

/**
 * Load the token tracker page
 * @returns {TokenTrackerPage} The token tracker page instance
 */
export function loadTokenTracker() {
    console.log('Loading token tracker page');
    try {
        const tokenTrackerPage = new TokenTrackerPage();
        tokenTrackerPage.initialize();
        return tokenTrackerPage;
    } catch (error) {
        console.error('Error loading token tracker page:', error);
        throw error;
    }
} 