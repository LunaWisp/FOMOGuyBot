/**
 * Router Module
 * Handles navigation between pages
 */

import { debugTool } from '../utils/debug/index.js';

export class Router {
    /**
     * Create a router
     * @param {Object} pages - Map of page IDs to page objects
     */
    constructor(pages) {
        this.pages = pages;
        this.currentPage = null;
        this.navLinks = [];
        this.sections = [];
        this.defaultPage = 'dashboard';
        
        debugTool.logInfo('Router created');
    }
    
    /**
     * Initialize the router
     */
    initialize() {
        debugTool.logInfo('Initializing router');
        
        // Find navigation links and content sections
        this.navLinks = Array.from(document.querySelectorAll('.sidebar-nav a'));
        this.sections = Array.from(document.querySelectorAll('.content-section'));
        
        debugTool.logInfo(`Found ${this.navLinks.length} navigation links and ${this.sections.length} sections`);
        
        // Set up event listeners for navigation links
        this.setupNavigationEvents();
        
        // Handle initial route
        this.navigateToCurrentHash();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.navigateToCurrentHash());
        
        debugTool.logInfo('Router initialized');
    }
    
    /**
     * Set up event listeners for navigation links
     */
    setupNavigationEvents() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                
                const pageId = link.getAttribute('href').substring(1);
                debugTool.logInfo(`Link clicked: ${pageId}`);
                
                this.navigate(pageId);
            });
        });
    }
    
    /**
     * Navigate to a page
     * @param {string} pageId - ID of the page to navigate to
     */
    navigate(pageId) {
        if (!pageId) {
            pageId = this.defaultPage;
        }
        
        debugTool.logInfo(`Navigating to page: ${pageId}`);
        
        // Clean up current page if exists
        if (this.currentPage && this.pages[this.currentPage] && typeof this.pages[this.currentPage].cleanup === 'function') {
            debugTool.logInfo(`Cleaning up page: ${this.currentPage}`);
            this.pages[this.currentPage].cleanup();
        }
        
        // Update navigation links
        this.navLinks.forEach(link => {
            const linkPageId = link.getAttribute('href').substring(1);
            if (linkPageId === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Hide all sections
        this.sections.forEach(section => section.classList.add('hidden'));
        
        // Show the target section
        const targetSection = document.getElementById(pageId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            
            // Initialize the page if it exists
            if (this.pages[pageId] && typeof this.pages[pageId].initialize === 'function') {
                debugTool.logInfo(`Initializing page: ${pageId}`);
                this.pages[pageId].initialize();
            } else {
                debugTool.logWarning(`No page handler found for: ${pageId}`);
            }
            
            // Update URL without triggering another navigation
            window.history.pushState({}, '', `#${pageId}`);
            
            // Update current page
            this.currentPage = pageId;
        } else {
            debugTool.logError(`Section not found: ${pageId}`);
        }
    }
    
    /**
     * Navigate to the page specified in the current URL hash
     */
    navigateToCurrentHash() {
        const hash = window.location.hash.substring(1);
        this.navigate(hash);
    }
} 