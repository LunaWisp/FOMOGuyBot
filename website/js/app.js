/**
 * Main Application Class
 * Controls application structure and navigation
 */

// Try to import debugTool, fallback to console if not available
let debugTool = console;

// Simple debug tool initialization to handle import errors
debugTool.logInfo = debugTool.logInfo || function(msg) { console.log('[INFO]', msg); };
debugTool.logWarning = debugTool.logWarning || function(msg) { console.warn('[WARNING]', msg); };
debugTool.logError = debugTool.logError || function(msg) { console.error('[ERROR]', msg); };

// Initialize debugging
debugTool.logInfo('Loading application...');

export class App {
    constructor() {
        // Global event listeners
        this.setupGlobalEventListeners();
        
        debugTool.logInfo('App initialized');
    }
    
    /**
     * Initialize the application
     */
    initialize() {
        // Implementation can be added later if needed
    }
    
    setupGlobalEventListeners() {
        // Theme toggler
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                document.body.classList.toggle('light-theme');
            });
        }
        
        debugTool.logInfo('Global event listeners set up');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 