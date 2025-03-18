/**
 * Tracker Initializer Module
 * Handles initialization, bot management, and polling for the Token Tracker
 */

import { debugTool } from '../../../utils/debug/index.js';
import { showError } from '../utils/index.js';
import { apiService } from '../../../services/api.js';
import { connectWebSocket } from '../handlers/index.js';
import { TokenTrackerCore } from './tokenTrackerCore.js';

let tokenTrackerCore = null;

/**
 * Initialize the Token Tracker
 * @returns {Promise<void>}
 */
export async function initialize() {
    if (tokenTrackerCore?.isInitialized) {
        debugTool.logWarning('TokenTracker already initialized');
        return;
    }

    try {
        debugTool.logInfo('Initializing TokenTracker page');
        
        // Create new instance of TokenTrackerCore
        tokenTrackerCore = new TokenTrackerCore();
        
        // Initialize the core
        await tokenTrackerCore.initialize();
        
        debugTool.logInfo('TokenTracker page initialized successfully');
    } catch (error) {
        debugTool.logError('Failed to initialize TokenTracker:', error);
        showError('Failed to initialize token tracker. Please refresh the page.');
        throw error;
    }
}

/**
 * Start the token tracker bot
 * @returns {Promise<void>}
 */
export async function startBot() {
    if (!tokenTrackerCore) {
        throw new Error('TokenTracker not initialized');
    }

    try {
        await tokenTrackerCore.startBot();
    } catch (error) {
        debugTool.logError('Failed to start bot:', error);
        showError('Failed to start bot. Please try again.');
        throw error;
    }
}

/**
 * Stop the token tracker bot
 * @returns {Promise<void>}
 */
export async function stopBot() {
    if (!tokenTrackerCore) {
        throw new Error('TokenTracker not initialized');
    }

    try {
        await tokenTrackerCore.stopBot();
    } catch (error) {
        debugTool.logError('Failed to stop bot:', error);
        showError('Failed to stop bot. Please try again.');
        throw error;
    }
}

/**
 * Clean up resources when the page is unloaded
 * @returns {Promise<void>}
 */
export async function cleanup() {
    if (!tokenTrackerCore) {
        return;
    }

    try {
        await tokenTrackerCore.cleanup();
        tokenTrackerCore = null;
    } catch (error) {
        debugTool.logError('Failed to cleanup TokenTracker:', error);
        throw error;
    }
}

/**
 * Get the current token tracker core instance
 * @returns {TokenTrackerCore|null}
 */
export function getTokenTrackerCore() {
    return tokenTrackerCore;
} 