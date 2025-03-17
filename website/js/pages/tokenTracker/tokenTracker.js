/**
 * Token Tracker Page Module
 * Main entry point for the Token Tracker functionality
 */

import { BasePage } from '../common/index.js';
import { TokenTrackerCore } from './core/index.js';
import { debugTool } from '../../utils/debug/index.js';

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
     * Clean up when navigating away from the page
     */
    cleanup() {
        // Clean up core resources
        if (this.core) {
            this.core.cleanup();
        }
        
        // Call base cleanup
        super.cleanup();
        
        debugTool.logInfo('TokenTrackerPage cleaned up');
    }
} 