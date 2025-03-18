/**
 * Token Tracker Page Module
 * Main entry point for the Token Tracker functionality
 */

// Import base page and dependencies, using try-catch for browser compatibility
let BasePage, TokenTrackerCore, debugTool;

try {
    // Try ES module import first
    const basePageModule = await import('../common/index.js');
    BasePage = basePageModule.BasePage;
} catch (error) {
    console.error('Failed to load BasePage via import:', error);
    // Fallback - get from global
    BasePage = window.BasePage || class DummyBasePage {
        constructor(id) { this.id = id; }
        initialize() { console.log(`Initializing dummy base page: ${this.id}`); }
        cleanup() { console.log(`Cleaning up dummy base page: ${this.id}`); }
    };
}

try {
    const coreModule = await import('./core/index.js');
    TokenTrackerCore = coreModule.TokenTrackerCore;
} catch (error) {
    console.error('Failed to load TokenTrackerCore:', error);
    TokenTrackerCore = class DummyCore {
        initialize() { console.log('Initializing dummy core'); }
        cleanup() { console.log('Cleaning up dummy core'); }
    };
}

try {
    const debugModule = await import('../../utils/debug/index.js');
    debugTool = debugModule.debugTool;
} catch (error) {
    console.error('Failed to load debugTool:', error);
    debugTool = console;
    debugTool.logInfo = debugTool.logInfo || function(msg) { console.log('[INFO]', msg); };
}

class TokenTrackerPage {
    constructor() {
        this.pageId = 'tokenTracker';
        this.container = document.getElementById(this.pageId);
        
        // Initialize core functionality
        this.core = new TokenTrackerCore();
        
        console.log('TokenTrackerPage constructor called');
    }
    
    /**
     * Initialize the token tracker page
     */
    async initialize() {
        debugTool.logInfo('Initializing TokenTrackerPage');
        console.log('TokenTrackerPage initialize called');
        
        // Get container reference
        if (!this.container) {
            this.container = document.getElementById(this.pageId);
        }
        
        // Make sure the container is visible
        if (this.container) {
            this.container.classList.remove('hidden');
            console.log('Made the tokenTracker section visible');
            
            // Set up event listeners
            this.setupEventListeners();
        } else {
            console.error('Token tracker container not found in DOM');
        }
        
        // Initialize core functionality
        try {
            await this.core.initialize();
        } catch (error) {
            console.error('Error initializing token tracker core:', error);
        }
    }
    
    /**
     * Set up event listeners for the page
     */
    setupEventListeners() {
        // Manual token tracking button (for testing)
        const testTrackBtn = document.getElementById('test-track-token');
        if (testTrackBtn) {
            testTrackBtn.addEventListener('click', async () => {
                const addressInput = document.getElementById('test-token-address');
                if (addressInput && addressInput.value.trim()) {
                    try {
                        console.log('Test button clicked, tracking token:', addressInput.value);
                        
                        // Create or get the feedback element
                        let feedback = document.querySelector('.test-message');
                        if (!feedback) {
                            feedback = document.createElement('div');
                            feedback.className = 'test-message';
                            testTrackBtn.parentNode.appendChild(feedback);
                        }
                        
                        feedback.textContent = 'Tracking token...';
                        feedback.className = 'test-message info';
                        
                        // Fetch token directly from the API
                        const response = await fetch(`/api/token/${addressInput.value}`);
                        const data = await response.json();
                        
                        console.log('Token fetch response:', data);
                        
                        // Show success message
                        feedback.textContent = 'Token fetched: ' + 
                            (data.metadata?.symbol || data.metadata?.name || addressInput.value);
                        feedback.className = 'test-message success';
                        
                        // Reload the page to see changes
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } catch (error) {
                        console.error('Error in test button handler:', error);
                        
                        // Show error message
                        let feedback = document.querySelector('.test-message');
                        if (feedback) {
                            feedback.textContent = 'Error: ' + error.message;
                            feedback.className = 'test-message error';
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Clean up resources when leaving the page
     */
    async cleanup() {
        debugTool.logInfo('Cleaning up TokenTrackerPage');
        
        // Clean up core functionality
        try {
            await this.core.cleanup();
        } catch (error) {
            console.error('Error cleaning up token tracker core:', error);
        }
    }
}

/**
 * Load the token tracker page
 * @returns {TokenTrackerPage} The token tracker page instance
 */
async function loadTokenTracker() {
    console.log('Loading token tracker page');
    try {
        const tokenTrackerPage = new TokenTrackerPage();
        await tokenTrackerPage.initialize();
        return tokenTrackerPage;
    } catch (error) {
        console.error('Error loading token tracker page:', error);
        throw error;
    }
}

// Export for ES modules
export { TokenTrackerPage, loadTokenTracker }; 