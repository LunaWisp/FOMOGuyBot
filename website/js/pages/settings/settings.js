/**
 * Settings Page Module
 * Main entry point for the Settings functionality
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

class SettingsPage {
    constructor() {
        this.pageId = 'settings';
        this.container = document.getElementById(this.pageId);
        console.log('SettingsPage constructor called');
        
        // Settings state
        this.settings = {
            updateInterval: 30,
            priceAlerts: true,
            volumeAlerts: true,
            theme: 'light'
        };
    }
    
    /**
     * Initialize the settings page
     */
    initialize() {
        debugTool.logInfo('Initializing SettingsPage');
        console.log('SettingsPage initialize called');
        
        // Get container reference
        if (!this.container) {
            this.container = document.getElementById(this.pageId);
        }
        
        // Make sure the container is visible
        if (this.container) {
            this.container.classList.remove('hidden');
            console.log('Made the settings section visible');
        } else {
            console.error('Settings container not found in DOM');
        }
        
        // Load saved settings
        this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Load saved settings from localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('fomobot_settings');
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
                console.log('Loaded settings from localStorage');
            }
            
            // Update UI with loaded settings
            this.updateSettingsUI();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    /**
     * Update the settings UI with current values
     */
    updateSettingsUI() {
        const updateIntervalInput = document.getElementById('update-interval');
        const priceAlertsCheckbox = document.getElementById('price-alerts');
        const volumeAlertsCheckbox = document.getElementById('volume-alerts');
        
        if (updateIntervalInput) {
            updateIntervalInput.value = this.settings.updateInterval;
        }
        
        if (priceAlertsCheckbox) {
            priceAlertsCheckbox.checked = this.settings.priceAlerts;
        }
        
        if (volumeAlertsCheckbox) {
            volumeAlertsCheckbox.checked = this.settings.volumeAlerts;
        }
        
        console.log('Updated settings UI');
    }
    
    /**
     * Set up event listeners for settings form
     */
    setupEventListeners() {
        // Save settings button
        const saveButton = this.container.querySelector('.primary-button');
        if (saveButton) {
            saveButton.addEventListener('click', this.saveSettings.bind(this));
        }
        
        // Reset defaults button
        const resetButton = this.container.querySelector('.secondary-button');
        if (resetButton) {
            resetButton.addEventListener('click', this.resetSettings.bind(this));
        }
        
        console.log('Set up settings event listeners');
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        const updateIntervalInput = document.getElementById('update-interval');
        const priceAlertsCheckbox = document.getElementById('price-alerts');
        const volumeAlertsCheckbox = document.getElementById('volume-alerts');
        
        // Update settings object
        if (updateIntervalInput) {
            this.settings.updateInterval = parseInt(updateIntervalInput.value, 10);
        }
        
        if (priceAlertsCheckbox) {
            this.settings.priceAlerts = priceAlertsCheckbox.checked;
        }
        
        if (volumeAlertsCheckbox) {
            this.settings.volumeAlerts = volumeAlertsCheckbox.checked;
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('fomobot_settings', JSON.stringify(this.settings));
            console.log('Settings saved successfully');
            
            // Show success notification
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings');
        }
    }
    
    /**
     * Reset settings to defaults
     */
    resetSettings() {
        // Default settings
        this.settings = {
            updateInterval: 30,
            priceAlerts: true,
            volumeAlerts: true,
            theme: 'light'
        };
        
        // Update UI
        this.updateSettingsUI();
        
        // Save to localStorage
        localStorage.setItem('fomobot_settings', JSON.stringify(this.settings));
        console.log('Settings reset to defaults');
        
        // Show notification
        alert('Settings reset to defaults');
    }
    
    /**
     * Clean up resources when leaving the page
     */
    cleanup() {
        debugTool.logInfo('Cleaning up SettingsPage');
        // Any cleanup needed
    }
}

/**
 * Load the settings page
 * @returns {SettingsPage} The settings page instance
 */
function loadSettings() {
    console.log('Loading settings page');
    try {
        const settingsPage = new SettingsPage();
        settingsPage.initialize();
        return settingsPage;
    } catch (error) {
        console.error('Error loading settings page:', error);
        throw error;
    }
}

// Export for both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsPage, loadSettings };
} else {
    // Browser environment
    window.SettingsPage = SettingsPage;
    window.loadSettings = loadSettings;
} 