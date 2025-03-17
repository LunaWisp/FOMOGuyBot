/**
 * Formatter Utilities
 * Common formatting functions for the TokenTracker module
 */

/**
 * Shortens a blockchain address for display
 * @param {string} address - The blockchain address to shorten
 * @returns {string} The shortened address
 */
export function shortenAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

/**
 * Formats a price with proper decimal places
 * @param {number} price - The price to format
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted price
 */
export function formatPrice(price, decimals = 4) {
    return (price || 0).toFixed(decimals);
}

/**
 * Formats a percentage change with proper sign and decimal places
 * @param {number} change - The percentage change
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage with sign
 */
export function formatPercentage(change, decimals = 2) {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(decimals)}%`;
}

/**
 * Gets the CSS class for a price change
 * @param {number} change - The percentage change
 * @returns {string} The CSS class name
 */
export function getPriceChangeClass(change) {
    return change > 0 ? 'positive' : (change < 0 ? 'negative' : 'neutral');
}

/**
 * Formats a timestamp to local time string
 * @param {number} timestamp - The timestamp in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

/**
 * Formats a number with thousands separators and optional abbreviation
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {boolean} abbreviate - Whether to abbreviate large numbers (default: false)
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 0, abbreviate = false) {
    if (num === null || num === undefined) return 'N/A';
    
    // Format with abbreviation for large numbers
    if (abbreviate && Math.abs(num) >= 1000000000) {
        return (num / 1000000000).toFixed(decimals) + 'B';
    } else if (abbreviate && Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(decimals) + 'M';
    } else if (abbreviate && Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(decimals) + 'K';
    }
    
    // Format with locale-specific thousands separators
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
} 