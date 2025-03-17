/**
 * UI Renderer Module
 * Handles UI updates for the Token Tracker
 */

import { filterTokens, filterTransactions } from '../utils/index.js';
import { createTokenElement, createAlertElement, createTransactionElement } from '../components/index.js';

/**
 * Update the tokens UI
 * @returns {void}
 */
export function updateTokensUI() {
    console.log('Updating tokens UI');
    const tokenList = document.getElementById('tracked-tokens');
    const emptyState = document.getElementById('empty-tokens');
    
    if (!tokenList) {
        console.error('Token list container not found!');
        return;
    }
    
    console.log(`Current token count: ${this.tokenService.tokens.length}`);
    console.log(`Current search term: "${this.searchTerm}"`);
    console.log(`Current token filter: ${this.tokenFilter}`);
    
    // Filter tokens based on search term and filter option
    const filteredTokens = filterTokens(
        this.tokenService.tokens, 
        this.searchTerm, 
        this.tokenFilter
    );
    
    console.log(`Filtered token count: ${filteredTokens.length}`);
    
    // Hide all tokens except empty state
    let removedCount = 0;
    Array.from(tokenList.children).forEach(child => {
        if (!child.classList.contains('empty-state')) {
            child.remove();
            removedCount++;
        }
    });
    console.log(`Removed ${removedCount} existing token elements`);
    
    // Show/hide empty state
    if (emptyState) {
        if (filteredTokens.length === 0) {
            console.log('No tokens to display, showing empty state');
            emptyState.style.display = 'flex';
            
            // Update empty state message based on filters
            let message = 'No tokens added yet. Add a token to start tracking.';
            if (this.tokenService.tokens.length > 0) {
                message = 'No tokens match your current filters.';
            }
            emptyState.querySelector('p').textContent = message;
        } else {
            console.log('Tokens available, hiding empty state');
            emptyState.style.display = 'none';
        }
    } else {
        console.warn('Empty state element not found');
    }
    
    // Create token cards/items
    console.log('Creating token elements');
    filteredTokens.forEach(token => {
        console.log(`Creating element for token: ${token.symbol}`);
        const tokenElement = createTokenElement(token, this.viewMode);
        tokenList.appendChild(tokenElement);
    });
    
    console.log('Token UI update complete');
}

/**
 * Update the alerts UI
 * @returns {void}
 */
export function updateAlertsUI() {
    const alertsList = document.getElementById('token-alerts');
    const emptyAlerts = document.getElementById('empty-alerts');
    
    if (!alertsList) return;
    
    // Remove all alerts except empty state
    Array.from(alertsList.children).forEach(child => {
        if (!child.classList.contains('empty-state')) {
            child.remove();
        }
    });
    
    // Get alerts from the service
    const alerts = this.alertService.getAlerts();
    
    // Show/hide empty state
    if (emptyAlerts) {
        emptyAlerts.style.display = alerts.length === 0 ? 'flex' : 'none';
    }
    
    // Create alert items
    alerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsList.appendChild(alertElement);
    });
}

/**
 * Update the transactions UI
 * @returns {void}
 */
export function updateTransactionsUI() {
    const transactionsList = document.getElementById('token-transactions');
    const emptyTransactions = document.getElementById('empty-transactions');
    
    if (!transactionsList) return;
    
    // Filter transactions based on the transaction filter
    const filteredTransactions = filterTransactions(
        this.transactionService.getTransactions(),
        this.transactionFilter
    );
    
    // Remove all transactions except empty state
    Array.from(transactionsList.children).forEach(child => {
        if (!child.classList.contains('empty-state')) {
            child.remove();
        }
    });
    
    // Show/hide empty state
    if (emptyTransactions) {
        if (filteredTransactions.length === 0) {
            emptyTransactions.style.display = 'flex';
            
            // Update empty state message based on filters
            let message = 'No transactions yet. They will appear here when detected.';
            if (this.transactionService.transactions.length > 0) {
                message = 'No transactions match your current filter.';
            }
            emptyTransactions.querySelector('p').textContent = message;
        } else {
            emptyTransactions.style.display = 'none';
        }
    }
    
    // Create transaction items
    filteredTransactions.forEach(tx => {
        const txElement = createTransactionElement(tx, this.tokenService.tokens);
        transactionsList.appendChild(txElement);
    });
}

/**
 * Update the bot status UI
 * @returns {void}
 */
export function updateBotStatusUI() {
    // Update bot status in topbar
    const statusElement = document.getElementById('bot-status');
    if (statusElement) {
        statusElement.className = this.botStatus === 'running' ? 'status-connected' : 'status-disconnected';
        statusElement.textContent = `Bot Status: ${this.botStatus === 'running' ? 'Connected' : 'Disconnected'}`;
    }
    
    // Update status in bot section if present
    const botStatus = this.container.querySelector('.bot-status');
    if (botStatus) {
        botStatus.className = `bot-status ${this.botStatus}`;
        botStatus.textContent = `Bot is currently ${this.botStatus}`;
    }
}

/**
 * Render all UI components
 * @returns {void}
 */
export function render() {
    this.updateTokensUI();
    this.updateAlertsUI();
    this.updateTransactionsUI();
    this.updateBotStatusUI();
} 