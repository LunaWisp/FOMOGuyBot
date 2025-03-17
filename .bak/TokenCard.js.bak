/**
 * Token Card Component
 * Renders token cards and list items
 */
import { shortenAddress, formatPrice, formatPercentage, getPriceChangeClass, formatNumber } from '../utils/formatters.js';

/**
 * Creates a token element (card or list item)
 * @param {Object} token - The token data object
 * @param {string} viewMode - The view mode ('card' or 'list')
 * @returns {HTMLElement} The created token element
 */
export function createTokenElement(token, viewMode) {
    // Create a token card or list item depending on the current view
    const element = document.createElement('div');
    element.id = `token-${token.id}`;
    element.className = viewMode === 'card' ? 'token-card' : 'token-item';
    element.setAttribute('data-token-id', token.id);
    
    // Determine price change class
    const changeClass = getPriceChangeClass(token.change24h);
    const formattedPrice = formatPrice(token.price);
    const formattedChange = formatPercentage(token.change24h);
    
    // Format additional metadata if available
    const formattedVolume = token.volume24h ? formatNumber(token.volume24h, 2, true) : 'N/A';
    const formattedMarketCap = token.marketCap ? formatNumber(token.marketCap, 2, true) : 'N/A';
    
    // Generate risk indicator if available from bot analysis
    let riskIndicator = '';
    if (token.botAnalysis) {
        const riskScore = token.botAnalysis.riskScore || 0;
        let riskLevel, riskClass;
        
        if (riskScore < 30) {
            riskLevel = 'Low Risk';
            riskClass = 'risk-low';
        } else if (riskScore < 70) {
            riskLevel = 'Medium Risk';
            riskClass = 'risk-medium';
        } else {
            riskLevel = 'High Risk';
            riskClass = 'risk-high';
        }
        
        riskIndicator = `<div class="risk-indicator ${riskClass}" title="Bot Analysis: ${riskScore}/100">${riskLevel}</div>`;
    }
    
    // Format last updated time if available
    const lastUpdated = token.lastUpdated ? new Date(token.lastUpdated).toLocaleTimeString() : '';
    const updateInfo = lastUpdated ? `<div class="update-time">Updated: ${lastUpdated}</div>` : '';
    
    // Check if token is being tracked by bot
    const trackedByBot = token.trackedBy ? `<div class="tracked-by">Tracked by: ${token.trackedBy}</div>` : '';
    
    if (viewMode === 'card') {
        element.innerHTML = `
            <div class="token-header">
                <span class="token-symbol">${token.symbol}</span>
                <span class="token-change ${changeClass}">${formattedChange}</span>
                ${riskIndicator}
            </div>
            <div class="token-name">${token.name}</div>
            <div class="token-details">
                <div class="token-price">$${formattedPrice}</div>
                <div class="token-address" title="${token.address}">${shortenAddress(token.address)}</div>
            </div>
            <div class="token-metadata">
                <div class="metadata-item">
                    <span class="metadata-label">Volume 24h:</span>
                    <span class="metadata-value">$${formattedVolume}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Market Cap:</span>
                    <span class="metadata-value">$${formattedMarketCap}</span>
                </div>
                ${token.holderCount ? `
                <div class="metadata-item">
                    <span class="metadata-label">Holders:</span>
                    <span class="metadata-value">${formatNumber(token.holderCount)}</span>
                </div>` : ''}
            </div>
            ${updateInfo}
            ${trackedByBot}
            <div class="token-actions">
                <button class="view-analytics-btn" data-token-id="${token.id}">Analytics</button>
                <button class="remove-token" data-token-id="${token.id}">Remove</button>
            </div>
        `;
    } else {
        element.innerHTML = `
            <div class="token-info">
                <div class="token-symbol">${token.symbol}</div>
                <div class="token-name">${token.name}</div>
                ${riskIndicator}
            </div>
            <div class="token-price">$${formattedPrice}</div>
            <div class="token-change ${changeClass}">${formattedChange}</div>
            <div class="token-volume">$${formattedVolume}</div>
            <div class="token-actions">
                <button class="view-analytics-btn" data-token-id="${token.id}">Analytics</button>
                <button class="remove-token" data-token-id="${token.id}">Remove</button>
            </div>
        `;
    }
    
    // Add click handler for the analytics button
    setTimeout(() => {
        const analyticsBtn = element.querySelector('.view-analytics-btn');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Show token analytics modal
                showTokenAnalytics(token);
            });
        }
    }, 0);
    
    return element;
}

/**
 * Shows a modal with detailed token analytics
 * @param {Object} token - The token data
 */
