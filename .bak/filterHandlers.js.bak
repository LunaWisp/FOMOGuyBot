/**
 * Filter Handlers Module
 * Handles token and transaction filtering
 */

import { debugTool } from '../../../utils/debug';

/**
 * Sets up event listeners for token filtering
 * @param {HTMLElement} container - The container element
 * @param {Object} callbacks - Callback functions for various events
 */
export function setupFilterHandlers(container, callbacks) {
    const { onTokenFilterChange, onTransactionFilterChange } = callbacks;
    
    const tokenFilter = document.getElementById('token-filter');
    const transactionFilter = document.getElementById('transaction-filter');
    
    if (tokenFilter) {
        debugTool.logInfo('Setting up token filter handlers');
        
        tokenFilter.addEventListener('change', () => {
            const filterType = tokenFilter.value;
            debugTool.logInfo(`Token filter changed to: ${filterType}`);
            
            if (typeof onTokenFilterChange === 'function') {
                onTokenFilterChange(filterType);
            } else {
                debugTool.logError('onTokenFilterChange callback is not defined');
            }
        });
    } else {
        debugTool.logWarning('Token filter not found in container');
    }
    
    if (transactionFilter) {
        debugTool.logInfo('Setting up transaction filter handlers');
        
        transactionFilter.addEventListener('change', () => {
            const filterType = transactionFilter.value;
            debugTool.logInfo(`Transaction filter changed to: ${filterType}`);
            
            if (typeof onTransactionFilterChange === 'function') {
                onTransactionFilterChange(filterType);
            } else {
                debugTool.logError('onTransactionFilterChange callback is not defined');
            }
        });
    } else {
        debugTool.logWarning('Transaction filter not found in container');
    }
} 