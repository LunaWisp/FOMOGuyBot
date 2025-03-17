/**
 * Debug Manager
 * Centralized manager for all debugging features across the application
 */
const { debugTool } = require('../index.js');
const { trackAllButtons, highlightTrackedButtons } = require('../tools/buttonTools.js');
const { inspectAllButtons } = require('../tools/elementInspector.js');
const { trackDynamicButtons, trackDOMChanges } = require('../trackers/dynamicTracker.js');

/**
 * Debug Manager class - initializes and manages debug tools for all pages
 */
export class DebugManager {
    constructor() {
        this.pages = {};
        this.activeObservers = [];
        this.config = {
            enabled: true,
            logLevel: 'info', // 'debug', 'info', 'warn', 'error'
            visualIndicators: true,
            trackButtons: true,
            trackDynamicElements: true,
            trackDOMChanges: false
        };
        
        // Load config from localStorage if available
        this.loadConfig();
        
        debugTool.logInfo('Debug Manager initialized');
    }
    
    /**
     * Load debug configuration from localStorage
     */
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('debug_config');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsedConfig };
                debugTool.logInfo('Debug config loaded from localStorage');
            }
        } catch (error) {
            debugTool.logError('Failed to load debug config:', error);
        }
    }
    
    /**
     * Save current debug configuration to localStorage
     */
    saveConfig() {
        try {
            localStorage.setItem('debug_config', JSON.stringify(this.config));
            debugTool.logInfo('Debug config saved to localStorage');
        } catch (error) {
            debugTool.logError('Failed to save debug config:', error);
        }
    }
    
    /**
     * Update debug configuration
     * @param {Object} configUpdates - Configuration updates to apply
     */
    updateConfig(configUpdates) {
        this.config = { ...this.config, ...configUpdates };
        this.saveConfig();
        debugTool.logInfo('Debug config updated:', this.config);
    }
    
    /**
     * Initialize debug tools for a specific page
     * @param {string} pageName - Name of the page to initialize debug tools for
     * @param {HTMLElement} container - Page container element
     * @param {Object} options - Additional options
     */
    initializePage(pageName, container, options = {}) {
        if (!this.config.enabled) return;
        
        debugTool.logInfo(`Initializing debug tools for ${pageName} page`);
        
        if (!container) {
            debugTool.logError(`Cannot initialize debug tools for ${pageName} - container not found`);
            return;
        }
        
        // Configure debug settings for this page
        const pageConfig = {
            trackButtons: options.trackButtons !== undefined ? options.trackButtons : this.config.trackButtons,
            visualIndicators: options.visualIndicators !== undefined ? options.visualIndicators : this.config.visualIndicators,
            trackDynamicElements: options.trackDynamicElements !== undefined ? options.trackDynamicElements : this.config.trackDynamicElements,
            trackDOMChanges: options.trackDOMChanges !== undefined ? options.trackDOMChanges : this.config.trackDOMChanges
        };
        
        // Store page info
        this.pages[pageName] = {
            container,
            config: pageConfig,
            observers: []
        };
        
        // Initialize debug tools based on config
        if (pageConfig.trackButtons) {
            this._initializeButtonTracking(pageName, container);
        }
        
        if (pageConfig.trackDynamicElements) {
            this._initializeDynamicTracking(pageName, container);
        }
        
        if (pageConfig.trackDOMChanges) {
            this._initializeDOMTracking(pageName, container);
        }
        
        debugTool.logInfo(`Debug tools initialized for ${pageName} page`);
        
        return this.pages[pageName];
    }
    
    /**
     * Initialize button tracking for a page
     * @param {string} pageName - Page name
     * @param {HTMLElement} container - Page container
     * @private
     */
    _initializeButtonTracking(pageName, container) {
        debugTool.logInfo(`Initializing button tracking for ${pageName}`);
        
        // Track all buttons in the container
        const buttonCount = trackAllButtons(container, {
            section: pageName,
            preventUnhandledEvents: false
        });
        
        debugTool.logInfo(`Tracked ${buttonCount} buttons in ${pageName}`);
        
        // Log detailed info about buttons
        inspectAllButtons(container, pageName);
        
        // Add visual indicators for tracked buttons
        if (this.pages[pageName].config.visualIndicators) {
            highlightTrackedButtons(container);
        }
        
        return buttonCount;
    }
    
    /**
     * Initialize dynamic element tracking for a page
     * @param {string} pageName - Page name
     * @param {HTMLElement} container - Page container
     * @private
     */
    _initializeDynamicTracking(pageName, container) {
        debugTool.logInfo(`Initializing dynamic element tracking for ${pageName}`);
        
        // Track dynamically added buttons
        const observer = trackDynamicButtons({
            section: `${pageName}-dynamic`,
            preventUnhandledEvents: false,
            callback: button => {
                debugTool.logInfo(`Dynamic button detected in ${pageName}: ${button.textContent || button.id || 'unnamed'}`);
                
                if (this.pages[pageName].config.visualIndicators) {
                    button.setAttribute('data-debug-dynamic', 'true');
                    
                    // Add pulsating effect to highlight new buttons
                    button.classList.add('debug-dynamic-element');
                    setTimeout(() => button.classList.remove('debug-dynamic-element'), 3000);
                }
            }
        });
        
        // Store observer for cleanup
        if (observer) {
            this.pages[pageName].observers.push(observer);
            this.activeObservers.push(observer);
        }
        
        return observer;
    }
    
    /**
     * Initialize DOM change tracking for a page
     * @param {string} pageName - Page name
     * @param {HTMLElement} container - Page container
     * @private
     */
    _initializeDOMTracking(pageName, container) {
        debugTool.logInfo(`Initializing DOM tracking for ${pageName}`);
        
        // Track DOM changes within the container only
        const observer = trackDOMChanges({
            logAll: false,
            filter: mutation => {
                // Focus on significant changes only to avoid noise
                if (mutation.type === 'attributes') {
                    // Skip style and class changes as they're too noisy
                    return !['style', 'class'].includes(mutation.attributeName);
                }
                return true;
            }
        }, container);
        
        // Store observer for cleanup
        if (observer) {
            this.pages[pageName].observers.push(observer);
            this.activeObservers.push(observer);
        }
        
        return observer;
    }
    
    /**
     * Clean up debug tools for a specific page
     * @param {string} pageName - Name of the page to clean up
     */
    cleanupPage(pageName) {
        debugTool.logInfo(`Cleaning up debug tools for ${pageName}`);
        
        if (!this.pages[pageName]) {
            debugTool.logWarning(`No debug tools found for ${pageName}`);
            return;
        }
        
        // Disconnect all observers
        this.pages[pageName].observers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
                
                // Remove from active observers list
                const index = this.activeObservers.indexOf(observer);
                if (index !== -1) {
                    this.activeObservers.splice(index, 1);
                }
            }
        });
        
        // Clear observers array
        this.pages[pageName].observers = [];
        
        debugTool.logInfo(`Debug tools cleaned up for ${pageName}`);
    }
    
    /**
     * Clean up all debug tools
     */
    cleanupAll() {
        debugTool.logInfo('Cleaning up all debug tools');
        
        // Clean up each page
        Object.keys(this.pages).forEach(pageName => {
            this.cleanupPage(pageName);
        });
        
        // Disconnect any remaining observers
        this.activeObservers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        
        // Clear active observers
        this.activeObservers = [];
        
        debugTool.logInfo('All debug tools cleaned up');
    }
    
    /**
     * Set debug mode enabled/disabled
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        this.saveConfig();
        
        if (!enabled) {
            this.cleanupAll();
        }
        
        debugTool.logInfo(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
} 