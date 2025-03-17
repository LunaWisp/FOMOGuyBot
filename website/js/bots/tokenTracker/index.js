import { MessageTypes } from './types.js';
import { updateStatus, updateTokenDisplay, showPriceAlert, addTransaction } from './ui.js';

export class TokenTrackerBot {
    constructor() {
        this.trackedTokens = new Map();
        this.ws = null;
        this.isConnected = false;
    }

    initialize() {
        this.updateStatus();
    }

    updateStatus() {
        updateStatus(this.isConnected);
    }

    async connect() {
        try {
            this.ws = new WebSocket(`ws://${window.location.host}/ws`);
            
            this.ws.onopen = () => {
                this.isConnected = true;
                this.updateStatus();
                console.log('Connected to token tracking server');
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.updateStatus();
                console.log('Disconnected from token tracking server');
                // Attempt to reconnect after 5 seconds
                setTimeout(() => this.connect(), 5000);
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

        } catch (error) {
            console.error('Failed to connect to token tracking server:', error);
            this.isConnected = false;
            this.updateStatus();
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case MessageTypes.TOKEN_UPDATE:
                this.updateTokenInfo(data.token);
                break;
            case MessageTypes.PRICE_ALERT:
                showPriceAlert(data.alert);
                break;
            case MessageTypes.TRANSACTION:
                addTransaction(data.transaction);
                break;
            default:
                console.log('Unknown message type:', data);
        }
    }

    updateTokenInfo(token) {
        this.trackedTokens.set(token.address, token);
        updateTokenDisplay(Array.from(this.trackedTokens.values()));
    }

    addNewToken(address) {
        if (!address) return;
        
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({
                type: MessageTypes.ADD_TOKEN,
                address: address
            }));
        } else {
            console.error('Not connected to server');
        }
    }
} 