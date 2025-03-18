/**
 * Handlers Index
 * Re-exports all event handlers for easy imports
 */

import { setupTokenInputHandlers } from './tokenInputHandler.js';
import { setupSearchHandlers } from './searchHandlers.js';
import { setupViewHandlers } from './viewHandlers.js';
import { setupFilterHandlers } from './filterHandlers.js';
import { setupTokenRemovalHandlers } from './tokenRemovalHandlers.js';
import { setupWebSocketHandlers } from './webSocketHandlers.js';
import { setupAlertHandlers } from './alertHandlers.js';
import { setupDebugHandlers } from './debugHandlers.js';
import { setupEventDelegation } from './eventDelegation.js';

export {
    setupTokenInputHandlers,
    setupSearchHandlers,
    setupViewHandlers,
    setupFilterHandlers,
    setupTokenRemovalHandlers,
    setupWebSocketHandlers,
    setupAlertHandlers,
    setupDebugHandlers,
    setupEventDelegation
}; 