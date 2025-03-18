/**
 * Token Tracker Page Index
 * Exports the token tracker page components
 */

class TokenTracker {
    constructor() {
        this.tokens = new Map();
        this.initialize();
    }

    async initialize() {
        try {
            // Load saved tokens
            const response = await fetch('/api/tokens');
            if (!response.ok) {
                throw new Error(`Failed to load tokens: ${response.status}`);
            }
            const tokens = await response.json();
            console.log('Loaded tokens:', tokens);
            
            if (Array.isArray(tokens) && tokens.length > 0) {
                tokens.forEach(token => this.tokens.set(token.mintAddress, token));
                this.updateUI();
            } else {
                console.log('No tokens found, adding default token');
                // Add a default token directly for easier testing
                await this.addToken('EdevXsYfsBhQY3BSs1RD6R6izKjHBhj7EBN7446apump');
            }
        } catch (error) {
            console.error('Error initializing token tracker:', error);
            
            // Attempt to add a default token even if loading fails
            try {
                await this.addToken('EdevXsYfsBhQY3BSs1RD6R6izKjHBhj7EBN7446apump');
            } catch (err) {
                console.error('Failed to add default token:', err);
            }
        }

        // Set up WebSocket connection
        this.setupWebSocket();
    }

    setupWebSocket() {
        const ws = new WebSocket(`ws://${window.location.host}/ws`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'tokenAdded':
                    this.tokens.set(data.mintAddress, {
                        mintAddress: data.mintAddress,
                        metadata: data.metadata,
                        price: data.price
                    });
                    this.updateUI();
                    break;
                case 'tokenRemoved':
                    this.tokens.delete(data.mintAddress);
                    this.updateUI();
                    break;
                case 'priceAlert':
                    this.handlePriceAlert(data);
                    break;
                case 'transaction':
                    this.handleTransaction(data);
                    break;
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.setupWebSocket(), 5000);
        };
    }

    async addToken(mintAddress) {
        try {
            console.log(`Attempting to add token: ${mintAddress}`);
            
            // First try direct GET to avoid issues with Content-Type
            let response = await fetch(`/api/token/${mintAddress}`);
            
            // If not found, then try the POST endpoint
            if (response.status === 404) {
                console.log('Token not found, using add endpoint');
                response = await fetch('/api/token/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ address: mintAddress })
                });
            }
            
            if (!response.ok) {
                throw new Error(`Failed to add token: ${response.status}`);
            }
            
            const tokenData = await response.json();
            console.log('Token data received:', tokenData);
            
            if (tokenData.error) {
                throw new Error(tokenData.error);
            }
            
            // Add to local tokens map
            this.tokens.set(mintAddress, {
                mintAddress,
                metadata: tokenData.metadata || {},
                price: tokenData.price || {},
                isFallback: tokenData.isFallback || false
            });
            
            // Update UI
            this.updateUI();
            this.showNotification(`Added token ${tokenData.metadata?.symbol || mintAddress}`, 'success');
            
            return tokenData;
        } catch (error) {
            console.error('Error adding token:', error);
            this.showNotification(`Error adding token: ${error.message}`, 'error');
            throw error;
        }
    }

    async removeToken(mintAddress) {
        try {
            const response = await fetch(`/api/token/${mintAddress}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to remove token');
            }

            this.tokens.delete(mintAddress);
            this.updateUI();
            return true;
        } catch (error) {
            console.error('Error removing token:', error);
            return false;
        }
    }

    handlePriceAlert(alert) {
        // Show price alert notification
        const notification = document.createElement('div');
        notification.className = 'price-alert';
        notification.textContent = `${alert.mintAddress}: ${alert.type === 'increase' ? '+' : '-'}${alert.change}%`;
        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => notification.remove(), 5000);
    }

    handleTransaction(transaction) {
        // Update transaction list if needed
        console.log('New transaction:', transaction);
    }

    showNotification(message, type = 'info') {
        // Find or create feedback element
        let feedback = document.getElementById('token-input-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'token-input-feedback';
            feedback.className = 'input-feedback';
            
            // Find a good place to insert it
            const tokenSection = document.querySelector('.token-section');
            if (tokenSection) {
                tokenSection.insertBefore(feedback, tokenSection.querySelector('.token-list'));
            } else {
                document.body.appendChild(feedback);
            }
        }
        
        // Set message and style
        feedback.textContent = message;
        feedback.className = `input-feedback ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'input-feedback';
        }, 5000);
    }

    updateUI() {
        const tokenGrid = document.getElementById('tracked-tokens');
        if (!tokenGrid) return;

        // Clear existing content except the empty state
        const emptyState = document.getElementById('empty-tokens');
        tokenGrid.innerHTML = '';
        
        if (this.tokens.size === 0) {
            if (emptyState) {
                tokenGrid.appendChild(emptyState);
            }
            console.log('No tokens to display. Attempting fallback display...');
            this.displayFallbackToken();
            return;
        }

        console.log('Displaying', this.tokens.size, 'tokens');
        
        // Add token cards - using Promise.all to handle all async createTokenElement calls
        const tokenPromises = Array.from(this.tokens.values()).map(token => 
            this.createTokenCard(token)
        );
        
        Promise.all(tokenPromises).then(cards => {
            cards.forEach(card => {
                if (card) {
                    console.log('Adding card to DOM:', card);
                    tokenGrid.appendChild(card);
                }
            });
        }).catch(error => {
            console.error('Error creating token cards:', error);
            this.showNotification('Error creating token cards', 'error');
            this.displayFallbackToken();
        });
    }

    async createTokenCard(token) {
        try {
            // Import the component modules
            const { createTokenElement } = await import('./components/tokenCard.js');
            
            // Create token card with real data (no mock data)
            return await createTokenElement(token);
        } catch (error) {
            console.error('Error creating token card:', error);
            
            // Create a minimal fallback card without mocks (just showing error)
            const card = document.createElement('div');
            card.className = 'token-card error';
            
            if (!token || !token.mintAddress) {
                console.error('Invalid token data:', token);
                return null;
            }
            
            card.innerHTML = `
                <div class="token-header">
                    <h3>Error Loading Token</h3>
                    <button class="remove-token" data-address="${token.mintAddress}">×</button>
                </div>
                <div class="token-error-content">
                    <p>Could not load token data</p>
                    <p class="token-address">${token.mintAddress}</p>
                </div>
            `;
            
            // Add event listener for remove button
            const removeButton = card.querySelector('.remove-token');
            if (removeButton) {
                removeButton.addEventListener('click', () => this.removeToken(token.mintAddress));
            }
            
            return card;
        }
    }

    // Absolute last resort fallback - create a hardcoded token card
    displayFallbackToken() {
        console.log('FALLBACK: Creating hardcoded token card');
        const tokenGrid = document.getElementById('tracked-tokens');
        if (!tokenGrid) return;
        
        const card = document.createElement('div');
        card.className = 'token-card fallback-data';
        card.innerHTML = `
            <div class="token-header">
                <div class="token-info">
                    <img src="https://via.placeholder.com/32?text=T" alt="Token" class="token-logo">
                    <div class="token-name-symbol">
                        <h3 class="token-name">Fallback Token</h3>
                        <span class="token-symbol">FALLBACK</span>
                    </div>
                </div>
                <div class="token-price">
                    <span class="price-value">$0.001234</span>
                    <span class="price-change neutral">0.00%</span>
                </div>
            </div>
            <div class="token-metadata">
                <div class="metadata-item">
                    <span class="label">Volume 24h</span>
                    <span class="value">N/A</span>
                </div>
                <div class="metadata-item">
                    <span class="label">Market Cap</span>
                    <span class="value">N/A</span>
                </div>
                <div class="metadata-item">
                    <span class="label">Address</span>
                    <span class="value token-address">EdevXs...pump</span>
                </div>
            </div>
            <div class="token-actions">
                <button class="view-analytics" title="View Analytics">📈</button>
                <button class="remove-token" title="Remove Token">❌</button>
            </div>
            <div class="fallback-warning">Hardcoded fallback token</div>
        `;
        
        tokenGrid.appendChild(card);
    }
}

