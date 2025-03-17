const heliusAPI = require('../api/helius.api');
const EventEmitter = require('events');

class TokenTrackerBot extends EventEmitter {
    constructor() {
        super();
        this.trackedTokens = new Map(); // mintAddress -> {metadata, lastPrice, subscription}
        this.priceAlertThresholds = new Map(); // mintAddress -> {up: number, down: number}
    }

    async trackToken(mintAddress, priceAlertThreshold = { up: 5, down: 5 }) {
        try {
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

            // Start price monitoring
            this.monitorTokenPrice(mintAddress);

            return {
                metadata,
                price
            };
        } catch (error) {
            console.error(`Error tracking token ${mintAddress}:`, error);
            throw error;
        }
    }

    async monitorTokenPrice(mintAddress) {
        const checkPrice = async () => {
            try {
                const tokenData = this.trackedTokens.get(mintAddress);
                const newPrice = await heliusAPI.getTokenPrice(mintAddress);
                const thresholds = this.priceAlertThresholds.get(mintAddress);

                if (tokenData && tokenData.lastPrice) {
                    const priceChange = ((newPrice.value - tokenData.lastPrice.value) / tokenData.lastPrice.value) * 100;

                    if (Math.abs(priceChange) >= thresholds.up && priceChange > 0) {
                        this.emit('priceAlert', {
                            mintAddress,
                            type: 'increase',
                            change: priceChange,
                            oldPrice: tokenData.lastPrice.value,
                            newPrice: newPrice.value
                        });
                    } else if (Math.abs(priceChange) >= thresholds.down && priceChange < 0) {
                        this.emit('priceAlert', {
                            mintAddress,
                            type: 'decrease',
                            change: Math.abs(priceChange),
                            oldPrice: tokenData.lastPrice.value,
                            newPrice: newPrice.value
                        });
                    }

                    // Update stored price
                    tokenData.lastPrice = newPrice;
                    this.trackedTokens.set(mintAddress, tokenData);
                }
            } catch (error) {
                console.error(`Error monitoring price for ${mintAddress}:`, error);
            }
        };

        // Check price every minute
        setInterval(checkPrice, 60000);
    }

    handleTokenTransaction(transaction) {
        this.emit('transaction', transaction);
    }

    stopTracking(mintAddress) {
        const tokenData = this.trackedTokens.get(mintAddress);
        if (tokenData && tokenData.subscription) {
            tokenData.subscription.close();
            this.trackedTokens.delete(mintAddress);
            this.priceAlertThresholds.delete(mintAddress);
            this.emit('tokenRemoved', mintAddress);
        }
    }

    getTrackedTokens() {
        return Array.from(this.trackedTokens.entries()).map(([mintAddress, data]) => ({
            mintAddress,
            metadata: data.metadata,
            lastPrice: data.lastPrice
        }));
    }
}

module.exports = new TokenTrackerBot(); 