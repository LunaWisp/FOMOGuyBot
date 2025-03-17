const heliusAPI = require('../api/helius.api');
const EventEmitter = require('events');
const terminalUI = require('../utils/terminal.ui');

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
            const [metadata, price] = await Promise.all([
                heliusAPI.getTokenMetadata(mintAddress),
                heliusAPI.getTokenPrice(mintAddress)
            ]);

            // Set up price alert thresholds
            this.priceAlertThresholds.set(mintAddress, priceAlertThreshold);

            // Subscribe to token transactions
            const subscription = await heliusAPI.subscribeToTokenTransactions(
                mintAddress,
                this.handleTokenTransaction.bind(this)
            );

            // Store token data
            this.trackedTokens.set(mintAddress, {
                metadata,
                lastPrice: price,
                subscription
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
                metadata,
                price
            };
        } catch (error) {
            terminalUI.stopSpinner(false, `Failed to track token ${mintAddress}`);
            terminalUI.displayError(error);
            throw error;
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
        const tokens = Array.from(this.trackedTokens.entries()).map(([mintAddress, data]) => ({
            mintAddress,
            metadata: data.metadata,
            lastPrice: data.lastPrice
        }));
        
        terminalUI.displayTokenTable(tokens);
        return tokens;
    }
}

module.exports = new TokenTrackerBot(); 