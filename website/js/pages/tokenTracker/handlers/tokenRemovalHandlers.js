/**
 * Token Removal Handlers Module
 * Handles token removal functionality
 */

import { debugTool } from '../../../utils/debug';

/**
 * Sets up event listeners for token removal
 * @param {HTMLElement} container - The container element
 * @param {Object} callbacks - Callback functions for various events
 */
export function setupTokenRemovalHandlers(container, callbacks) {
    const { onRemoveToken } = callbacks;
    
    if (!container) {
        debugTool.logError('Container not found for token removal handlers');
        return;
    }
    
    debugTool.logInfo('Setting up token removal handlers');
    
    // Use event delegation to handle token removal clicks
    container.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-token-btn');
        
        if (removeBtn) {
            e.preventDefault();
            const tokenId = removeBtn.closest('[data-token-id]')?.dataset.tokenId;
            
            if (tokenId) {
                debugTool.logInfo(`Token removal button clicked for token ${tokenId}`);
                
                // Confirm before removing
                if (confirm('Are you sure you want to stop tracking this token?')) {
                    if (typeof onRemoveToken === 'function') {
                        onRemoveToken(tokenId);
                    } else {
                        debugTool.logError('onRemoveToken callback is not defined');
                    }
                } else {
                    debugTool.logInfo('Token removal cancelled by user');
                }
            } else {
                debugTool.logError('Token ID not found for removal button');
            }
        }
    });
} 