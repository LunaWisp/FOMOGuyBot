/**
 * View Handlers Module
 * Handles view mode toggling for token display
 */

import { debugTool } from '../../../utils/debug';

/**
 * Sets up event listeners for view mode toggle
 * @param {HTMLElement} container - The container element
 * @param {Object} callbacks - Callback functions for various events
 */
export function setupViewModeHandlers(container, callbacks) {
    const { onViewModeChange } = callbacks;
    
    const viewOptions = container.querySelectorAll('.view-option');
    
    if (viewOptions && viewOptions.length > 0) {
        debugTool.logInfo('Setting up view mode handlers');
        
        viewOptions.forEach(option => {
            option.addEventListener('click', () => {
                const viewMode = option.dataset.view;
                debugTool.logInfo(`View option clicked: ${viewMode}`);
                
                // Update active state in UI
                viewOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Notify callback
                if (typeof onViewModeChange === 'function') {
                    onViewModeChange(viewMode);
                } else {
                    debugTool.logError('onViewModeChange callback is not defined');
                }
            });
        });
    } else {
        debugTool.logWarning('View options not found in container');
    }
} 