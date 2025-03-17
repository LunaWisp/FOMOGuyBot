/**
 * Alert Handlers Module
 * Handles token alert functionality
 */

import { debugTool } from '../../../utils/debug';

/**
 * Sets up event listeners for alert management
 * @param {HTMLElement} container - The container element
 * @param {Object} callbacks - Callback functions for various events
 */
export function setupAlertHandlers(container, callbacks) {
    const { onClearAlerts } = callbacks;
    
    const clearAlertsBtn = container.querySelector('.clear-alerts-btn');
    
    if (clearAlertsBtn) {
        debugTool.logInfo('Setting up alert handlers');
        
        clearAlertsBtn.addEventListener('click', () => {
            debugTool.logInfo('Clear alerts button clicked');
            
            if (typeof onClearAlerts === 'function') {
                onClearAlerts();
            } else {
                debugTool.logError('onClearAlerts callback is not defined');
            }
        });
    } else {
        debugTool.logWarning('Clear alerts button not found in container');
    }
} 