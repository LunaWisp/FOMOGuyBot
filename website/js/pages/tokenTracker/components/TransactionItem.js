/**
 * Transaction Item Component
 * Renders transaction items
 */
const { shortenAddress, formatTime } = require('../utils/formatters.js');

/**
 * Creates a transaction element
 * @param {Object} tx - The transaction data object
 * @param {Array} tokens - The tokens array to find token details
 * @returns {HTMLElement} The created transaction element
 */
export function createTransactionElement(tx, tokens) {
    const txElement = document.createElement('div');
    txElement.className = `transaction-item ${tx.type || 'unknown'}`;
    
    const timeString = formatTime(tx.timestamp);
    
    // Find token name from tokens list
    const token = tokens.find(t => t.address === tx.tokenAddress || t.id === tx.tokenId);
    const tokenName = token ? token.symbol : 'Unknown';
    
    txElement.innerHTML = `
        <div class="transaction-type">${tx.type || 'TX'}</div>
        <div class="transaction-details">
            <div class="transaction-token">${tokenName}</div>
            <div class="transaction-address" title="${tx.address || ''}">${shortenAddress(tx.address || '')}</div>
        </div>
        <div class="transaction-info">
            <div class="transaction-amount">${tx.amount ? '$' + parseFloat(tx.amount).toFixed(2) : ''}</div>
            <div class="transaction-time">${timeString}</div>
        </div>
    `;
    
    // Add pulse animation to new transactions
    if (Date.now() - tx.timestamp < 10000) {
        txElement.classList.add('pulse-animation');
    }
    
    return txElement;
} 