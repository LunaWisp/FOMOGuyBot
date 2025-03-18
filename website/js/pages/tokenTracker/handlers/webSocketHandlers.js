/**
 * WebSocket Handlers
 * Handles all WebSocket-related events for the TokenTracker page
 */
const { websocketService } = require('../../../services/websocket.js');

/**
 * Sets up WebSocket event handlers
 * @param {Object} callbacks - Callback functions for various events
 */
export function setupWebSocketHandlers(callbacks) {
    const { 
        onStatusUpdate, 
        onTokenUpdate,
        onTokenLiveStatus,
        onMarketActivity,
        onTransactionCount,
        onAlert, 
        onTransaction,
        onDisconnect
    } = callbacks;
    
    // Bot status updates
    websocketService.subscribe('status', (data) => {
        onStatusUpdate(data.status);
    });
    
    // Token updates with enhanced data
    websocketService.subscribe('tokenUpdate', (data) => {
        onTokenUpdate(data);
    });

    // Token live status updates
    websocketService.subscribe('tokenLiveStatus', (data) => {
        onTokenLiveStatus(data);
    });

    // Market activity updates
    websocketService.subscribe('marketActivity', (data) => {
        onMarketActivity(data);
    });

    // Transaction count updates
    websocketService.subscribe('transactionCount', (data) => {
        onTransactionCount(data);
    });
    
    // Alerts
    websocketService.subscribe('alert', (data) => {
        onAlert(data);
    });
    
    // Transactions
    websocketService.subscribe('transaction', (data) => {
        onTransaction(data);
    });
    
    // Disconnection
    websocketService.onDisconnect(() => {
        onDisconnect();
    });
}

/**
 * Initiates a connection to the WebSocket server
 * @returns {Promise<void>}
 */
export async function connectWebSocket() {
    try {
        await websocketService.connect();
        return true;
    } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        return false;
    }
}

/**
 * Sends a command to start the bot
 */
export function startBot() {
    try {
        websocketService.send({
            type: 'command',
            command: 'start'
        });
        return true;
    } catch (error) {
        console.error('Failed to send start command:', error);
        return false;
    }
}

/**
 * Sends a command to stop the bot
 */
export function stopBot() {
    try {
        websocketService.send({
            type: 'command',
            command: 'stop'
        });
        return true;
    } catch (error) {
        console.error('Failed to send stop command:', error);
        return false;
    }
}

/**
 * Checks if the WebSocket is currently connected
 * @returns {boolean} Connection status
 */
export function isWebSocketConnected() {
    return websocketService.isConnected();
} 