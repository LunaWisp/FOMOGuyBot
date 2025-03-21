/**
 * Main Application Entry Point
 */
import { App } from './app.js';
import { initRouter } from './router/index.js';

// Use the global debugTool already loaded
const debugTool = window.debugTool || console;

// Use the enhanced debug tools if available
const debugTools = window.debugTools || {
    console: {
        log: (msg) => debugTool.logInfo(msg)
    }
};

// Initialize the debug tools
debugTool.logInfo('Application starting');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    debugTool.logInfo('DOM loaded, initializing application');
    
    try {
        // Initialize the router first - this handles page navigation properly
        initRouter();
        debugTool.logInfo('Router initialized');
        
        // Set up event listeners and UI
        setupNavigation();
        initBotStatus();
        
        // Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');

        if (sidebarToggle && sidebar && mainContent) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            });
        }
        
        debugTool.logInfo('Application initialized');
    } catch (error) {
        debugTool.logError('Error initializing application:', error);
    }
});

/**
 * Set up navigation between pages
 */
function setupNavigation() {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            debugTool.logInfo('Sidebar toggled');
        });
    }
}

/**
 * Initialize bot status indicator in the header
 */
function initBotStatus() {
    const botStatusHeader = document.querySelector("#bot-status");
    
    if (!botStatusHeader) {
        debugTool.logError("Bot status header element not found");
        return;
    }
    
    // Initialize with a default state
    updateBotStatusHeader('disconnected');
    
    // Set up listeners for bot status changes
    window.addEventListener('bot-status-changed', (event) => {
        const newStatus = event.detail.status;
        updateBotStatusHeader(newStatus);
    });
    
    // Helper function to update the header status
    function updateBotStatusHeader(status) {
        botStatusHeader.className = `status-${status}`;
        botStatusHeader.textContent = `Bot Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        debugTool.logInfo(`Header bot status updated to: ${status}`);
    }
    
    // Monitor dashboard status for changes
    const dashboardStatus = document.querySelector(".bot-status");
    if (dashboardStatus) {
        // Monitor for changes to the dashboard status
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const newStatus = dashboardStatus.className.replace('bot-status ', '');
                    updateBotStatusHeader(newStatus);
                }
            });
        });
        
        observer.observe(dashboardStatus, { attributes: true });
        debugTool.logInfo('Bot status monitoring initialized');
    }
}

// Test hook again
// Test hook with both phases
// Test hook with both phases
// Test both phases
// Test both phases
