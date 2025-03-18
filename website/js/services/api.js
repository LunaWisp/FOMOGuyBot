/**
 * API Service Module
 * 
 * This service handles all API calls and fetches real blockchain data
 */

class ApiService {
    constructor() {
        this.baseUrl = window.config.API_BASE_URL;
        this.solanaRpcUrl = window.config.SOLANA_RPC_MAINNET;
        this.storageKeys = {
            alerts: window.config.STORAGE_KEYS_ALERTS,
            transactions: window.config.STORAGE_KEYS_TRANSACTIONS,
            tokens: window.config.STORAGE_KEYS_TOKENS
        };
        this.limits = {
            alerts: window.config.STORAGE_ALERTS_LIMIT,
            transactions: window.config.STORAGE_TRANSACTIONS_LIMIT
        };
        this.rpcConfig = {
            jsonrpc: window.config.RPC_JSONRPC_VERSION,
            id: window.config.RPC_DEFAULT_ID,
            contentType: window.config.RPC_CONTENT_TYPE
        };
    }

    // Basic RPC request helper
    async rpcRequest(method, params = []) {
        try {
            const response = await fetch(this.solanaRpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': this.rpcConfig.contentType },
                body: JSON.stringify({
                    jsonrpc: this.rpcConfig.jsonrpc,
                    id: this.rpcConfig.id,
                    method,
                    params
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error('RPC Error:', data.error);
                throw new Error(data.error.message || 'RPC Error');
            }
            
            return data.result;
        } catch (error) {
            console.error(`Error in RPC request (${method}):`, error);
            throw new Error(`Failed to execute ${method}: ${error.message}`);
        }
    }

    // Token-related API endpoints
    async getTokens() {
        try {
            // Use stored token data from localStorage
            const trackedTokens = localStorage.getItem(this.storageKeys.tokens);
            if (!trackedTokens) {
                return [];
            }
            
            const tokens = JSON.parse(trackedTokens);
            
            // Update token data with real blockchain data
            const updatedTokens = await Promise.all(tokens.map(async (token) => {
                try {
                    const metadata = await this.getTokenMetadata(token.id);
                    const price = await this.getTokenPrice(token.id);
                    return {
                        ...token,
                        ...metadata,
                        ...price,
                        lastUpdated: Date.now()
                    };
                } catch (error) {
                    console.error(`Error updating token ${token.id}:`, error);
                    return token;
                }
            }));
            
            // Store updated token data
            localStorage.setItem(this.storageKeys.tokens, JSON.stringify(updatedTokens));
            
            return updatedTokens;
        } catch (error) {
            console.error('Error getting tokens:', error);
            
            // Return existing data from localStorage on error
            const trackedTokens = localStorage.getItem(this.storageKeys.tokens);
            return trackedTokens ? JSON.parse(trackedTokens) : [];
        }
    }

    async addToken(tokenAddress) {
        try {
            console.log('ApiService: Adding token with address:', tokenAddress);
            
            // Validate the token address
            if (!this.isValidAddress(tokenAddress)) {
                throw new Error('Invalid token address format');
            }
            
            // Make API call to add token
            const response = await fetch(`${this.baseUrl}${window.config.API_TOKEN_ADD_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': this.rpcConfig.contentType
                },
                body: JSON.stringify({ address: tokenAddress })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to add token: ${response.statusText}`);
            }
            
            const tokenData = await response.json();
            
            // Add to stored tokens in localStorage
            const trackedTokens = localStorage.getItem(this.storageKeys.tokens);
            const tokens = trackedTokens ? JSON.parse(trackedTokens) : [];
            
            // Check if token already exists
            if (tokens.some(t => t.id === tokenData.id)) {
                throw new Error('Token already being tracked');
            }
            
            tokens.push(tokenData);
            localStorage.setItem(this.storageKeys.tokens, JSON.stringify(tokens));
            
            return tokenData;
        } catch (error) {
            console.error('Error adding token:', error);
            throw error;
        }
    }

    async removeToken(tokenId) {
        try {
            const trackedTokens = localStorage.getItem(this.storageKeys.tokens);
            if (trackedTokens) {
                const tokens = JSON.parse(trackedTokens);
                const updatedTokens = tokens.filter(t => t.id !== tokenId);
                localStorage.setItem(this.storageKeys.tokens, JSON.stringify(updatedTokens));
            }
            
            return true;
        } catch (error) {
            console.error('Error removing token:', error);
            throw error;
        }
    }

    // Helper function to validate address format
    isValidAddress(address) {
        return address && 
               typeof address === 'string' && 
               address.length === 44 && 
               /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
    }

    // Alert-related API endpoints
    async getAlerts() {
        try {
            const storedAlerts = localStorage.getItem(this.storageKeys.alerts);
            return storedAlerts ? JSON.parse(storedAlerts) : [];
        } catch (error) {
            console.error('Error getting alerts:', error);
            return [];
        }
    }

    async addAlert(alert) {
        try {
            const storedAlerts = localStorage.getItem(this.storageKeys.alerts);
            const alerts = storedAlerts ? JSON.parse(storedAlerts) : [];
            
            const newAlert = {
                id: Date.now(),
                ...alert,
                timestamp: Date.now()
            };
            
            alerts.unshift(newAlert);
            
            // Keep only the last N alerts
            const updatedAlerts = alerts.slice(0, this.limits.alerts);
            localStorage.setItem(this.storageKeys.alerts, JSON.stringify(updatedAlerts));
            
            return newAlert;
        } catch (error) {
            console.error('Error adding alert:', error);
            throw new Error('Failed to add alert');
        }
    }

    // Transaction-related API endpoints
    async getTransactions(limit = this.limits.transactions) {
        try {
            const storedTransactions = localStorage.getItem(this.storageKeys.transactions);
            const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
            
            return transactions.slice(0, limit);
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    }
    
    async addTransaction(transaction) {
        try {
            const storedTransactions = localStorage.getItem(this.storageKeys.transactions);
            const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
            
            const newTransaction = {
                id: Date.now(),
                ...transaction,
                timestamp: Date.now()
            };
            
            transactions.unshift(newTransaction);
            
            // Keep only the last N transactions
            const updatedTransactions = transactions.slice(0, this.limits.transactions);
            localStorage.setItem(this.storageKeys.transactions, JSON.stringify(updatedTransactions));
            
            return newTransaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw new Error('Failed to add transaction');
        }
    }

    // Fetch recent transactions for a token
    async fetchTokenTransactions(tokenAddress, limit = 10) {
        return this.rpcRequest('getSignaturesForAddress', [
            tokenAddress,
            { limit }
        ]);
    }

    // Fetch transaction details
    async fetchTransactionDetails(signature) {
        return this.rpcRequest('getTransaction', [
            signature,
            { encoding: 'jsonParsed' }
        ]);
    }

    // Fetch token metadata from blockchain
    async getTokenMetadata(tokenAddress) {
        try {
            const response = await fetch(`${window.config.DEXSCREENER_API}/dex/tokens/${tokenAddress}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch token metadata: ${response.statusText}`);
            }
            const data = await response.json();
            return data.pairs[0]?.baseToken || null;
        } catch (error) {
            console.error('Error fetching token metadata:', error);
            throw error;
        }
    }

    // Fetch token price from blockchain
    async getTokenPrice(tokenAddress) {
        try {
            const response = await fetch(`${window.config.DEXSCREENER_API}/dex/tokens/${tokenAddress}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch token price: ${response.statusText}`);
            }
            const data = await response.json();
            const pair = data.pairs[0];
            return {
                price: pair?.priceUsd || 0,
                priceChange24h: pair?.priceChange24h || 0,
                volume24h: pair?.volume24h || 0,
                liquidity: pair?.liquidity?.usd || 0
            };
        } catch (error) {
            console.error('Error fetching token price:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const apiService = new ApiService();
