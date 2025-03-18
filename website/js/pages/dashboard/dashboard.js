/**
 * Dashboard Page Module
 * Main entry point for the Dashboard functionality
 */

// Import dependencies, using try-catch for browser compatibility
let debugTool;

try {
    debugTool = require('../../utils/debug/index.js').debugTool;
} catch (error) {
    console.error('Failed to load debugTool:', error);
    debugTool = console;
    debugTool.logInfo = debugTool.logInfo || function(msg) { console.log('[INFO]', msg); };
}

class DashboardPage {
    constructor() {
        this.pageId = 'dashboard';
        this.container = document.getElementById(this.pageId);
        this.botStatus = 'stopped';
        console.log('DashboardPage constructor called');
    }
    
    /**
     * Initialize the dashboard page
     */
    initialize() {
        debugTool.logInfo('Initializing DashboardPage');
        console.log('DashboardPage initialize called');
        
        // Get container reference
        if (!this.container) {
            this.container = document.getElementById(this.pageId);
        }
        
        // Make sure the container is visible
        if (this.container) {
            this.container.classList.remove('hidden');
            console.log('Made the dashboard section visible');
        } else {
            console.error('Dashboard container not found in DOM');
        }
        
        // Set up quick actions
        this.setupQuickActions();
        
        // Update stats
        this.updateStats();
    }
    
    /**
     * Update dashboard stats
     */
    updateStats() {
        // In a real implementation, these would be fetched from an API
        // For now, let's use some dummy data
        const stats = {
            totalTokens: 5,
            activeAlerts: 2,
            dailyVolume: '$12,450',
            profitLoss: '+2.5%'
        };
        
        // Update the stat cards
        const statCards = this.container.querySelectorAll('.stats-card p');
        if (statCards.length >= 4) {
            statCards[0].textContent = stats.totalTokens;
            statCards[1].textContent = stats.activeAlerts;
            statCards[2].textContent = stats.dailyVolume;
            statCards[3].textContent = stats.profitLoss;
        }
        
        console.log('Updated dashboard stats');
    }
    
    /**
     * Set up event listeners for quick actions
     */
    setupQuickActions() {
        const quickActions = this.container.querySelectorAll('.quick-action');
        
        if (quickActions.length >= 3) {
            // Start/Stop Bot button
            quickActions[0].addEventListener('click', this.toggleBotStatus.bind(this));
            
            // Add Token button
            quickActions[1].addEventListener('click', () => {
                window.location.hash = 'tokenTracker';
            });
            
            // View Analytics button
            quickActions[2].addEventListener('click', () => {
                window.location.hash = 'analytics';
            });
        }
        
        console.log('Set up dashboard quick actions');
    }
    
    /**
     * Toggle bot status between running and stopped
     */
    toggleBotStatus() {
        const botStatusElement = this.container.querySelector('.bot-status');
        const startBotButton = this.container.querySelector('.quick-action');
        
        if (botStatusElement && startBotButton) {
            if (this.botStatus === 'stopped') {
                this.botStatus = 'running';
                botStatusElement.className = 'bot-status running';
                botStatusElement.textContent = 'Bot is currently running';
                startBotButton.textContent = 'Stop Bot';
                
                // Dispatch event for other components to react to status change
                window.dispatchEvent(new CustomEvent('bot-status-changed', { 
                    detail: { status: 'running' } 
                }));
            } else {
                this.botStatus = 'stopped';
                botStatusElement.className = 'bot-status stopped';
                botStatusElement.textContent = 'Bot is currently stopped';
                startBotButton.textContent = 'Start Bot';
                
                // Dispatch event for other components to react to status change
                window.dispatchEvent(new CustomEvent('bot-status-changed', { 
                    detail: { status: 'stopped' } 
                }));
            }
            
            console.log(`Bot status toggled to: ${this.botStatus}`);
        }
    }
    
    /**
     * Clean up resources when leaving the page
     */
    cleanup() {
        debugTool.logInfo('Cleaning up DashboardPage');
        // Any cleanup needed
    }
}

/**
 * Load the dashboard page
 * @returns {DashboardPage} The dashboard page instance
 */
function loadDashboard() {
    console.log('Loading dashboard page');
    try {
        const dashboardPage = new DashboardPage();
        dashboardPage.initialize();
        return dashboardPage;
    } catch (error) {
        console.error('Error loading dashboard page:', error);
        throw error;
    }
}

// Export for ES modules
export { DashboardPage, loadDashboard }; 