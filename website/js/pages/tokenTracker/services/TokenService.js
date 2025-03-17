/**
 * Token Service
 * Handles token-related operations
 */
const { apiService } = require('../../../services/api.js');
const { showError, showNotification } = require('../utils/uiUtils.js');

export class TokenService {
    constructor() {
        this.tokens = [];
        // Add some default tokens for testing
        this._addDefaultTokens();
    }

    /**
     * Adds some default tokens for testing
     * @private
     */
    _addDefaultTokens() {
        // Only add default tokens if none exist
        if (this.tokens.length === 0) {
            console.log('Adding default tokens for testing');
            
            // Add some sample tokens
            this.tokens.push({
                id: 'sol-1',
                name: 'Solana',
                symbol: 'SOL',
                address: 'So11111111111111111111111111111111111111112',
                price: 149.32,
                change24h: 5.2,
                volume24h: 1245789.45,
                marketCap: 65432198745,
                lastUpdated: Date.now()
            });
            
            this.tokens.push({
                id: 'bonk-1',
                name: 'Bonk',
                symbol: 'BONK',
                address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
                price: 0.00002341,
                change24h: -2.7,
                volume24h: 987654.32,
                marketCap: 234567890,
                lastUpdated: Date.now()
            });
            
            this.tokens.push({
                id: 'jito-1',
                name: 'Jito',
                symbol: 'JTO',
                address: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
                price: 3.45,
                change24h: 1.2,
                volume24h: 456789.12,
                marketCap: 345678901,
                lastUpdated: Date.now()
            });
            
            console.log(`Added ${this.tokens.length} default tokens`);
        }
    }

    /**
     * Loads tokens from the API
     * @returns {Promise<Array>} A promise that resolves to the loaded tokens
     */
    async loadTokens() {
        try {
            const tokens = await apiService.getTokens();
            
            // If no tokens returned, use our default ones
            if (!tokens || tokens.length === 0) {
                console.log('No tokens returned from API, using defaults');
                return this.tokens;
            }
            
            this.tokens = tokens;
            return tokens;
        } catch (error) {
            console.error('Failed to load tokens:', error);
            showError('Failed to load tokens. Using default tokens.');
            return this.tokens; // Return default tokens on error
        }
    }

    /**
     * Adds a new token
     * @param {string} address - The token address
     * @returns {Promise<Object>} A promise that resolves to the added token
     */
    async addToken(address) {
        console.log(`Adding token with address: ${address}`);
        
        try {
            // First, verify address format
            if (!address || typeof address !== 'string' || address.length < 32) {
                throw new Error('Invalid token address format');
            }
            
            // Check if token is already being tracked
            const existingToken = this.tokens.find(t => 
                t.address.toLowerCase() === address.toLowerCase()
            );
            
            if (existingToken) {
                console.log('Token already being tracked:', existingToken);
                return existingToken;
            }
            
            console.log('Connecting to token tracker bot...');
            
            // Connect to the token tracker bot via API service
            const newToken = await apiService.addToken(address);
            console.log('Token data received from bot:', newToken);
            
            if (!newToken || !newToken.id) {
                throw new Error('Token tracker returned invalid data');
            }
            
            // Fetch additional token metadata
            try {
                const tokenMetadata = await apiService.getTokenMetadata(newToken.id);
                if (tokenMetadata) {
                    // Merge metadata with token data
                    Object.assign(newToken, tokenMetadata);
                    console.log('Enhanced token with metadata:', newToken);
                }
            } catch (metadataError) {
                console.warn('Could not fetch additional token metadata:', metadataError);
                // Continue without metadata, not a critical error
            }
            
            // Add to local tokens array
            this.tokens.push(newToken);
            
            // Show success notification
            showNotification(`Successfully added ${newToken.symbol} to token tracker`, 'success');
            
            // Store the last update time
            newToken.lastUpdated = Date.now();
            
            // Start tracking token for real-time updates
            this._subscribeToTokenUpdates(newToken.id);
            
            return newToken;
        } catch (error) {
            console.error('Error connecting to token tracker:', error);
            showError(error.message || 'Failed to connect to token tracker. Please try again.');
            throw error;
        }
    }
    
