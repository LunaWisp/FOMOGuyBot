/**
 * Simple token card component
 * Creates token cards directly with minimal dependencies
 */

async function createTokenElement(token, viewMode = 'card') {
    console.log('Creating token element for:', token);
    
    // Ensure we have a valid token
    if (!token || (!token.mintAddress && !token.address)) {
        console.error('Invalid token data:', token);
        return createErrorCard('Invalid token data');
    }
    
    const address = token.mintAddress || token.address;
    const metadata = token.metadata || {};
    const price = token.price || token.lastPrice || {};
    
    // Create the card element
    const card = document.createElement('div');
    card.className = 'token-card';
    card.dataset.tokenId = address;
    
    if (token.isFallback) {
        card.classList.add('fallback-data');
    }
    
    // Build card content
    card.innerHTML = `
        <div class="token-header">
            <div class="token-info">
                <img src="${metadata.image || `https://via.placeholder.com/32?text=${(metadata.symbol || '?').charAt(0)}`}" 
                     alt="${metadata.symbol || 'Token'}" 
                     class="token-logo" 
                     onerror="this.src='https://via.placeholder.com/32?text=${(metadata.symbol || '?').charAt(0)}'; this.onerror=null;">
                <div class="token-name-symbol">
                    <h3 class="token-name">${metadata.name || 'Unknown Token'}</h3>
                    <span class="token-symbol">${metadata.symbol || 'UNKNOWN'}</span>
                </div>
            </div>
            <div class="token-price">
                <span class="price-value">$${typeof price.price === 'number' ? price.price.toFixed(6) : '0.000000'}</span>
                <span class="price-change ${getPriceChangeClass(price.priceChange24h)}">
                    ${formatPriceChange(price.priceChange24h)}
                </span>
            </div>
        </div>
        <div class="token-metadata">
            <div class="metadata-item">
                <span class="label">Volume 24h</span>
                <span class="value">${price.volume24h ? '$' + Number(price.volume24h).toLocaleString() : 'N/A'}</span>
            </div>
            <div class="metadata-item">
                <span class="label">Market Cap</span>
                <span class="value">${price.marketCap ? '$' + Number(price.marketCap).toLocaleString() : 'N/A'}</span>
            </div>
            <div class="metadata-item">
                <span class="label">Address</span>
                <span class="value token-address">${shortenAddress(address)}</span>
            </div>
        </div>
        <div class="token-actions">
            <button class="view-analytics" title="View Analytics">📈</button>
            <button class="remove-token" title="Remove Token" data-address="${address}">❌</button>
        </div>
        ${token.isFallback ? '<div class="fallback-warning">Using fallback data</div>' : ''}
    `;
    
    // Add event listeners
    const removeButton = card.querySelector('.remove-token');
    if (removeButton) {
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const tokenId = e.currentTarget.dataset.address;
            console.log('Remove button clicked for:', tokenId);
            
            // Find the TokenTracker instance
            const tokenTracker = window.tokenTracker;
            if (tokenTracker && typeof tokenTracker.removeToken === 'function') {
                tokenTracker.removeToken(tokenId);
            } else {
                // Fallback: just remove the card from DOM
                const card = document.querySelector(`[data-token-id="${tokenId}"]`);
                if (card) card.remove();
            }
        });
    }
    
    return card;
}

function createErrorCard(errorMessage) {
    const card = document.createElement('div');
    card.className = 'token-card error';
    
    card.innerHTML = `
        <div class="token-header">
            <h3>Error Loading Token</h3>
        </div>
        <div class="token-error-content">
            <p>${errorMessage}</p>
        </div>
    `;
    
    return card;
}

// Utility functions
function shortenAddress(address) {
    if (!address) return 'Unknown';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

function formatPriceChange(change) {
    if (change === undefined || change === null) return '0.00%';
    const changeNum = Number(change);
    const sign = changeNum >= 0 ? '+' : '';
    return `${sign}${changeNum.toFixed(2)}%`;
}

function getPriceChangeClass(change) {
    if (!change) return 'neutral';
    const changeNum = Number(change);
    return changeNum >= 0 ? 'positive' : 'negative';
}

// Make the component available
export { createTokenElement, createErrorCard }; 