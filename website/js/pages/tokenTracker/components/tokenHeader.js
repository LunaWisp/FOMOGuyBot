/**
 * Creates the header section of a token card
 * @param {Object} token - The token data
 * @param {string} price - The formatted price
 * @param {string} priceChange - The formatted price change
 * @param {Object} pairData - The DexScreener pair data
 * @returns {string} The HTML for the token header
 */
function createTokenHeader(token, price, priceChange, pairData) {
    // Ensure we have default values
    const tokenName = token.name || pairData?.name || 'Unknown Token';
    const tokenSymbol = token.symbol || pairData?.symbol || 'UNKNOWN';
    const tokenLogo = token.logo || pairData?.baseToken?.logoURI || 'https://via.placeholder.com/32?text=' + tokenSymbol.charAt(0);
    
    // Determine price change class
    let changeClass = 'neutral';
    if (pairData?.priceChange24h > 0 || (priceChange && priceChange.includes('+'))) {
        changeClass = 'positive';
    } else if (pairData?.priceChange24h < 0 || (priceChange && priceChange.includes('-'))) {
        changeClass = 'negative';
    }
    
    return `
        <div class="token-header">
            <div class="token-info">
                <img src="${tokenLogo}" alt="${tokenSymbol}" class="token-logo" onerror="this.src='https://via.placeholder.com/32?text=${tokenSymbol.charAt(0)}'; this.onerror=null;">
                <div class="token-name-symbol">
                    <h3 class="token-name">${tokenName}</h3>
                    <span class="token-symbol">${tokenSymbol}</span>
                </div>
            </div>
            <div class="token-price">
                <span class="price-value">${price}</span>
                <span class="price-change ${changeClass}">
                    ${priceChange}
                </span>
            </div>
        </div>
    `;
}

export { createTokenHeader }; 