/**
 * Filters tokens based on search term and filter type
 * @param {Array} tokens - The tokens to filter
 * @param {string} searchTerm - The search term
 * @param {string} filterType - The filter type (all, positive, negative)
 * @returns {Array} Filtered tokens
 */
export function filterTokens(tokens, searchTerm, filterType) {
    console.log('Filtering tokens:', { tokenCount: tokens.length, searchTerm, filterType });
    
    if (!tokens || tokens.length === 0) {
        console.log('No tokens to filter');
        return [];
    }
    
    let filtered = [...tokens];
    
    // Apply search term filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        console.log('Applying search filter with term:', term);
        
        filtered = filtered.filter(token => {
            const nameMatch = token.name && token.name.toLowerCase().includes(term);
            const symbolMatch = token.symbol && token.symbol.toLowerCase().includes(term);
            const addressMatch = token.address && token.address.toLowerCase().includes(term);
            
            return nameMatch || symbolMatch || addressMatch;
        });
        
        console.log(`Search filtered tokens: ${filtered.length} remaining`);
    }
    
    // Apply price change filter if needed
    if (filterType && filterType !== 'all') {
        console.log('Applying price change filter:', filterType);
        
        filtered = filtered.filter(token => {
            if (filterType === 'positive') {
                return token.change24h > 0;
            } else if (filterType === 'negative') {
                return token.change24h < 0;
            }
            return true;
        });
        
        console.log(`Price filter results: ${filtered.length} tokens remaining`);
    }
    
    return filtered;
}

/**
 * Filters transactions based on filter type
 * @param {Array} transactions - The transactions to filter
 * @param {string} filterType - The filter type (all, buy, sell)
 * @returns {Array} Filtered transactions
 */
export function filterTransactions(transactions, filterType) {
    if (!transactions || transactions.length === 0) {
        return [];
    }
    
    if (!filterType || filterType === 'all') {
        return transactions;
    }
    
    return transactions.filter(tx => tx.type === filterType);
} 