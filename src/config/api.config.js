import 'dotenv/config';
import { config } from '../utils/config.js';

// Get API keys from environment variables
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
if (!HELIUS_API_KEY) {
    console.error('HELIUS_API_KEY is not set in environment variables');
    process.exit(1);
}

// Get required config values with error handling
const requiredConfigs = [
    'HELIUS_MAINNET_RPC',
    'HELIUS_SECURE_RPC',
    'HELIUS_STAKED_RPC',
    'HELIUS_WEBSOCKET',
    'HELIUS_ECLIPSE_RPC',
    'HELIUS_TOKEN_METADATA_ENDPOINT',
    'HELIUS_TOKEN_PRICE_ENDPOINT',
    'HELIUS_DAS_ENDPOINT'
];

for (const key of requiredConfigs) {
    if (!config.getString(key)) {
        console.error(`Required config value missing: ${key}`);
        process.exit(1);
    }
}

// Get endpoint URLs
const mainnetRpc = config.getString('HELIUS_MAINNET_RPC');
const secureRpc = config.getString('HELIUS_SECURE_RPC');
const stakedRpc = config.getString('HELIUS_STAKED_RPC');
const websocketUrl = config.getString('HELIUS_WEBSOCKET');
const eclipseRpc = config.getString('HELIUS_ECLIPSE_RPC');

export const apiConfig = {
    HELIUS_API_KEY,
    HELIUS_API_ENDPOINTS: {
        TOKEN_METADATA: config.getString('HELIUS_TOKEN_METADATA_ENDPOINT'),
        TOKEN_PRICE: config.getString('HELIUS_TOKEN_PRICE_ENDPOINT'),
        DAS: config.getString('HELIUS_DAS_ENDPOINT')
    },
    helius: {
        apiKey: HELIUS_API_KEY,
        endpoints: {
            mainnet: mainnetRpc.startsWith('http') ? mainnetRpc : `https://${mainnetRpc}`,
            secure: secureRpc.startsWith('http') ? secureRpc : `https://${secureRpc}`,
            staked: stakedRpc.startsWith('http') ? stakedRpc : `https://${stakedRpc}`,
            websocket: websocketUrl.startsWith('ws') ? websocketUrl : `wss://${websocketUrl}`,
            sharedEclipse: eclipseRpc.startsWith('http') ? eclipseRpc : `https://${eclipseRpc}`
        }
    },
    x: {
        apiKey: process.env.X_API_KEY,
        apiSecret: process.env.X_API_SECRET,
        accessToken: process.env.X_ACCESS_TOKEN,
        accessSecret: process.env.X_ACCESS_SECRET
    }
}; 