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
        // Initialize the app
        const app = new App();
        window.app = app;
        
        // Initialize the router
        initRouter();
        debugTool.logInfo('Router initialized');
        
        // Set up event listeners and UI
        setupNavigation();
        initBotStatus();
        
        debugTool.logInfo('Application initialized');
    } catch (error) {
        debugTool.logError('Error initializing application:', error);
    }
});

/**
 * Set up navigation between pages
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPage = link.getAttribute('data-page');
            debugTool.logInfo(`Navigation: Switching to ${targetPage}`);
            
            // Update active nav link
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            
            // Show the corresponding section
            contentSections.forEach(section => {
                if (section.id === targetPage) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
            
            // Update URL hash
            window.location.hash = targetPage;
        });
    });
    
    // Handle initial load based on URL hash
    const initialPage = window.location.hash.substring(1) || 'dashboard';
    const initialLink = document.querySelector(`.sidebar-nav a[data-page="${initialPage}"]`);
    
    if (initialLink) {
        initialLink.click();
    }
}

/**
 * Initialize bot status indicator in the header
 */
function initBotStatus() {
    const botStatusHeader = document.querySelector("#bot-status");
    if (botStatusHeader) {
        // Update the header status when dashboard bot status changes
        const dashboardStatus = document.querySelector(".bot-status");
        if (dashboardStatus) {
            // Monitor for changes to the dashboard status
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const newStatus = dashboardStatus.className.replace('bot-status ', '');
                        botStatusHeader.className = `status-${newStatus}`;
                        botStatusHeader.textContent = `Bot Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
                        debugTool.logInfo(`Bot status updated to: ${newStatus}`);
                    }
                });
            });
            
            observer.observe(dashboardStatus, { attributes: true });
            debugTool.logInfo('Bot status monitoring initialized');
        }
    }
} 