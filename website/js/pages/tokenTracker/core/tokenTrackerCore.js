/**
 * Token Tracker Core Module
 * Core functionality for token tracking
 */

// Import services
import { TokenService, AlertService, TransactionService } from '../services/index.js';
import { apiService, webSocketService } from '../../../services/index.js';
import { debugTool } from '../../../utils/debug/index.js';

// Import modules
import { 
    updateTokensUI, 
    updateAlertsUI, 
    updateTransactionsUI, 
    updateBotStatusUI, 
    render 
} from '../ui/index.js';

// Import handlers
import {
    setupTokenInputHandlers,
    setupSearchHandlers,
    setupViewModeHandlers,
    setupFilterHandlers,
    setupAlertHandlers,
    setupTokenRemovalHandlers,
    setupEventDelegation,
    setupDebugTools,
    setupWebSocketHandlers,
    connectWebSocket
} from '../handlers/index.js';

// Import utilities
import { filterTokens, filterTransactions, showError, showNotification } from '../utils/index.js';

export class TokenTrackerCore {
    constructor() {
        this.container = document.getElementById('token-tracker');
        if (!this.container) {
            throw new Error('Token tracker container not found in DOM');
        }

        this.isInitialized = false;
        this.botStatus = 'stopped';
        this.pollingInterval = null;
        this.updateFrequency = 30000; // 30 seconds
        
        // Initialize services
        this.tokenService = new TokenService();
        this.alertService = new AlertService();
        this.transactionService = new TransactionService();
        
        // UI state
        this.viewMode = 'card'; // card or list
        this.tokenFilter = 'all'; // all, positive, negative
        this.transactionFilter = 'all'; // all, buy, sell
        this.searchTerm = '';
    }

    async initialize() {
        if (this.isInitialized) {
            debugTool.logWarning('TokenTrackerCore already initialized');
            return;
        }

        try {
            debugTool.logInfo('Initializing TokenTrackerCore');
            
            // Initialize WebSocket connection
            await connectWebSocket();
            
            // Set up WebSocket handlers
            this.setupWebSocketHandlers();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Start polling for updates
            this.startPolling();
            
            // Start the bot automatically
            await this.startBot();
            
            // Track all buttons in the token tracker page
            this.setupDebugTools();
            
            this.isInitialized = true;
            debugTool.logInfo('TokenTrackerCore initialized successfully');
        } catch (error) {
            debugTool.logError('Failed to initialize TokenTrackerCore:', error);
            showError('Failed to initialize token tracker. Please refresh the page.');
            throw error;
        }
    }

    async startBot() {
        try {
            debugTool.logInfo('Starting token tracker bot');
            
            // Update UI to show bot is running
            this.botStatus = 'running';
            this.updateBotStatusUI();
            
            // Start polling for blockchain data
            this.startPolling();
            
            // Update the status in the top bar
            const statusElement = document.getElementById('bot-status');
            if (statusElement) {
                statusElement.className = 'status-connected';
                statusElement.textContent = 'Bot Status: Connected';
            }

            debugTool.logInfo('Token tracker bot started successfully');
        } catch (error) {
            debugTool.logError('Failed to start bot:', error);
            showError('Failed to start bot. Please try again.');
            throw error;
        }
    }

    stopBot() {
        try {
            debugTool.logInfo('Stopping token tracker bot');
            
            // Update UI
            this.botStatus = 'stopped';
            this.updateBotStatusUI();
            
            // Stop polling
            this.stopPolling();
            
            // Update top bar status
            const statusElement = document.getElementById('bot-status');
            if (statusElement) {
                statusElement.className = 'status-disconnected';
                statusElement.textContent = 'Bot Status: Disconnected';
            }

            debugTool.logInfo('Token tracker bot stopped successfully');
        } catch (error) {
            debugTool.logError('Failed to stop bot:', error);
            showError('Failed to stop bot. Please try again.');
            throw error;
        }
    }

    startPolling() {
        if (this.pollingInterval) {
            debugTool.logWarning('Polling already started');
            return;
        }
        
        debugTool.logInfo('Starting token polling');
        this.pollingInterval = setInterval(async () => {
            try {
                await this._pollForUpdates();
            } catch (error) {
                debugTool.logError('Error polling for updates:', error);
                // Don't stop polling on error, just log it
            }
        }, this.updateFrequency);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            debugTool.logInfo('Token polling stopped');
        }
    }

    async _pollForUpdates() {
        try {
            // Fetch updated token data
            const tokens = await this.tokenService.loadTokens();
            
            // Update UI
            this.updateTokensUI();
            
            // Check for price changes and generate alerts
            const newAlerts = this.tokenService.checkForAlerts();
            for (const alert of newAlerts) {
                await this.addAlert(alert);
            }
            
            // Fetch recent transactions
            const transactions = await this.transactionService.getTransactions(10);
            if (transactions.length > 0) {
                // Add new transactions
                for (const tx of transactions) {
                    if (!this.transactionService.transactions.some(t => t.id === tx.id)) {
                        await this.transactionService.addTransaction(tx);
                    }
                }
                
                // Update UI
                this.updateTransactionsUI();
            }
        } catch (error) {
            debugTool.logError('Error in polling update:', error);
            throw error;
        }
    }

    async cleanup() {
        try {
            debugTool.logInfo('Cleaning up TokenTrackerCore');
            
            // Stop polling
            this.stopPolling();
            
            // Stop WebSocket connection
            if (webSocketService) {
                await webSocketService.disconnect();
            }
            
            // Clear any intervals or timeouts
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
            }
            
            this.isInitialized = false;
            debugTool.logInfo('TokenTrackerCore cleaned up successfully');
        } catch (error) {
            debugTool.logError('Error cleaning up TokenTrackerCore:', error);
            throw error;
        }
    }

    async addAlert(alert) {
        try {
            await this.alertService.addAlert(alert);
            this.updateAlertsUI();
        } catch (error) {
            debugTool.logError('Error adding alert:', error);
            throw error;
        }
    }
} 