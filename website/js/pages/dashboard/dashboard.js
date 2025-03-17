/**
 * Dashboard Page Module
 */
const { BasePage } = require('../common/index.js');
const { apiService } = require('../../services/index.js');
const { debugTool } = require('../../utils/debug/index.js');

export class DashboardPage extends BasePage {
    constructor() {
        super('dashboard');
        
        this.stats = {
            totalTokens: 0,
            activeAlerts: 0,
            volume24h: 0,
            profitLoss: 0
        };
        this.botStatus = 'stopped';
        this.eventHandlers = new Map();
    }

    /**
     * Load initial dashboard data
     */
    async loadData() {
        try {
            debugTool.logInfo("Loading dashboard data");
            const dashboardData = await apiService.getDashboardStats();
            
            if (dashboardData) {
                this.stats = { ...this.stats, ...dashboardData };
                this.botStatus = dashboardData.botStatus || 'stopped';
            }
            
            this.render();
        } catch (error) {
            debugTool.logError('Failed to load dashboard data:', error);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Quick actions
        const quickActions = this.container.querySelectorAll('.quick-action');
        
        quickActions.forEach(button => {
            const action = button.textContent.trim().toLowerCase();
            
            // Store reference to bound handler for cleanup
            const handler = this.handleQuickAction.bind(this, action);
            this.eventHandlers.set(button, handler);
            
            button.addEventListener('click', handler);
        });
        
        debugTool.logInfo("Dashboard event listeners set up");
    }

    /**
     * Handle quick action button clicks
     * @param {string} action - The action to perform
     */
    handleQuickAction(action, event) {
        debugTool.logInfo(`Quick action clicked: ${action}`);
        
        switch (action) {
            case 'start bot':
                this.startBot();
                break;
            case 'add token':
                // Navigate to token tracker page
                window.location.hash = 'token-tracker';
                break;
            case 'view analytics':
                // Navigate to analytics page
                window.location.hash = 'analytics';
                break;
            default:
                debugTool.logWarning(`Unknown quick action: ${action}`);
        }
    }

    /**
     * Start the bot
     */
    async startBot() {
        try {
            debugTool.logInfo("Starting bot");
            
            const result = await apiService.startBot();
            
            if (result.success) {
                this.botStatus = 'running';
                this.updateBotStatusUI();
                debugTool.logInfo("Bot started successfully");
            } else {
                throw new Error(result.error || 'Failed to start bot');
            }
        } catch (error) {
            debugTool.logError('Failed to start bot:', error);
        }
    }

    /**
     * Render the dashboard
     */
    render() {
        this.updateStatsUI();
        this.updateBotStatusUI();
        debugTool.logInfo("Dashboard rendered");
    }

    /**
     * Update the stats UI
     */
    updateStatsUI() {
        // Update stats cards
        const statsElements = this.container.querySelectorAll('.stats-card p');
        
        if (statsElements.length >= 4) {
            statsElements[0].textContent = this.stats.totalTokens;
            statsElements[1].textContent = this.stats.activeAlerts;
            statsElements[2].textContent = `$${this.stats.volume24h.toLocaleString()}`;
            statsElements[3].textContent = `${this.stats.profitLoss}%`;
        }
    }

    /**
     * Update the bot status UI
     */
    updateBotStatusUI() {
        const botStatusElement = this.container.querySelector('.bot-status');
        const startBotButton = this.container.querySelector('.quick-action:first-child');
        
        if (botStatusElement) {
            botStatusElement.className = `bot-status ${this.botStatus}`;
            botStatusElement.textContent = `Bot is currently ${this.botStatus}`;
        }
        
        if (startBotButton) {
            startBotButton.textContent = this.botStatus === 'running' ? 'Stop Bot' : 'Start Bot';
        }
    }

    /**
     * Clean up event listeners and subscriptions
     */
    cleanup() {
        super.cleanup();
        
        // Remove event listeners
        this.eventHandlers.forEach((handler, element) => {
            element.removeEventListener('click', handler);
        });
        this.eventHandlers.clear();
        
        debugTool.logInfo("Dashboard cleaned up");
    }
}

/**
 * Load the dashboard page
 * @returns {DashboardPage} The dashboard page instance
 */
export function loadDashboard() {
    console.log('Loading dashboard page');
    try {
        const dashboardPage = new DashboardPage();
        dashboardPage.initialize();
        dashboardPage.loadData();
        return dashboardPage;
    } catch (error) {
        console.error('Error loading dashboard page:', error);
        throw error;
    }
} 