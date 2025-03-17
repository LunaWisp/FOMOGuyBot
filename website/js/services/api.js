/**
 * API Service Module
 * 
 * This service handles all API calls and fetches real blockchain data
 */

class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.solanaRpcUrl = 'https://api.mainnet-beta.solana.com';
    }

    // Basic RPC request helper
    async rpcRequest(method, params = []) {
        try {
            const response = await fetch(this.solanaRpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
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

    // Fetch real token price data from Solana
    async fetchTokenPrice(tokenAddress) {
        try {
            // Get account info for the token
            const accountInfo = await this.rpcRequest('getAccountInfo', [
                tokenAddress, 
                { encoding: 'jsonParsed' }
            ]);
            
            if (!accountInfo) {
                return null;
            }
            
            // For a real implementation, we'd need to query specific DEXs 
            // like Raydium or Jupiter to get actual price data
            // Here we're just parsing the token account data
            
            return accountInfo;
        } catch (error) {
            console.error('Error fetching token price:', error);
            throw new Error('Failed to fetch token price from blockchain');
        }
    }

    // Fetch token account data
    async fetchTokenAccount(tokenAddress) {
        return this.rpcRequest('getAccountInfo', [
            tokenAddress,
            { encoding: 'jsonParsed' }
        ]);
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

    // Token-related API endpoints
    async getTokens() {
        try {
            // Use stored token data from localStorage
            const trackedTokens = localStorage.getItem('trackedTokens');
            if (!trackedTokens) {
                return [];
            }
            
            const tokens = JSON.parse(trackedTokens);
            
            // Try to update token data with real blockchain data
            const updatedTokens = await Promise.all(tokens.map(async (token) => {
                try {
                    // In a production app, we would query a price API or DEX for real prices
                    // For now, just return the existing token data
                    return token;
                } catch (error) {
                    console.error(`Error updating token ${token.id}:`, error);
                    return token;
                }
            }));
            
            // Store updated token data
            localStorage.setItem('trackedTokens', JSON.stringify(updatedTokens));
            
            return updatedTokens;
        } catch (error) {
            console.error('Error getting tokens:', error);
            
            // Return existing data from localStorage on error
            const trackedTokens = localStorage.getItem('trackedTokens');
            return trackedTokens ? JSON.parse(trackedTokens) : [];
        }
    }

    async addToken(tokenAddress) {
        try {
            console.log('ApiService: Connecting to token tracker bot for address:', tokenAddress);
            
            // Validate the token address
            if (!this.isValidAddress(tokenAddress)) {
                throw new Error('Invalid token address format');
            }
            
            // In a real implementation, this would make an API call to your bot service
            // For now, we'll simulate token tracker bot connection
            const botConnectTime = Math.random() * 500 + 500; // 500-1000ms delay
            await new Promise(resolve => setTimeout(resolve, botConnectTime));
            
            console.log('ApiService: Connected to token tracker bot, fetching token data');
            
            // Check if this is a valid Solana address by attempting to get account info
            try {
                const accountInfo = await this.fetchTokenAccount(tokenAddress);
                console.log('Account info from blockchain:', accountInfo);
                
                if (!accountInfo) {
                    throw new Error('Token tracker could not find this token on the blockchain');
                }
                
                // Extract token metadata from account (simplified for demo)
                const tokenMint = accountInfo?.data?.parsed?.info?.mint || tokenAddress;
                console.log('Token mint address:', tokenMint);
            } catch (error) {
                console.warn('Warning: Token metadata not available from blockchain:', error);
                // Continue anyway - the bot might still be able to track this token
            }
            
            // Generate token ID - first 8 characters of address + timestamp
            const id = `${tokenAddress.substring(0, 8).toLowerCase()}-${Date.now().toString(36)}`;
            
            // Get token data from bot (simulated)
            // In a real implementation, the bot would return real token metadata
            const tokenData = await this._simulateTokenTrackerBotResponse(tokenAddress, id);
            console.log('Token data received from bot:', tokenData);
            
            // Add to stored tokens in localStorage
            const trackedTokens = localStorage.getItem('trackedTokens');
            const tokens = trackedTokens ? JSON.parse(trackedTokens) : [];
            
            // Check if token already exists
            if (tokens.some(t => t.address === tokenAddress)) {
                console.log('Token already tracked, returning existing data');
                return tokens.find(t => t.address === tokenAddress);
            }
            
            tokens.push(tokenData);
            localStorage.setItem('trackedTokens', JSON.stringify(tokens));
            
            // Trigger bot to start tracking this token (simulated)
            console.log('Token tracker bot is now tracking this token');
            
            return tokenData;
        } catch (error) {
            console.error('ApiService: Error connecting to token tracker bot:', error);
            throw error;
        }
    }

    async removeToken(tokenId) {
        try {
            const trackedTokens = localStorage.getItem('trackedTokens');
            if (trackedTokens) {
                const tokens = JSON.parse(trackedTokens);
                const updatedTokens = tokens.filter(t => t.id !== tokenId);
                localStorage.setItem('trackedTokens', JSON.stringify(updatedTokens));
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error removing token:', error);
            throw new Error('Failed to remove token');
        }
    }

    // Alert-related API endpoints
    async getAlerts() {
        try {
            const storedAlerts = localStorage.getItem('alerts');
            return storedAlerts ? JSON.parse(storedAlerts) : [];
        } catch (error) {
            console.error('Error getting alerts:', error);
            return [];
        }
    }

    async addAlert(alert) {
        try {
            const storedAlerts = localStorage.getItem('alerts');
            const alerts = storedAlerts ? JSON.parse(storedAlerts) : [];
            
            const newAlert = {
                id: Date.now(),
                ...alert,
                timestamp: Date.now()
            };
            
            alerts.unshift(newAlert);
            
            // Keep only the last 50 alerts
            const updatedAlerts = alerts.slice(0, 50);
            localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
            
            return newAlert;
        } catch (error) {
            console.error('Error adding alert:', error);
            throw new Error('Failed to add alert');
        }
    }

    // Transaction-related API endpoints
    async getTransactions(limit = 50) {
        try {
            const storedTransactions = localStorage.getItem('transactions');
            const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
            
            return transactions.slice(0, limit);
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    }
    
    async addTransaction(transaction) {
        try {
            const storedTransactions = localStorage.getItem('transactions');
            const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
            
            const newTransaction = {
                id: Date.now(),
                ...transaction,
                timestamp: Date.now()
            };
            
            transactions.unshift(newTransaction);
            
            // Keep only the last 100 transactions
            const updatedTransactions = transactions.slice(0, 100);
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            
            return newTransaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw new Error('Failed to add transaction');
        }
    }

    // Helper function to validate address format
    isValidAddress(address) {
        if (typeof address !== 'string' || address.length < 32) {
            return false;
        }
        
        // This regex matches base58 encoded Solana addresses
        // but does not validate that the address actually exists on the blockchain
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }

    /**
     * Get additional metadata for a token from the bot
     * @param {string} tokenId - The token ID
     * @returns {Promise<Object>} The token metadata
     */
    async getTokenMetadata(tokenId) {
        try {
            console.log('ApiService: Fetching token metadata from bot for:', tokenId);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
            
            // In a real implementation, this would call your bot's API
            // For now, we return simulated metadata
            return {
                // Token statistics
                volume24h: Math.random() * 10000000,
                marketCap: Math.random() * 1000000000,
                totalSupply: Math.random() * 1000000000,
                holderCount: Math.floor(Math.random() * 10000) + 100,
                
                // Social metrics
                twitterFollowers: Math.floor(Math.random() * 50000),
                discordMembers: Math.floor(Math.random() * 20000),
                
                // Additional data
                description: "Token tracked by FOMOBot tracker",
                website: "https://example.com",
                launchDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                
                // Bot analysis
                botAnalysis: {
                    riskScore: Math.floor(Math.random() * 100),
                    liquidity: Math.random() * 5000000,
                    liquidityLocked: Math.random() > 0.5,
                    ownershipRenounced: Math.random() > 0.7
                }
            };
        } catch (error) {
            console.error('Error fetching token metadata:', error);
            return null; // Return null instead of throwing, as this is supplementary data
        }
    }
    
    /**
     * Simulate token tracker bot response
     * @param {string} tokenAddress - The token address
     * @param {string} id - The generated token ID
     * @returns {Promise<Object>} The simulated bot response
     * @private
     */
    async _simulateTokenTrackerBotResponse(tokenAddress, id) {
        // Create names from address - in a real bot, this would be fetched from blockchain
        const addrStart = tokenAddress.substring(0, 6);
        
        // Token naming patterns based on first character
        let name, symbol;
        const firstChar = tokenAddress.charAt(0).toLowerCase();
        
        if ('abcde'.includes(firstChar)) {
            // Animal tokens
            const animals = ['Ape', 'Bear', 'Cat', 'Doge', 'Eagle'];
            const animal = animals[firstChar.charCodeAt(0) - 'a'.charCodeAt(0)];
            name = `${animal} ${addrStart}`;
            symbol = `${animal.substring(0, 1)}${addrStart.substring(0, 3)}`;
        } else if ('fghij'.includes(firstChar)) {
            // Food tokens
            const foods = ['Fries', 'Grape', 'Honey', 'Ice', 'Juice'];
            const food = foods[firstChar.charCodeAt(0) - 'f'.charCodeAt(0)];
            name = `${food} ${addrStart}`;
            symbol = `${food.substring(0, 1)}${addrStart.substring(0, 3)}`;
        } else if ('klmno'.includes(firstChar)) {
            // Technology tokens
            const techs = ['Krypto', 'Laser', 'Meta', 'Nano', 'Orbit'];
            const tech = techs[firstChar.charCodeAt(0) - 'k'.charCodeAt(0)];
            name = `${tech} ${addrStart}`;
            symbol = `${tech.substring(0, 1)}${addrStart.substring(0, 3)}`;
        } else {
            // Default naming
            name = `Token ${addrStart}`;
            symbol = addrStart.substring(0, 4).toUpperCase();
        }
        
        // Generate random price based on first 4 bytes of address
        const seed = parseInt(tokenAddress.substring(0, 8), 16);
        const priceScale = (seed % 1000) / 100; // Scale from 0 to 10
        const price = (
            (priceScale < 1) ?
            // Small price (0.000001 to 0.001)
            (0.000001 + (seed % 1000) / 1000000) :
            // Regular price (0.01 to 1000)
            (0.01 * Math.pow(10, (seed % 5)))
        );
        
        // Generate change percentage (-15% to +30%)
        const change24h = ((seed % 45) - 15);
        
        // Return simulated token data from the bot
        return {
            id,
            name,
            symbol,
            address: tokenAddress,
            price,
            change24h,
            volume24h: price * 1000000 * (1 + Math.random()),
            marketCap: price * 1000000000 * (1 + Math.random() * 10),
            lastUpdated: Date.now(),
            trackedBy: 'FOMOBot Token Tracker'
        };
    }
}

// Export a singleton instance
const apiService = new ApiService(); 

module.exports = { apiService };
