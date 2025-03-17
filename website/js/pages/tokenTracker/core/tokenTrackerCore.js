/**
 * Token Tracker Core Module
 * Core functionality for token tracking
 */

// Import services
const { TokenService, AlertService, TransactionService } = require('../services/index.js');
const { apiService, webSocketService } = require('../../../services/index.js');
const { debugTool } = require('../../../utils/debug/index.js');

// Import modules
const { initialize, startBot, stopBot, startPolling, stopPolling } = require('.');
const { 
    updateTokensUI, 
    updateAlertsUI, 
    updateTransactionsUI, 
    updateBotStatusUI, 
    render 
} = require('../ui');

// Import handlers
const {
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
} = require('../handlers');

// Import utilities
const { filterTokens, filterTransactions, showError, showNotification } = require('../utils');

export class TokenTrackerCore {
    constructor() {
        this.container = document.getElementById('token-tracker');
        this.isInitialized = false;
        this.botStatus = 'stopped';
        this.pollingInterval = null;
        this.updateFrequency = 30000; // 30 seconds
        
        // UI state
        this.viewMode = 'card'; // card or list
        this.tokenFilter = 'all'; // all, positive, negative
        this.transactionFilter = 'all'; // all, buy, sell
        this.searchTerm = '';
        
        // Initialize services
        this.tokenService = new TokenService();
        this.alertService = new AlertService();
        this.transactionService = new TransactionService();
        
        // Set up debug logging
        debugTool.logInfo("TokenTrackerCore instance created");
    }

    /**
     * Initialize the token tracker core
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            debugTool.logInfo("Initializing TokenTrackerCore");
            
            // Set up WebSocket handlers
            this.setupWebSocketHandlers();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Start the bot automatically if not running
            if (this.botStatus !== 'running') {
                await this.startBot();
            }
            
            this.isInitialized = true;
            debugTool.logInfo("TokenTrackerCore initialized successfully");
        } catch (error) {
            debugTool.logError('Failed to initialize TokenTrackerCore:', error);
        }
    }

    setupWebSocketHandlers() {
        setupWebSocketHandlers({
            onStatusUpdate: (status) => {
                this.botStatus = status;
                this.updateBotStatusUI();
            },
            onTokenUpdate: (data) => {
                // Update token data
                const tokenIndex = this.tokenService.tokens.findIndex(t => t.id === data.tokenId);
                if (tokenIndex >= 0) {
                    this.tokenService.tokens[tokenIndex] = {
                        ...this.tokenService.tokens[tokenIndex],
                        price: data.price,
                        change24h: data.change24h
                    };
                    this.updateTokensUI();
                }
            },
            onAlert: (data) => {
                this.addAlert(data);
            },
            onTransaction: (data) => {
                this.transactionService.addTransaction(data);
                this.updateTransactionsUI();
            },
            onDisconnect: () => {
                this.botStatus = 'stopped';
                this.updateBotStatusUI();
            }
        });
    }

    setupEventListeners() {
        debugTool.logInfo('Setting up TokenTracker event listeners');
        
        // Token input and search button
        this.setupTokenInputHandlers();
        
        // Token search in header
        setupSearchHandlers(this.container, {
            onSearch: (searchTerm) => {
                debugTool.logInfo(`TokenTracker: Header search for "${searchTerm}"`);
                this.searchTerm = searchTerm;
                this.updateTokensUI();
            }
        });
        
        // View mode toggle
        setupViewModeHandlers(this.container, {
            onViewModeChange: (viewMode) => {
                debugTool.logInfo(`TokenTracker: View mode changed to ${viewMode}`);
                this.viewMode = viewMode;
                this.updateTokensUI();
            }
        });
        
        // Token filter
        setupFilterHandlers(this.container, {
            onTokenFilterChange: (filterType) => {
                debugTool.logInfo(`TokenTracker: Token filter changed to ${filterType}`);
                this.tokenFilter = filterType;
                this.updateTokensUI();
            },
            onTransactionFilterChange: (filterType) => {
                debugTool.logInfo(`TokenTracker: Transaction filter changed to ${filterType}`);
                this.transactionFilter = filterType;
                this.updateTransactionsUI();
            }
        });
        
        // Alert handlers
        setupAlertHandlers(this.container, {
            onClearAlerts: () => {
                debugTool.logInfo('TokenTracker: Clearing all alerts');
                this.alertService.clearAlerts();
                this.updateAlertsUI();
            }
        });
        
        // Token removal
        setupTokenRemovalHandlers(this.container, {
            onRemoveToken: async (tokenId) => {
                debugTool.logInfo(`TokenTracker: Removing token ${tokenId}`);
                try {
                    const removedToken = await this.tokenService.removeToken(tokenId);
                    this.updateTokensUI();
                    
                    // Add an alert for the removed token
                    if (removedToken) {
                        this.addAlert({
                            type: 'info',
                            message: `Stopped tracking ${removedToken.symbol}`
                        });
                    }
                } catch (error) {
                    debugTool.logError('Error removing token:', error);
                    showError('Failed to remove token');
                }
            }
        });
    }
    
    async loadInitialData() {
        try {
            // Load tokens, alerts, and transactions concurrently
            await Promise.all([
                this.tokenService.loadTokens(),
                this.alertService.loadAlerts(),
                this.transactionService.loadTransactions(50)
            ]);
            
            // Render all UI components
            this.render();
        } catch (error) {
            debugTool.logError('Failed to load initial data:', error);
        }
    }
    
    render() {
        // Implementation from UI renderer
        // ...
    }
    
    /**
     * Clean up resources when page is unloaded
     */
    cleanup() {
        debugTool.logInfo('Cleaning up TokenTrackerCore');
        
        // Stop polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        
        // Close websocket connections or other resources
        // ...
    }

    addAlert(alert) {
        const newAlert = this.alertService.addAlert(alert);
        if (newAlert) {
            this.updateAlertsUI();
        }
        return newAlert;
    }
} 