    /**
     * Subscribe to real-time updates for a token
     * @param {string} tokenId - The token ID to track
     * @private
     */
    _subscribeToTokenUpdates(tokenId) {
        try {
            console.log(`Subscribing to real-time updates for token ${tokenId}`);
            
            // In a real implementation, this would connect to a WebSocket or similar
            // to get real-time price updates from the bot
            
            // For now, we'll simulate occasional updates
            const intervalId = setInterval(() => {
                const tokenIndex = this.tokens.findIndex(t => t.id === tokenId);
                if (tokenIndex >= 0) {
                    // Simulate a small price change
                    const currentPrice = this.tokens[tokenIndex].price;
                    const change = currentPrice * (Math.random() * 0.02 - 0.01); // -1% to +1%
                    this.tokens[tokenIndex].price = currentPrice + change;
                    this.tokens[tokenIndex].lastUpdated = Date.now();
                    
                    // Log the update
                    console.log(`Token ${tokenId} price updated: ${currentPrice} → ${this.tokens[tokenIndex].price}`);
                } else {
                    // Token no longer exists, stop updates
                    clearInterval(intervalId);
                }
            }, 60000); // Update every minute
            
            return intervalId;
        } catch (error) {
            console.warn('Failed to subscribe to token updates:', error);
            // Non-critical error, so we don't throw
        }
    }
    
    /**
     * Removes a token
     * @param {string} tokenId - The token ID to remove
     * @returns {Promise<void>}
     */
    async removeToken(tokenId) {
        try {
            // Find token before removing it
            const token = this.tokens.find(t => t.id === tokenId);
            
            // Remove token via API
            await apiService.removeToken(tokenId);
            
            // Remove from local array
            this.tokens = this.tokens.filter(t => t.id !== tokenId);
            
            // Show notification if token was found
            if (token) {
                showNotification(`Removed ${token.symbol}`, 'info');
            }
            
            return token;
        } catch (error) {
            console.error('Error removing token:', error);
            showError('Failed to remove token. Please try again.');
            throw error;
        }
    }
    
    /**
     * Searches tokens by term
     * @param {string} searchTerm - The term to search for
     * @returns {Array} Filtered tokens
     */
    searchTokens(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.tokens;
        }
        
        const term = searchTerm.toLowerCase().trim();
        
        return this.tokens.filter(token => 
            token.name.toLowerCase().includes(term) || 
            token.symbol.toLowerCase().includes(term) || 
            token.address.toLowerCase().includes(term)
        );
    }
    
    /**
     * Checks for price alerts based on token price changes
     * @returns {Array} Any generated alerts
     */
    checkForAlerts() {
        const generatedAlerts = [];
        
        try {
            // Compare current prices with previous prices to detect significant changes
            for (const token of this.tokens) {
                // Check localStorage for previous price
                const previousData = localStorage.getItem(`token_${token.id}_data`);
                if (previousData) {
                    try {
                        const data = JSON.parse(previousData);
                        const prevPrice = data.price;
                        const currentPrice = token.price;
                        
                        // If price change is more than 5%, create an alert
                        if (prevPrice > 0 && Math.abs((currentPrice - prevPrice) / prevPrice) >= 0.05) {
                            const increase = currentPrice > prevPrice;
                            const changePercent = Math.abs((currentPrice - prevPrice) / prevPrice * 100).toFixed(2);
                            
                            const alert = {
                                type: 'price',
                                tokenId: token.id,
                                message: `${token.symbol} price ${increase ? 'increased' : 'decreased'} by ${changePercent}%`
                            };
                            
                            generatedAlerts.push(alert);
                        }
                    } catch (parseError) {
                        console.error(`Error parsing previous data for token ${token.id}:`, parseError);
                    }
                }
                
                // Store current price for future comparison
                localStorage.setItem(`token_${token.id}_data`, JSON.stringify({
                    price: token.price,
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error('Error checking for alerts:', error);
        }
        
        return generatedAlerts;
    }
} 