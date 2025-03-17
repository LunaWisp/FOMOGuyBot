// Token data structure
export const TokenTypes = {
    SOLANA: 'solana',
    ETH: 'ethereum',
    // Add more token types as needed
};

// Message types for WebSocket communication
export const MessageTypes = {
    TOKEN_UPDATE: 'token_update',
    PRICE_ALERT: 'price_alert',
    TRANSACTION: 'transaction',
    ADD_TOKEN: 'add_token'
};

// Status types for bot connection
export const StatusTypes = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
}; 