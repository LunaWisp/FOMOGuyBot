require('dotenv').config();

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '9288ffbd-269f-4b80-b1e2-7832f462c9df';

module.exports = {
    HELIUS_API_KEY,
    HELIUS_API_ENDPOINTS: {
        TOKEN_METADATA: 'https://api.helius.xyz/v1/token-metadata',
        TOKEN_PRICE: 'https://api.helius.xyz/v0/token-price'
    },
    helius: {
        apiKey: HELIUS_API_KEY,
        endpoints: {
            mainnet: `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
            secure: `https://annetta-1hpo7z-fast-mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
            staked: `https://staked.helius-rpc.com?api-key=${HELIUS_API_KEY}`,
            websocket: `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
            sharedEclipse: `https://eclipse.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
        }
    },
    x: {
        apiKey: process.env.X_API_KEY,
        apiSecret: process.env.X_API_SECRET,
        accessToken: process.env.X_ACCESS_TOKEN,
        accessSecret: process.env.X_ACCESS_SECRET
    }
}; 