// Initialize token tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing TokenTracker');
    
    // Create globally accessible instance for debugging
    window.tokenTracker = new TokenTracker();
    const tokenTracker = window.tokenTracker;

    // Add event listeners for token search and add
    const searchBtn = document.getElementById('search-btn');
    const tokenSearch = document.getElementById('token-search');
    const addTokenBtn = document.getElementById('add-token-btn');
    const tokenInput = document.getElementById('token-input');
    
    // Test direct track button
    const testTrackBtn = document.getElementById('test-track-token');
    const testTokenAddress = document.getElementById('test-token-address');

    console.log('Search button:', searchBtn);
    console.log('Add token button:', addTokenBtn);
    console.log('Test track button:', testTrackBtn);
    
    // FORCE IMMEDIATE FALLBACK DISPLAY
    console.log('Forcing immediate token display');
    const tokenDisplay = () => {
        const tokenGrid = document.getElementById('tracked-tokens');
        if (!tokenGrid) {
            console.log('Cannot find token grid, retrying in 500ms');
            setTimeout(tokenDisplay, 500);
            return;
        }
        
        // Force a token in
        const hardcodedToken = {
            mintAddress: 'EdevXsYfsBhQY3BSs1RD6R6izKjHBhj7EBN7446apump',
            metadata: {
                name: 'Test Token',
                symbol: 'TEST',
                image: 'https://via.placeholder.com/32?text=T',
            },
            price: {
                price: 0.001234,
                priceChange24h: 0,
            },
            isFallback: true
        };
        
        try {
            // Check if empty state exists
            const emptyState = document.getElementById('empty-tokens');
            if (emptyState) {
                tokenGrid.removeChild(emptyState);
            }
            
            // Create and add the token card directly
            const card = document.createElement('div');
            card.className = 'token-card fallback-data';
            card.innerHTML = `
                <div class="token-header">
                    <div class="token-info">
                        <img src="https://via.placeholder.com/32?text=T" alt="Token" class="token-logo">
                        <div class="token-name-symbol">
                            <h3 class="token-name">Direct Token</h3>
                            <span class="token-symbol">TEST</span>
                        </div>
                    </div>
                    <div class="token-price">
                        <span class="price-value">$0.001234</span>
                        <span class="price-change neutral">0.00%</span>
                    </div>
                </div>
                <div class="token-metadata">
                    <div class="metadata-item">
                        <span class="label">Volume 24h</span>
                        <span class="value">N/A</span>
                    </div>
                    <div class="metadata-item">
                        <span class="label">Market Cap</span>
                        <span class="value">N/A</span>
                    </div>
                    <div class="metadata-item">
                        <span class="label">Address</span>
                        <span class="value token-address">EdevXs...pump</span>
                    </div>
                </div>
                <div class="token-actions">
                    <button class="view-analytics" title="View Analytics">📈</button>
                    <button class="remove-token" title="Remove Token">❌</button>
                </div>
                <div class="fallback-warning">Direct DOM insertion</div>
            `;
            
            tokenGrid.appendChild(card);
            console.log('Direct token card added:', card);
        } catch (error) {
            console.error('Error adding direct token card:', error);
        }
    };
    
    // Call immediately and with a delay
    tokenDisplay();
    setTimeout(tokenDisplay, 1000);
    
    // Regular event listeners
    if (searchBtn && tokenSearch) {
        searchBtn.addEventListener('click', async () => {
            const query = tokenSearch.value.trim();
            if (query) {
                console.log('Search clicked for:', query);
                // Search functionality goes here
                tokenSearch.value = '';
            }
        });
    }

    if (addTokenBtn && tokenInput) {
        addTokenBtn.addEventListener('click', async () => {
            const address = tokenInput.value.trim();
            if (address) {
                try {
                    console.log('Add token clicked for:', address);
                    await tokenTracker.addToken(address);
                    tokenInput.value = '';
                } catch (error) {
                    console.error('Error adding token:', error);
                    // Show error in UI
                    const feedback = document.getElementById('token-input-feedback');
                    if (feedback) {
                        feedback.textContent = `Error: ${error.message}`;
                        feedback.className = 'input-feedback error';
                        setTimeout(() => {
                            feedback.textContent = '';
                            feedback.className = 'input-feedback';
                        }, 5000);
                    }
                }
            }
        });
    }
    
    // Add event listener for test track button
    if (testTrackBtn && testTokenAddress) {
        testTrackBtn.addEventListener('click', async () => {
            console.log('Test track button clicked');
            const address = testTokenAddress.value.trim();
            if (address) {
                try {
                    console.log('Test track clicked for:', address);
                    // Create or get the feedback element
                    let feedback = document.querySelector('.test-message');
                    if (!feedback) {
                        feedback = document.createElement('div');
                        feedback.className = 'test-message';
                        testTrackBtn.parentNode.appendChild(feedback);
                    }
                    
                    feedback.textContent = 'Tracking token...';
                    feedback.className = 'test-message info';
                    
                    const result = await tokenTracker.addToken(address);
                    console.log('Token tracking result:', result);
                    
                    feedback.textContent = 'Token added successfully';
                    feedback.className = 'test-message success';
                } catch (error) {
                    console.error('Error in test track:', error);
                    
                    // Show error message
                    let feedback = document.querySelector('.test-message');
                    if (feedback) {
                        feedback.textContent = 'Error: ' + error.message;
                        feedback.className = 'test-message error';
                    }
                }
            }
        });
    }
});

// Create a TokenTrackerPage class for external use
class TokenTrackerPage {
    initialize() {
        console.log('TokenTrackerPage initialized via class');
        // The actual initialization happens in the DOMContentLoaded event
    }
    
    cleanup() {
        console.log('TokenTrackerPage cleanup');
    }
}

export { TokenTracker, TokenTrackerPage }; 