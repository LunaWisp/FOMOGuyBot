/**
 * UI Utilities
 * Common UI helper functions for the TokenTracker module
 */

/**
 * Shows an error message that disappears after a timeout
 * @param {string} message - The error message to display
 * @param {number} timeout - Time in milliseconds before disappearing (default: 5000)
 */
export function showError(message, timeout = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), timeout);
}

/**
 * Shows a notification message that disappears after a timeout
 * @param {string} message - The notification message to display
 * @param {string} type - The type of notification (info, success, warning, error)
 * @param {number} timeout - Time in milliseconds before disappearing (default: 3000)
 */
export function showNotification(message, type = 'info', timeout = 3000) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification ${type}`;
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);
    
    // Add fade-in animation
    notificationDiv.classList.add('fade-in');
    
    // Auto-remove after timeout
    setTimeout(() => {
        notificationDiv.classList.add('fade-out');
        setTimeout(() => notificationDiv.remove(), 500);
    }, timeout);
}

/**
 * Filters an array of tokens based on search term and filter criteria
 * @param {Array} tokens - The tokens array
 * @param {string} searchTerm - The search term to filter by
 * @param {string} filterType - The type of filter to apply (all, positive, negative)
 * @returns {Array} Filtered tokens array
 */
export function filterTokens(tokens, searchTerm, filterType) {
    return tokens.filter(token => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            token.name.toLowerCase().includes(searchTerm) || 
            token.symbol.toLowerCase().includes(searchTerm) ||
            token.address.toLowerCase().includes(searchTerm);
        
        // Price change filter
        let matchesFilter = true;
        if (filterType === 'positive') {
            matchesFilter = token.change24h > 0;
        } else if (filterType === 'negative') {
            matchesFilter = token.change24h < 0;
        }
        
        return matchesSearch && matchesFilter;
    });
}

/**
 * Filters transactions based on transaction type
 * @param {Array} transactions - The transactions array
 * @param {string} filterType - The type of filter to apply (all, buy, sell)
 * @returns {Array} Filtered transactions array
 */
export function filterTransactions(transactions, filterType) {
    if (filterType === 'all') return transactions;
    return transactions.filter(tx => tx.type === filterType);
} 