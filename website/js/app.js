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
        this.currentPage = null;
        this.pages = {};
        
        // Initialize router
        this.setupRouter();
        
        // Global event listeners
        this.setupGlobalEventListeners();
        
        // Expose router functionality to window for debug tools
        window.router = {
            navigateTo: this.navigateTo.bind(this)
        };
        
        debugTool.logInfo('App initialized');
    }
    
    /**
     * Initialize the application
     */
    initialize() {
        // Implementation can be added later if needed
    }
    
    setupRouter() {
        debugTool.logInfo('Setting up router');
        
        // Initial route
        const initialPage = window.location.hash.substring(1) || 'dashboard';
        this.navigateTo(initialPage);
        
        // Handle route changes
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.substring(1) || 'dashboard';
            this.navigateTo(page);
        });
    }
    
    setupGlobalEventListeners() {
        // Navigation sidebar
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const page = link.getAttribute('data-page');
                if (page) {
                    e.preventDefault();
                    window.location.hash = page;
                }
            });
        });
        
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
    
    navigateTo(pageName) {
        debugTool.logInfo(`Navigating to ${pageName}`);
        
        // Update active navigation
        this.updateActiveNavigation(pageName);
        
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show selected section
        const targetSection = document.getElementById(pageName);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            debugTool.logInfo(`Showing page: ${pageName}`);
        } else {
            debugTool.logError(`Page not found: ${pageName}`);
        }
    }
    
    updateActiveNavigation(pageName) {
        // Remove active class from all navigation items
        const navItems = document.querySelectorAll('.sidebar-nav a');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current page
        const activeNav = document.querySelector(`.sidebar-nav a[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 