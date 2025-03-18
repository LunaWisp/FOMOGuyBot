/**
 * DexScreener API Service
 * 
 * This service handles API calls to DexScreener for token metadata
 */

class DexScreenerService {
    constructor() {
        this.baseUrl = 'https://api.dexscreener.com/latest';
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        this.requestTimeout = 8000; // 8 seconds timeout for requests
    }

    async getTokenMetadata(tokenAddress) {
        if (!tokenAddress) {
            throw new Error('Token address is required');
        }

        // Check cache first
        const cached = this.cache.get(tokenAddress);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
            
            const response = await fetch(`${this.baseUrl}/dex/tokens/${tokenAddress}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`DexScreener API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the response
            this.cache.set(tokenAddress, {
                data: data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Error fetching token metadata from DexScreener:', error);
            // Don't mock data, simply throw the error
            throw error;
        }
    }

    async getPairMetadata(pairAddress) {
        // Check cache first
        const cached = this.cache.get(pairAddress);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseUrl}/dex/pairs/${pairAddress}`);
            if (!response.ok) {
                throw new Error(`DexScreener API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the response
            this.cache.set(pairAddress, {
                data: data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Error fetching pair metadata from DexScreener:', error);
            return null;
        }
    }

    formatPrice(price) {
        if (!price) return '0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(price);
    }

    formatVolume(volume) {
        if (!volume) return '0';
        if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
        if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
        if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
        return `$${volume.toFixed(2)}`;
    }

    formatLiquidity(liquidity) {
        if (!liquidity) return '0';
        if (liquidity >= 1e9) return `$${(liquidity / 1e9).toFixed(2)}B`;
        if (liquidity >= 1e6) return `$${(liquidity / 1e6).toFixed(2)}M`;
        if (liquidity >= 1e3) return `$${(liquidity / 1e3).toFixed(2)}K`;
        return `$${liquidity.toFixed(2)}`;
    }

    formatPriceChange(priceChange) {
        if (!priceChange) return '0%';
        return `${priceChange.toFixed(2)}%`;
    }
}

// Export a singleton instance
const dexScreenerService = new DexScreenerService();

module.exports = { dexScreenerService }; 