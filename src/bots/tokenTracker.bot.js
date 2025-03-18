import { EventEmitter } from 'events';
import { heliusAPI } from '../api/helius.api.js';
import { terminalUI } from '../utils/terminal.ui.js';

class TokenTrackerBot extends EventEmitter {
    constructor() {
        super();
        this.trackedTokens = new Map(); // mintAddress -> {metadata, lastPrice, subscription}
        this.priceAlertThresholds = new Map(); // mintAddress -> {up: number, down: number}
    }

    async trackToken(mintAddress, priceAlertThreshold = { up: 5, down: 5 }) {
        try {
            terminalUI.startSpinner(`Tracking token ${mintAddress}...`);
            
            // Get initial token data
            let metadata, price;
            try {
                [metadata, price] = await Promise.all([
                    heliusAPI.getTokenMetadata(mintAddress),
                    heliusAPI.getTokenPrice(mintAddress)
                ]);
            } catch (apiError) {
                // Check if error is related to authentication
                if (apiError.response?.status === 401 || 
                    (apiError.message && apiError.message.includes('401')) ||
                    (apiError.response?.data?.error?.message && apiError.response?.data?.error?.message.includes('api key'))) {
                    
                    terminalUI.warning(`API authentication failed. Using fallback data for token ${mintAddress}`);
                    
                    // Create fallback metadata and price data
                    metadata = this.createFallbackMetadata(mintAddress);
                    price = this.createFallbackPrice();
                } else {
                    // Rethrow if not an auth error
                    throw apiError;
                }
            }

            if (!metadata || !price) {
                throw new Error('Failed to fetch token data');
            }

            // Set up price alert thresholds
            this.priceAlertThresholds.set(mintAddress, priceAlertThreshold);

            // Only attempt to subscribe if we're not using fallback data
            let subscription = null;
            if (!metadata.isFallback) {
                try {
                    subscription = await heliusAPI.subscribeToTokenTransactions(
                        mintAddress,
                        this.handleTokenTransaction.bind(this)
                    );
                } catch (subError) {
                    terminalUI.warning(`Failed to subscribe to ${mintAddress} transactions: ${subError.message}`);
                    // Continue without subscription
                }
            }

            // Store token data
            this.trackedTokens.set(mintAddress, {
                metadata,
                lastPrice: price,
                subscription,
                isFallback: metadata.isFallback || false
            });

            this.emit('tokenAdded', {
                mintAddress,
                metadata,
                price
            });

            terminalUI.stopSpinner(true, `Successfully tracking token ${mintAddress}`);
            terminalUI.displayTokenInfo({ mintAddress, metadata, lastPrice: price });

            // Start price monitoring
            this.monitorTokenPrice(mintAddress);

            return {
                mintAddress,
                metadata,
                price
            };
        } catch (error) {
            terminalUI.stopSpinner(false, `Failed to track token ${mintAddress}`);
            terminalUI.displayError(error);
            throw error;
        }
    }

    async getTokenData(mintAddress) {
        try {
            const tokenData = this.trackedTokens.get(mintAddress);
            if (!tokenData) {
                return null;
            }

            // If using fallback data, just return what we have
            if (tokenData.isFallback) {
                return {
                    mintAddress,
                    metadata: tokenData.metadata,
                    price: tokenData.lastPrice,
                    isFallback: true
                };
            }

            // Otherwise, update price data from the API
            try {
                const newPrice = await heliusAPI.getTokenPrice(mintAddress);
                tokenData.lastPrice = newPrice;
                this.trackedTokens.set(mintAddress, tokenData);
            } catch (error) {
                terminalUI.warning(`Error updating price for ${mintAddress}: ${error.message}`);
                // Continue with existing price data
            }

            return {
                mintAddress,
                metadata: tokenData.metadata,
                price: tokenData.lastPrice,
                isFallback: tokenData.isFallback || false
            };
        } catch (error) {
            terminalUI.error(`Error getting token data for ${mintAddress}: ${error.message}`);
            return null;
        }
    }

