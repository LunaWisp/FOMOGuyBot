/**
 * Settings Page Module
 * Handles user settings and configuration
 */

import { BasePage } from '../common/index.js';
import { userService, configService } from '../../services/index.js';
import { debugTool } from '../../utils/debug/index.js';

export class SettingsPage extends BasePage {
    constructor() {
        super('settings');
        
        this.settings = null;
        this.formDirty = false;
    }
    
    /**
     * Load settings data from the server
     */
    async loadData() {
        try {
            debugTool.logInfo('Loading settings data');
            
            // Fetch user settings
            this.settings = await userService.getUserSettings();
            
            // Fetch available configuration options
            this.configOptions = await configService.getConfigOptions();
            
            if (this.settings && this.configOptions) {
                this.render();
                this.fillForm();
            }
        } catch (error) {
            debugTool.logError('Failed to load settings:', error);
            this.showMessage('Failed to load settings. Please try again later.', 'error');
        }
    }
    
    /**
     * Set up event listeners for the settings page
     */
    setupEventListeners() {
        const form = this.container.querySelector('#settings-form');
        const saveButton = this.container.querySelector('#save-settings');
        const resetButton = this.container.querySelector('#reset-settings');
        
        if (!form || !saveButton || !resetButton) {
            debugTool.logError('Settings form elements not found');
            return;
        }
        
        // Handle form changes
        Array.from(form.elements).forEach(element => {
            if (element.tagName === 'BUTTON') return;
            
            element.addEventListener('change', () => {
                this.formDirty = true;
                this.updateSaveButtonState();
            });
            
            element.addEventListener('input', () => {
                this.formDirty = true;
                this.updateSaveButtonState();
            });
        });
        
        // Handle save button click
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.saveSettings();
        });
        
        // Handle reset button click
        resetButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.resetForm();
        });
        
        debugTool.logInfo('Settings event listeners set up');
    }
    
    /**
     * Update save button state based on form state
     */
    updateSaveButtonState() {
        const saveButton = this.container.querySelector('#save-settings');
        
        if (saveButton) {
            saveButton.disabled = !this.formDirty;
        }
    }
    
    /**
     * Fill form with current settings
     */
    fillForm() {
        if (!this.settings) return;
        
        const form = this.container.querySelector('#settings-form');
        
        if (!form) {
            debugTool.logError('Settings form not found');
            return;
        }
        
        // Update each form field
        Object.entries(this.settings).forEach(([key, value]) => {
            const field = form.elements[key];
            
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = value;
                } else {
                    field.value = value;
                }
            }
        });
        
        this.formDirty = false;
        this.updateSaveButtonState();
    }
    
    /**
     * Reset form to current settings
     */
    resetForm() {
        this.fillForm();
        this.showMessage('Settings reset to saved values.', 'info');
    }
    
    /**
     * Get form data as object
     * @returns {Object} Form data
     */
    getFormData() {
        const form = this.container.querySelector('#settings-form');
        
        if (!form) {
            debugTool.logError('Settings form not found');
            return null;
        }
        
        const formData = {};
        
        Array.from(form.elements).forEach(element => {
            if (element.name && element.name !== '') {
                if (element.type === 'checkbox') {
                    formData[element.name] = element.checked;
                } else if (element.type === 'number') {
                    formData[element.name] = parseFloat(element.value);
                } else {
                    formData[element.name] = element.value;
                }
            }
        });
        
        return formData;
    }
    
    /**
     * Save settings to server
     */
    async saveSettings() {
        try {
            const formData = this.getFormData();
            
            if (!formData) {
                throw new Error('Could not get form data');
            }
            
            this.setFormLoading(true);
            
            debugTool.logInfo('Saving settings', formData);
            
            // Validate settings
            const validationResult = await userService.validateSettings(formData);
            
            if (!validationResult.valid) {
                this.showMessage(validationResult.error || 'Invalid settings', 'error');
                this.setFormLoading(false);
                return;
            }
            
            // Save settings
            const result = await userService.saveSettings(formData);
            
            if (result.success) {
                this.settings = formData;
                this.formDirty = false;
                this.updateSaveButtonState();
                this.showMessage('Settings saved successfully.', 'success');
            } else {
                throw new Error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            debugTool.logError('Failed to save settings:', error);
            this.showMessage('Failed to save settings. Please try again.', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }
    
    /**
     * Set loading state on form
     * @param {boolean} isLoading - Whether form is loading
     */
    setFormLoading(isLoading) {
        const form = this.container.querySelector('#settings-form');
        const saveButton = this.container.querySelector('#save-settings');
        const resetButton = this.container.querySelector('#reset-settings');
        const loadingIndicator = this.container.querySelector('.loading-indicator');
        
        if (!form || !saveButton || !resetButton) {
            return;
        }
        
        if (isLoading) {
            // Disable form
            Array.from(form.elements).forEach(element => {
                element.disabled = true;
            });
            
            // Show loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
        } else {
            // Enable form
            Array.from(form.elements).forEach(element => {
                if (element.id !== 'save-settings' || this.formDirty) {
                    element.disabled = false;
                }
            });
            
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }
    
    /**
     * Show a message to the user
     * @param {string} message - Message text
     * @param {string} type - Message type (info, success, error)
     */
    showMessage(message, type = 'info') {
        const messageEl = this.container.querySelector('.settings-message');
        
        if (!messageEl) {
            debugTool.logWarning('Message element not found');
            return;
        }
        
        // Set message type class
        messageEl.className = 'settings-message';
        messageEl.classList.add(`message-${type}`);
        
        // Set message text
        messageEl.textContent = message;
        
        // Show message
        messageEl.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
    
    /**
     * Render the settings page
     */
    render() {
        debugTool.logInfo('Rendering settings page');
        
        // No specific rendering needed, as template is in HTML
        // Just update save button state
        this.updateSaveButtonState();
    }
    
    /**
     * Clean up event listeners and resources
     */
    cleanup() {
        super.cleanup();
        
        // Reset state
        this.formDirty = false;
        
        debugTool.logInfo('Settings page cleaned up');
    }
}

/**
 * Load the settings page
 * @returns {SettingsPage} The settings page instance
 */
export function loadSettings() {
    console.log('Loading settings page');
    try {
        const settingsPage = new SettingsPage();
        settingsPage.initialize();
        settingsPage.loadData();
        return settingsPage;
    } catch (error) {
        console.error('Error loading settings page:', error);
        throw error;
    }
} 