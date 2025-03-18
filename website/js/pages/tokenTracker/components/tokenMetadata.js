/**
 * Creates the metadata section of a token card
 * @param {Object} pairData - The DexScreener pair data
 * @param {string} volume - The formatted volume
 * @param {string} liquidity - The formatted liquidity
 * @param {string} marketCap - The formatted market cap
 * @returns {string} The HTML for the token metadata
 */
function createTokenMetadata(pairData, volume, liquidity, marketCap) {
    // Set default values if data is missing
    const volumeDisplay = volume || 'N/A';
    const liquidityDisplay = liquidity || 'N/A';
    const marketCapDisplay = marketCap || 'N/A';
    const hasTxData = pairData?.buyCount && pairData?.sellCount;
    
    // Calculate buy/sell percentages if data is available
    let buyPercent = 50;
    let sellPercent = 50;
    
    if (hasTxData) {
        const total = pairData.buyCount + pairData.sellCount;
        if (total > 0) {
            buyPercent = (pairData.buyCount / total) * 100;
            sellPercent = (pairData.sellCount / total) * 100;
        }
    }
    
    return `
        <div class="token-metadata">
            <div class="metadata-item">
                <span class="label">Volume 24h</span>
                <span class="value">${volumeDisplay}</span>
            </div>
            <div class="metadata-item">
                <span class="label">Market Cap</span>
                <span class="value">${marketCapDisplay}</span>
            </div>
            <div class="metadata-item">
                <span class="label">Liquidity</span>
                <span class="value">${liquidityDisplay}</span>
            </div>
            ${hasTxData ? `
                <div class="market-activity">
                    <div class="activity-bars">
                        <div class="buy-bar" style="width: ${buyPercent}%"></div>
                        <div class="sell-bar" style="width: ${sellPercent}%"></div>
                    </div>
                    <div class="activity-legend">
                        <span class="buy-legend">Buy: ${pairData.buyCount}</span>
                        <span class="sell-legend">Sell: ${pairData.sellCount}</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

export { createTokenMetadata }; 