function showTokenAnalytics(token) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    // Format data for display
    const formattedPrice = formatPrice(token.price);
    const formattedChange = formatPercentage(token.change24h);
    const changeClass = getPriceChangeClass(token.change24h);
    const formattedVolume = token.volume24h ? formatNumber(token.volume24h, 2, true) : 'N/A';
    const formattedMarketCap = token.marketCap ? formatNumber(token.marketCap, 2, true) : 'N/A';
    
    // Generate bot analysis section if available
    let botAnalysisHtml = '';
    if (token.botAnalysis) {
        const { riskScore, liquidity, liquidityLocked, ownershipRenounced } = token.botAnalysis;
        
        botAnalysisHtml = `
            <div class="analytics-section">
                <h3>Bot Analysis</h3>
                <div class="analytics-grid">
                    <div class="analytics-item">
                        <span class="analytics-label">Risk Score:</span>
                        <span class="analytics-value">${riskScore}/100</span>
                    </div>
                    <div class="analytics-item">
                        <span class="analytics-label">Liquidity:</span>
                        <span class="analytics-value">$${formatNumber(liquidity, 2, true)}</span>
                    </div>
                    <div class="analytics-item">
                        <span class="analytics-label">Liquidity Locked:</span>
                        <span class="analytics-value ${liquidityLocked ? 'positive' : 'negative'}">${liquidityLocked ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="analytics-item">
                        <span class="analytics-label">Ownership Renounced:</span>
                        <span class="analytics-value ${ownershipRenounced ? 'positive' : 'negative'}">${ownershipRenounced ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Generate social metrics section if available
    let socialMetricsHtml = '';
    if (token.twitterFollowers || token.discordMembers) {
        socialMetricsHtml = `
            <div class="analytics-section">
                <h3>Social Metrics</h3>
                <div class="analytics-grid">
                    ${token.twitterFollowers ? `
                    <div class="analytics-item">
                        <span class="analytics-label">Twitter Followers:</span>
                        <span class="analytics-value">${formatNumber(token.twitterFollowers)}</span>
                    </div>` : ''}
                    ${token.discordMembers ? `
                    <div class="analytics-item">
                        <span class="analytics-label">Discord Members:</span>
                        <span class="analytics-value">${formatNumber(token.discordMembers)}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
    }
    
    // Create modal content
    modalContainer.innerHTML = `
        <div class="modal-content token-analytics-modal">
            <div class="modal-header">
                <h2>${token.name} (${token.symbol}) Analytics</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="analytics-overview">
                    <div class="token-price-large">$${formattedPrice}</div>
                    <div class="token-change-large ${changeClass}">${formattedChange}</div>
                </div>
                
                <div class="analytics-section">
                    <h3>Token Information</h3>
                    <div class="analytics-grid">
                        <div class="analytics-item">
                            <span class="analytics-label">Address:</span>
                            <span class="analytics-value address">${token.address}</span>
                        </div>
                        <div class="analytics-item">
                            <span class="analytics-label">Volume 24h:</span>
                            <span class="analytics-value">$${formattedVolume}</span>
                        </div>
                        <div class="analytics-item">
                            <span class="analytics-label">Market Cap:</span>
                            <span class="analytics-value">$${formattedMarketCap}</span>
                        </div>
                        ${token.totalSupply ? `
                        <div class="analytics-item">
                            <span class="analytics-label">Total Supply:</span>
                            <span class="analytics-value">${formatNumber(token.totalSupply)}</span>
                        </div>` : ''}
                        ${token.holderCount ? `
                        <div class="analytics-item">
                            <span class="analytics-label">Holders:</span>
                            <span class="analytics-value">${formatNumber(token.holderCount)}</span>
                        </div>` : ''}
                        ${token.launchDate ? `
                        <div class="analytics-item">
                            <span class="analytics-label">Launch Date:</span>
                            <span class="analytics-value">${new Date(token.launchDate).toLocaleDateString()}</span>
                        </div>` : ''}
                    </div>
                </div>
                
                ${botAnalysisHtml}
                ${socialMetricsHtml}
                
                <div class="analytics-footer">
                    <p>Data provided by FOMOBot Token Tracker</p>
                    <p class="update-time">Last updated: ${new Date(token.lastUpdated || Date.now()).toLocaleString()}</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    document.body.appendChild(modalContainer);
    
    // Add event listener to close button
    const closeButton = modalContainer.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        modalContainer.remove();
    });
    
    // Close when clicking outside the modal
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            modalContainer.remove();
        }
    });
} 