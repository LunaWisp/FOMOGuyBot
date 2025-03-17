/**
 * Tracker Initializer Module
 * Handles initialization, bot management, and polling for the Token Tracker
 */

const { debugTool, debugAddTokenButton } = require('../../../utils/debug/index.js');
const { showError } = require('../utils/index.js');
const { apiService } = require('../../../services/api.js');
const { connectWebSocket, startBot as startBotHandler, stopBot as stopBotHandler } = require('../handlers/index.js');

/**
 * Initialize the Token Tracker
 * @returns {Promise<void>}
 */
export async function initialize() {
    if (this.isInitialized) return;

    try {
        debugTool.logInfo("Initializing TokenTracker page");
        
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
        
        // Directly debug the add-token-btn
        setTimeout(() => {
            debugTool.logInfo("Running delayed add-token-btn debug check");
            debugAddTokenButton();
        }, 500);
        
        this.isInitialized = true;
        debugTool.logInfo("TokenTracker page initialized successfully");
    } catch (error) {
        debugTool.logError('Failed to initialize TokenTracker:', error);
        showError('Failed to initialize TokenTracker. Please refresh the page.');
    }
}

/**
 * Start the token tracker bot
 * @returns {Promise<void>}
 */
export async function startBot() {
    try {
        const success = startBotHandler();
        if (success) {
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
        } else {
            throw new Error('Failed to start bot');
        }
    } catch (error) {
        console.error('Failed to start bot:', error);
        showError('Failed to start bot. Please try again.');
    }
}

/**
 * Stop the token tracker bot
 * @returns {void}
 */
export function stopBot() {
    try {
        const success = stopBotHandler();
        if (success) {
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
        }
    } catch (error) {
        console.error('Failed to stop bot:', error);
    }
}

/**
 * Start polling for token updates
 * @returns {void}
 */
export function startPolling() {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(async () => {
        try {
            console.log('Polling for token updates...');
            
            // Fetch updated token data
            const tokens = await apiService.getTokens();
            this.tokenService.tokens = tokens;
            
            // Update UI
            this.updateTokensUI();
            
            // Check for price changes and generate alerts
            const newAlerts = this.tokenService.checkForAlerts();
            for (const alert of newAlerts) {
                this.addAlert(alert);
            }
            
            // Fetch recent transactions
            const transactions = await apiService.getTransactions(10);
            if (transactions.length > 0) {
                // Add new transactions
                for (const tx of transactions) {
                    if (!this.transactionService.transactions.some(t => t.id === tx.id)) {
                        this.transactionService.addTransaction(tx);
                    }
                }
                
                // Update UI
                this.updateTransactionsUI();
            }
        } catch (error) {
            console.error('Error polling for updates:', error);
        }
    }, this.updateFrequency);
}

/**
 * Stop polling for token updates
 * @returns {void}
 */
export function stopPolling() {
    if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }
} 