    async monitorTokenPrice(mintAddress) {
        const checkPrice = async () => {
            try {
                const tokenData = this.trackedTokens.get(mintAddress);
                if (!tokenData) return;
                
                const newPrice = await heliusAPI.getTokenPrice(mintAddress);
                const thresholds = this.priceAlertThresholds.get(mintAddress) || { up: 5, down: 5 };

                if (tokenData.lastPrice) {
                    const oldPrice = tokenData.lastPrice.price;
                    const currentPrice = newPrice.price;
                    
                    if (oldPrice > 0) {
                        const priceChange = ((currentPrice - oldPrice) / oldPrice) * 100;

                        if (Math.abs(priceChange) >= thresholds.up && priceChange > 0) {
                            const alert = {
                                mintAddress,
                                type: 'increase',
                                change: priceChange.toFixed(2),
                                oldPrice: oldPrice,
                                newPrice: currentPrice
                            };
                            this.emit('priceAlert', alert);
                            terminalUI.displayPriceAlert(alert);
                        } else if (Math.abs(priceChange) >= thresholds.down && priceChange < 0) {
                            const alert = {
                                mintAddress,
                                type: 'decrease',
                                change: Math.abs(priceChange).toFixed(2),
                                oldPrice: oldPrice,
                                newPrice: currentPrice
                            };
                            this.emit('priceAlert', alert);
                            terminalUI.displayPriceAlert(alert);
                        }
                    }
                }

                // Update stored price
                tokenData.lastPrice = newPrice;
                this.trackedTokens.set(mintAddress, tokenData);
            } catch (error) {
                terminalUI.error(`Error monitoring price for ${mintAddress}: ${error.message}`);
            }
        };

        // Check price every minute
        setInterval(checkPrice, 60000);
    }

    handleTokenTransaction(transaction) {
        this.emit('transaction', transaction);
        terminalUI.displayTransaction(transaction);
    }

    stopTracking(mintAddress) {
        const tokenData = this.trackedTokens.get(mintAddress);
        if (tokenData && tokenData.subscription) {
            tokenData.subscription.close();
            this.trackedTokens.delete(mintAddress);
            this.priceAlertThresholds.delete(mintAddress);
            this.emit('tokenRemoved', mintAddress);
            terminalUI.info(`Stopped tracking token ${mintAddress}`);
        }
    }

    getTrackedTokens() {
        const tokens = Array.from(this.trackedTokens.entries()).map(([mintAddress, data]) => {
            // Format the token data for display
            const price = data.lastPrice || {};
            const metadata = data.metadata || {};
            
            return {
                mintAddress,
                metadata,
                lastPrice: price,
                symbol: metadata.symbol || 'UNKNOWN',
                price: typeof price.price === 'number' ? price.price.toFixed(6) : 'N/A',
                change24h: price.priceChange24h ? price.priceChange24h.toFixed(2) : '0.00',
                volume24h: price.volume24h ? price.volume24h.toLocaleString() : 'N/A',
                isFallback: data.isFallback || false
            };
        });
        
        terminalUI.displayTokenTable(tokens);
        return tokens;
    }

    // Create fallback metadata when API fails
    createFallbackMetadata(mintAddress) {
        const shortAddress = mintAddress.substring(0, 6) + '...' + mintAddress.substring(mintAddress.length - 4);
        return {
            name: `Token ${shortAddress}`,
            symbol: 'FALLBACK',
            image: 'https://via.placeholder.com/150',
            description: 'Fallback token data due to API authentication error',
            mint: mintAddress,
            decimals: 9,
            isFallback: true
        };
    }

    // Create fallback price data when API fails
    createFallbackPrice() {
        return {
            price: 0.001,
            priceChange24h: 0,
            volume24h: 0,
            marketCap: 0,
            currency: 'USD',
            isFallback: true
        };
    }
}

export const tokenTracker = new TokenTrackerBot(); 