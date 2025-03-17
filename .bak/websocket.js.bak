/**
 * WebSocket Service Module
 * 
 * This service handles WebSocket connections for real-time blockchain data
 */

class WebSocketService {
    constructor() {
        this.ws = null;
        this.subscribers = new Map();
        this.disconnectHandlers = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000; // 5 seconds
        this.solanaSubscriptions = new Set();
        this.fallbackMode = false;
        this.simulationInterval = null;
    }

    async connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        return new Promise((resolve, reject) => {
            try {
                // For local development, connect to localhost
                // In production, this would connect to a real WebSocket server
                this.ws = new WebSocket('ws://localhost:3000');
                
                // Set connection timeout
                const connectionTimeout = setTimeout(() => {
                    console.log('WebSocket connection timeout. Using fallback mode.');
                    this.enableFallbackMode();
                    resolve(); // Resolve promise even though real connection failed
                }, 3000);

                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    clearTimeout(connectionTimeout);
                    this.reconnectAttempts = 0;
                    this.fallbackMode = false;
                    
                    // Re-subscribe to all active Solana subscriptions
                    this.resubscribeToSolana();
                    
                    resolve();
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    
                    if (!this.fallbackMode) {
                        this.notifyDisconnect();
                        this.attemptReconnect();
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    clearTimeout(connectionTimeout);
                    
                    this.enableFallbackMode();
                    resolve(); // Resolve promise even though real connection failed
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                this.enableFallbackMode();
                resolve(); // Resolve promise even though real connection failed
            }
        });
    }

    enableFallbackMode() {
        if (this.fallbackMode) return;
        
        console.log('Enabling WebSocket fallback mode');
        this.fallbackMode = true;
        
        // Clean up any existing WebSocket
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        // Notify about bot status (disconnected)
        this.notifySubscribers('status', { status: 'stopped' });
        
        // Clear any existing simulation
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
    }

    handleMessage(message) {
        // Handle different types of messages
        if (message.type === 'token_update') {
            // Token price update
            this.notifySubscribers('tokenUpdate', message.data);
        } else if (message.type === 'transaction') {
            // New transaction detected
            this.notifySubscribers('transaction', message.data);
        } else if (message.type === 'alert') {
            // Price/volume alert
            this.notifySubscribers('alert', message.data);
        } else if (message.type === 'status') {
            // Bot status update
            this.notifySubscribers('status', message.data);
        } else if (message.type === 'account_update' && message.subscription) {
            // Account update from Solana (balance, etc.)
            this.notifySubscribers(`account:${message.subscription}`, message.data);
        } else if (message.type === 'program_update' && message.subscription) {
            // Program account update from Solana
            this.notifySubscribers(`program:${message.subscription}`, message.data);
        } else if (message.type === 'slot') {
            // Slot update from Solana
            this.notifySubscribers('slot', message.data);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached, switching to fallback mode.');
            this.enableFallbackMode();
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        setTimeout(() => {
            this.connect().catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, this.reconnectDelay);
    }

    // Re-subscribe to all active Solana subscriptions after reconnect
    resubscribeToSolana() {
        this.solanaSubscriptions.forEach(sub => {
            this.sendSubscription(sub);
        });
    }

    // Subscribe to various event types
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set());
        }
        this.subscribers.get(eventType).add(callback);
        
        // If this is a Solana account or program subscription, send it to the server
        if (eventType.startsWith('account:') || eventType.startsWith('program:')) {
            const address = eventType.split(':')[1];
            this.subscribeToSolanaAddress(address, eventType.startsWith('program:'));
        }
    }

    // Subscribe to Solana account or program updates
    subscribeToSolanaAddress(address, isProgram = false) {
        const subscriptionType = isProgram ? 'program' : 'account';
        const subscriptionId = `${subscriptionType}:${address}`;
        
        // Add to local set of subscriptions
        this.solanaSubscriptions.add({
            type: subscriptionType,
            address: address
        });
        
        // Send subscription message to server if connected
        if (this.isConnected()) {
            this.sendSubscription({
                type: subscriptionType,
                address: address
            });
        }
    }

    // Send subscription request to server
    sendSubscription(subscription) {
        this.send({
            type: 'subscribe',
            subscription: subscription
        });
    }

    unsubscribe(eventType, callback) {
        if (this.subscribers.has(eventType)) {
            this.subscribers.get(eventType).delete(callback);
            
            // If this was a Solana subscription and there are no more listeners, unsubscribe
            if ((eventType.startsWith('account:') || eventType.startsWith('program:')) && 
                this.subscribers.get(eventType).size === 0) {
                const address = eventType.split(':')[1];
                this.unsubscribeFromSolanaAddress(address, eventType.startsWith('program:'));
            }
        }
    }

    // Unsubscribe from Solana account or program updates
    unsubscribeFromSolanaAddress(address, isProgram = false) {
        const subscriptionType = isProgram ? 'program' : 'account';
        const subscriptionId = `${subscriptionType}:${address}`;
        
        // Remove from local set of subscriptions
        this.solanaSubscriptions.delete({
            type: subscriptionType,
            address: address
        });
        
        // Send unsubscribe message to server if connected
        if (this.isConnected()) {
            this.send({
                type: 'unsubscribe',
                subscription: {
                    type: subscriptionType,
                    address: address
                }
            });
        }
    }

    onDisconnect(callback) {
        this.disconnectHandlers.push(callback);
    }

    notifyDisconnect() {
        this.disconnectHandlers.forEach(handler => {
            try {
                handler();
            } catch (error) {
                console.error('Error in disconnect handler:', error);
            }
        });
    }

    notifySubscribers(eventType, data) {
        if (this.subscribers.has(eventType)) {
            this.subscribers.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in subscriber callback for ${eventType}:`, error);
                }
            });
        }
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
            }
        } else if (!this.fallbackMode) {
            console.error('WebSocket is not connected');
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    disconnect() {
        // Clear any simulation interval
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        // Close WebSocket if it exists
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.fallbackMode = false;
    }
}

// Export a singleton instance
export const websocketService = new WebSocketService(); 