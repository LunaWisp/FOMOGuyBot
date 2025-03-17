require('dotenv').config();

module.exports = {
    helius: {
        apiKey: process.env.HELIUS_API_KEY,
        endpoints: {
            mainnet: process.env.HELIUS_MAINNET_RPC,
            secure: process.env.HELIUS_SECURE_RPC,
            staked: process.env.HELIUS_STAKED_RPC,
            websocket: process.env.HELIUS_WEBSOCKET_RPC,
            sharedEclipse: process.env.HELIUS_SHARED_ECLIPSE_RPC,
            v0: process.env.HELIUS_API_V0,
            v1: process.env.HELIUS_API_V1
        }
    },
    x: {
        apiKey: process.env.X_API_KEY,
        apiSecret: process.env.X_API_SECRET,
        accessToken: process.env.X_ACCESS_TOKEN,
        accessSecret: process.env.X_ACCESS_SECRET
    }
}; 