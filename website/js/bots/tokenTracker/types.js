// Token data structure
const TokenTypes = {
    SOLANA: 'solana',
    ETH: 'ethereum',
    // Add more token types as needed
};

// Message types for WebSocket communication
const MessageTypes = {
    TOKEN_UPDATE: 'token_update',
    PRICE_ALERT: 'price_alert',
    TRANSACTION: 'transaction',
    ADD_TOKEN: 'add_token'
};

// Status types for bot connection
const StatusTypes = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
}; 

module.exports = { TokenTypes, MessageTypes, StatusTypes };
