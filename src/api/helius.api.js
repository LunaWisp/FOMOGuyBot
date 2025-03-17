const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const config = require('../config/api.config');

class HeliusAPI {
    constructor() {
        this.connection = new Connection(config.helius.endpoints.mainnet);
        this.apiKey = config.helius.apiKey;
        this.baseUrl = 'https://api.helius.xyz';
    }

    async getTokenMetadata(mintAddress) {
        try {
            const response = await axios.post(`${this.baseUrl}/v1/token-metadata`, {
                mintAccounts: [mintAddress],
                includeOffChain: true,
                disableCache: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            if (!response.data || !response.data[0]) {
                throw new Error(`No metadata found for token ${mintAddress}`);
            }
            
            return response.data[0];
        } catch (error) {
            console.error('Error fetching token metadata:', error.response?.data || error.message);
            throw error;
        }
    }

    async getTokenPrice(mintAddress) {
        try {
            if (!mintAddress || mintAddress.length < 32 || mintAddress.length > 44) {
                throw new Error(`Invalid Solana address format: ${mintAddress}`);
            }
            
            const response = await axios.get(`${this.baseUrl}/v1/token-price`, {
                params: {
                    address: mintAddress
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            if (!response.data || !response.data.price) {
                throw new Error(`No price data found for token ${mintAddress}`);
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching token price:', error.response?.data || error.message);
            throw error;
        }
    }

    async subscribeToTokenTransactions(mintAddress, callback) {
        try {
            const WebSocketImpl = require('ws');
            const ws = new WebSocketImpl(config.helius.endpoints.websocket);
            
            ws.on('open', () => {
                console.log('WebSocket connected');
                ws.send(JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tokenAccountsSubscribe',
                    params: [
                        mintAddress,
                        {
                            encoding: 'jsonParsed',
                            commitment: 'confirmed'
                        }
                    ]
                }));
            });

            ws.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.method === 'tokenAccountsNotification') {
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
            console.error('Error subscribing to token transactions:', error);
            throw error;
        }
    }
}

module.exports = new HeliusAPI(); 