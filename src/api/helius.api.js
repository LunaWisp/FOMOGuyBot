import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { apiConfig } from '../config/api.config.js';
import { config } from '../utils/config.js';
import { WebSocket } from 'ws';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFilePath = join(__dirname, '../../logs/console.log');

class HeliusAPI {
    constructor() {
        const mainnetEndpoint = apiConfig.helius.endpoints.mainnet;
        if (!mainnetEndpoint.startsWith('http://') && !mainnetEndpoint.startsWith('https://')) {
            throw new Error(`Invalid endpoint URL: ${mainnetEndpoint}. Must start with http:// or https://`);
        }
        this.connection = new Connection(mainnetEndpoint);
        this.apiKey = apiConfig.HELIUS_API_KEY;
        this.baseUrl = config.getString('HELIUS_API_BASE_URL');
        this.wsConfig = {
            jsonrpc: config.getString('WS_JSONRPC_VERSION'),
            commitment: config.getString('WS_COMMITMENT_LEVEL'),
            encoding: config.getString('WS_ENCODING'),
            id: config.getNumber('WS_DEFAULT_ID')
        };
        this.metadataConfig = {
            includeOffChain: config.getBoolean('HELIUS_TOKEN_METADATA_INCLUDE_OFFCHAIN'),
            disableCache: config.getBoolean('HELIUS_TOKEN_METADATA_DISABLE_CACHE'),
            method: config.getString('HELIUS_TOKEN_METADATA_METHOD'),
            notificationMethod: config.getString('HELIUS_TOKEN_METADATA_NOTIFICATION_METHOD')
        };
        this.priceConfig = {
            minLength: config.getNumber('HELIUS_TOKEN_PRICE_MIN_LENGTH'),
            maxLength: config.getNumber('HELIUS_TOKEN_PRICE_MAX_LENGTH')
        };
        this.endpoints = apiConfig.helius.endpoints;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    async getTokenMetadata(mintAddress) {
        try {
            try {
                const response = await axios.post(`${this.baseUrl}/v1/token-metadata`, {
                    mintAccounts: [mintAddress],
                    includeOffChain: this.metadataConfig.includeOffChain,
                    disableCache: this.metadataConfig.disableCache
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${this.apiKey}`
                    }
                });
                
                if (!response.data || !response.data[0]) {
                    throw new Error(`No metadata found for token ${mintAddress}`);
                }
                
                return response.data[0];
            } catch (apiError) {
                // Check if error is related to authentication or invalid API key
                if (apiError.response?.status === 401 || 
                    apiError.response?.data?.error?.code === -32401 ||
                    apiError.response?.data?.error?.message === 'invalid api key provided' ||
                    (apiError.message && apiError.message.includes('401'))) {
                    
                    console.log(`API authentication failed for metadata. Using fallback for ${mintAddress}`);
                    
                    // Return fallback metadata
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
                
                // Rethrow other errors
                throw apiError;
            }
        } catch (error) {
            console.error('Error fetching token metadata:', error.response?.data || error.message);
            throw error;
        }
    }

    async getTokenPrice(mintAddress) {
        try {
            if (!mintAddress || 
                mintAddress.length < this.priceConfig.minLength || 
                mintAddress.length > this.priceConfig.maxLength) {
                throw new Error(`Invalid Solana address format: ${mintAddress}`);
            }
            
            try {
                const response = await axios.get(`${this.baseUrl}/v1/token-price`, {
                    params: {
                        address: mintAddress
                    },
                    headers: {
                        'Authorization': `${this.apiKey}`
                    }
                });
                
                if (!response.data || !response.data.price) {
                    throw new Error(`No price data found for token ${mintAddress}`);
                }
                
                return response.data;
            } catch (apiError) {
                // Check if the error is a "Method not found" error or authentication error
                if (apiError.response?.data?.error?.code === -32603 || 
                    apiError.response?.data?.error?.message === 'Method not found' ||
                    apiError.response?.status === 401 || 
                    (apiError.message && (apiError.message.includes('401') || apiError.message.includes('not found')))) {
                    
                    console.log(`API error fetching price for ${mintAddress}, using fallback price data`);
                    
                    // Return fallback price data
                    return {
                        price: 0.001,
                        priceChange24h: 0,
                        volume24h: 0,
                        marketCap: 0,
                        currency: 'USD',
                        isFallback: true
                    };
                }
                
                // Rethrow other errors
                throw apiError;
            }
        } catch (error) {
            console.error('Error fetching token price:', error.response?.data || error.message);
            throw error;
        }
    }

    async subscribeToTokenTransactions(mintAddress, callback) {
        try {
            const ws = new WebSocket(this.endpoints.websocket);
            
            ws.on('open', () => {
                console.log('WebSocket connected');
                ws.send(JSON.stringify({
                    jsonrpc: this.wsConfig.jsonrpc,
                    id: this.wsConfig.id,
                    method: this.metadataConfig.method,
                    params: [
                        mintAddress,
                        {
                            encoding: this.wsConfig.encoding,
                            commitment: this.wsConfig.commitment
                        }
                    ]
                }));
            });

            ws.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.method === this.metadataConfig.notificationMethod) {
                        callback(response.params);
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });

            return ws;
        } catch (error) {
            console.error(`Error subscribing to token transactions for ${mintAddress}:`, error);
            throw error;
        }
    }

    // Method to update API key at runtime
    updateApiKey(newApiKey) {
        if (!newApiKey || typeof newApiKey !== 'string' || newApiKey.trim() === '') {
            throw new Error('Invalid API key format');
        }
        
        // Update the API key
        this.apiKey = newApiKey;
        
        // Log the action (first/last 4 chars only for security)
        const maskedKey = newApiKey.substring(0, 4) + '...' + newApiKey.substring(newApiKey.length - 4);
        console.log(`Helius API key updated to ${maskedKey}`);
        
        // Write the updated key to a log file for debugging
        try {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] API Key updated to ${maskedKey}\n`;
            fs.appendFile(logFilePath, logEntry, 'utf8').catch(err => {
                console.error('Failed to log API key update:', err);
            });
        } catch (error) {
            // Silent fail on logging
        }
        
        return { success: true };
    }

    // Method to test if the API key is valid
    async testApiKey() {
        try {
            // Use a simple API call to test if the key is valid
            const testMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC mint address
            
            const response = await axios.post(`${this.baseUrl}/v1/token-metadata`, {
                mintAccounts: [testMint],
                includeOffChain: false,
                disableCache: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${this.apiKey}`
                }
            });
            
            // If we get here, the API key is valid
            return { 
                valid: true, 
                message: 'API key is valid'
            };
        } catch (error) {
            // Check if the error is due to an invalid API key
            if (error.response?.status === 401 || 
                (error.message && error.message.includes('401')) ||
                (error.response?.data?.error?.message && error.response?.data?.error?.message.includes('api key'))) {
                
                return { 
                    valid: false, 
                    message: 'Invalid API key',
                    error: error.response?.data?.error || error.message 
                };
            }
            
            // Some other error occurred
            return { 
                valid: false, 
                message: 'API key validation failed',
                error: error.message
            };
        }
    }
}

export const heliusAPI = new HeliusAPI(); 