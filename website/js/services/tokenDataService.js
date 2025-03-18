/**
 * Unified Token Data Service
 * Combines DexScreener, Helius, and WebSocket for comprehensive token data
 */

const { websocketService } = require('./websocket');
const { HeliusAPI } = require('./helius.api');
const { DexScreenerService } = require('./dexScreener');

class TokenDataService {
    constructor() {
        this.helius = new HeliusAPI();
        this.dexScreener = new DexScreenerService();
        this.subscribers = new Map();
        this.trackedTokens = new Set();
        this.updateInterval = 5000; // 5 seconds for DexScreener updates
        this.errorCount = new Map();
        this.maxErrors = 3;
        this.errorTimeout = 30000; // 30 seconds
        this.fallbackMode = false;
    }

    async startTracking(tokenAddress) {
        if (this.trackedTokens.has(tokenAddress)) {
            return true;
        }

        try {
            // Reset error count for this token
            this.errorCount.set(tokenAddress, 0);

            // 1. Get initial data from both APIs with retry
            const [dexData, heliusData] = await this.getInitialDataWithRetry(tokenAddress);

            // 2. Subscribe to Helius WebSocket for transaction updates
            await this.setupTransactionSubscription(tokenAddress);

            // 3. Set up DexScreener polling with error handling
            this.setupDexScreenerPolling(tokenAddress);

            // 4. Store tracking info
            this.trackedTokens.add(tokenAddress);
            
            // 5. Notify subscribers of initial data
            this.notifySubscribers(tokenAddress, {
                type: 'initial',
                dexData,
                heliusData,
                timestamp: Date.now()
            });

            return true;
        } catch (error) {
            this.handleError(tokenAddress, error);
            return false;
        }
    }

    async getInitialDataWithRetry(tokenAddress, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                return await Promise.all([
                    this.dexScreener.getTokenMetadata(tokenAddress),
                    this.helius.getTokenMetadata(tokenAddress)
                ]);
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    async setupTransactionSubscription(tokenAddress) {
        try {
            await this.helius.subscribeToTokenTransactions(tokenAddress, (tx) => {
                this.handleTransactionUpdate(tokenAddress, tx);
            });
        } catch (error) {
            console.error(`Failed to setup transaction subscription for ${tokenAddress}:`, error);
            // Continue without transaction updates
        }
    }

    setupDexScreenerPolling(tokenAddress) {
        const interval = setInterval(async () => {
            try {
                const updatedDexData = await this.dexScreener.getTokenMetadata(tokenAddress);
                this.handleDexUpdate(tokenAddress, updatedDexData);
                // Reset error count on successful update
                this.errorCount.set(tokenAddress, 0);
            } catch (error) {
                this.handleError(tokenAddress, error);
                // Check if we should stop polling
                if (this.shouldStopPolling(tokenAddress)) {
                    clearInterval(interval);
                    this.handlePollingFailure(tokenAddress);
                }
            }
        }, this.updateInterval);

        // Store interval ID for cleanup
        this.trackedTokens.set(tokenAddress, interval);
    }

    handleError(tokenAddress, error) {
        const currentErrors = this.errorCount.get(tokenAddress) || 0;
        this.errorCount.set(tokenAddress, currentErrors + 1);

        // Notify subscribers of error
        this.notifySubscribers(tokenAddress, {
            type: 'error',
            error: {
                message: error.message,
                timestamp: Date.now(),
                count: currentErrors + 1
            }
        });

        // Log error with context
        console.error(`Error tracking ${tokenAddress}:`, {
            error: error.message,
            errorCount: currentErrors + 1,
            timestamp: new Date().toISOString()
        });
    }

    shouldStopPolling(tokenAddress) {
        const errors = this.errorCount.get(tokenAddress) || 0;
        return errors >= this.maxErrors;
    }

    handlePollingFailure(tokenAddress) {
        // Switch to fallback mode if needed
        if (!this.fallbackMode) {
            this.enableFallbackMode();
        }

        // Notify subscribers of polling failure
        this.notifySubscribers(tokenAddress, {
            type: 'pollingFailure',
            timestamp: Date.now()
        });
    }

    enableFallbackMode() {
        this.fallbackMode = true;
        console.log('TokenDataService: Enabling fallback mode');
        
        // Notify all subscribers
        this.subscribers.forEach((callbacks, address) => {
            callbacks.forEach(callback => {
                try {
                    callback({
                        type: 'fallbackMode',
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.error(`Error in fallback mode notification for ${address}:`, error);
                }
            });
        });
    }

    stopTracking(tokenAddress) {
        if (!this.trackedTokens.has(tokenAddress)) {
            return;
        }

        // Clear interval if it exists
        const interval = this.trackedTokens.get(tokenAddress);
        if (typeof interval === 'number') {
            clearInterval(interval);
        }

        // Clean up subscriptions and data
        this.trackedTokens.delete(tokenAddress);
        this.subscribers.delete(tokenAddress);
        this.errorCount.delete(tokenAddress);
    }

    subscribe(tokenAddress, callback) {
        if (!this.subscribers.has(tokenAddress)) {
            this.subscribers.set(tokenAddress, new Set());
        }
        this.subscribers.get(tokenAddress).add(callback);
    }

    unsubscribe(tokenAddress, callback) {
        if (this.subscribers.has(tokenAddress)) {
            this.subscribers.get(tokenAddress).delete(callback);
        }
    }

    handleTransactionUpdate(tokenAddress, transaction) {
        try {
            this.notifySubscribers(tokenAddress, {
                type: 'transaction',
                transaction,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error(`Error handling transaction update for ${tokenAddress}:`, error);
        }
    }

    handleDexUpdate(tokenAddress, dexData) {
        try {
            this.notifySubscribers(tokenAddress, {
                type: 'dexUpdate',
                dexData,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error(`Error handling DexScreener update for ${tokenAddress}:`, error);
        }
    }

    notifySubscribers(tokenAddress, data) {
        if (this.subscribers.has(tokenAddress)) {
            this.subscribers.get(tokenAddress).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in subscriber callback for ${tokenAddress}:`, error);
                }
            });
        }
    }

    async getCurrentData(tokenAddress) {
        try {
            const [dexData, heliusData] = await Promise.all([
                this.dexScreener.getTokenMetadata(tokenAddress),
                this.helius.getTokenMetadata(tokenAddress)
            ]);

            return {
                dexData,
                heliusData,
                timestamp: Date.now(),
                status: 'active'
            };
        } catch (error) {
            console.error(`Error getting current data for ${tokenAddress}:`, error);
            return {
                status: 'error',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
}

// Export singleton instance
const tokenDataService = new TokenDataService();
module.exports = { tokenDataService }; 