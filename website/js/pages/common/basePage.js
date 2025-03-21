/**
 * Base Page Module
 * Provides common functionality for all pages
 */

const { debugTool } = require('../../utils/debug/index.js');

export class BasePage {
    /**
     * Create a new page instance
     * @param {string} pageId - The ID of the page container element
     */
    constructor(pageId) {
        this.pageId = pageId;
        this.container = document.getElementById(pageId);
        this.isInitialized = false;
    }
    
    /**
     * Initialize the page
     * This method should be called when navigating to the page
     */
    async initialize() {
        if (this.isInitialized) {
            debugTool.logInfo(`Page ${this.pageId} already initialized`);
            return;
        }
        
        debugTool.logInfo(`Initializing page: ${this.pageId}`);
        
        try {
            // Ensure the page container is found
            if (!this.container) {
                this.container = document.getElementById(this.pageId);
                if (!this.container) {
                    throw new Error(`Container not found for page: ${this.pageId}`);
                }
            }
            
            // Show the page container
            this.showPage();
            
            // Load data
            await this.loadData();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            debugTool.logInfo(`Page ${this.pageId} initialized successfully`);
        } catch (error) {
            debugTool.logError(`Error initializing page ${this.pageId}:`, error);
            throw error;
        }
    }
    
    /**
     * Load data for the page
     * Override this method in derived classes
     */
    async loadData() {
        // Base implementation does nothing
        // Override in derived classes
    }
    
    /**
     * Set up event listeners for the page
     * Override this method in derived classes
     */
    setupEventListeners() {
        // Base implementation does nothing
        // Override in derived classes
    }
    
    /**
     * Show the page container and hide other pages
     */
    showPage() {
        // This function is now mainly handled by the router
        // But we'll ensure our container is visible
        if (this.container) {
            this.container.classList.remove('hidden');
            debugTool.logInfo(`Made ${this.pageId} visible`);
        } else {
            debugTool.logError(`Page container not found: ${this.pageId}`);
        }
    }
    
    /**
     * Clean up resources when navigating away from the page
     */
    cleanup() {
        debugTool.logInfo(`Cleaning up page: ${this.pageId}`);
        
        // Base implementation just resets the initialized flag
        this.isInitialized = false;
    }
} 