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
            
            this.render();
        } catch (error) {
            debugTool.logError('Failed to load settings data:', error);
        }
    }
    
    /**
     * Set up event listeners for the settings page
     */
    setupEventListeners() {
        // Get the form element
        const settingsForm = this.container.querySelector('#settings-form');
        if (!settingsForm) return;
        
        // Form input change tracking
        const formInputs = settingsForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.formDirty = true;
                this.updateSaveButtonState();
            });
            
            if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    this.formDirty = true;
                    this.updateSaveButtonState();
                });
            }
        });
        
        // Save button
        const saveButton = this.container.querySelector('#save-settings');
        if (saveButton) {
            saveButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.saveSettings();
            });
        }
        
        // Reset button
        const resetButton = this.container.querySelector('#reset-settings');
        if (resetButton) {
            resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm();
            });
        }
        
        debugTool.logInfo('Settings event listeners set up');
    }
    
    /**
     * Update save button state based on form changes
     */
    updateSaveButtonState() {
        const saveButton = this.container.querySelector('#save-settings');
        if (saveButton) {
            saveButton.disabled = !this.formDirty;
        }
    }
    
    /**
     * Fill form fields with current settings
     */
    fillForm() {
        if (!this.settings) return;
        
        Object.entries(this.settings).forEach(([key, value]) => {
            const input = this.container.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = Boolean(value);
                } else {
                    input.value = value;
                }
            }
        });
        
        // Reset the dirty flag after filling the form
        this.formDirty = false;
        this.updateSaveButtonState();
    }
    
    /**
     * Reset form to current settings
     */
    resetForm() {
        this.fillForm();
        debugTool.logInfo('Settings form reset');
    }
    
    /**
     * Gather form data into an object
     */
    getFormData() {
        const formData = {};
        const form = this.container.querySelector('#settings-form');
        
        if (!form) return formData;
        
        const formElements = form.querySelectorAll('[name]');
        formElements.forEach(element => {
            const name = element.name;
            
            if (element.type === 'checkbox') {
                formData[name] = element.checked;
            } else if (element.type === 'number') {
                formData[name] = Number(element.value);
            } else {
                formData[name] = element.value;
            }
        });
        
        return formData;
    }
    
    /**
     * Save settings to the server
     */
    async saveSettings() {
        try {
            const formData = this.getFormData();
            
            debugTool.logInfo('Saving settings:', formData);
            
            // Show loading state
            this.setFormLoading(true);
            
            // Save settings
            await userService.updateUserSettings(formData);
            
            // Update local settings
            this.settings = formData;
            
            // Reset form state
            this.formDirty = false;
            this.updateSaveButtonState();
            
            // Show success message
            this.showMessage('Settings saved successfully', 'success');
        } catch (error) {
            debugTool.logError('Failed to save settings:', error);
            this.showMessage('Failed to save settings', 'error');
        } finally {
            // Hide loading state
            this.setFormLoading(false);
        }
    }
    
    /**
     * Set form loading state
     */
    setFormLoading(isLoading) {
        const saveButton = this.container.querySelector('#save-settings');
        const resetButton = this.container.querySelector('#reset-settings');
        
        if (saveButton) {
            saveButton.disabled = isLoading;
            if (isLoading) {
                saveButton.classList.add('loading');
            } else {
                saveButton.classList.remove('loading');
            }
        }
        
        if (resetButton) {
            resetButton.disabled = isLoading;
        }
        
        // Disable form inputs
        const formInputs = this.container.querySelectorAll('#settings-form input, #settings-form select, #settings-form textarea');
        formInputs.forEach(input => {
            input.disabled = isLoading;
        });
    }
    
    /**
     * Show a message to the user
     */
    showMessage(message, type = 'info') {
        const messageContainer = this.container.querySelector('.message-container');
        if (!messageContainer) return;
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        // Add to container
        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageElement);
        
        // Auto-remove after a delay
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (messageContainer.contains(messageElement)) {
                    messageContainer.removeChild(messageElement);
                }
            }, 500);
        }, 3000);
    }
    
    /**
     * Render the settings page
     */
    render() {
        if (!this.settings) return;
        
        debugTool.logInfo('Rendering settings page');
        
        // Fill form with current settings
        this.fillForm();
    }
    
    /**
     * Clean up resources when navigating away
     */
    cleanup() {
        super.cleanup();
        
        // Check for unsaved changes
        if (this.formDirty) {
            debugTool.logInfo('Unsaved settings changes detected');
            // In a real app, we might prompt the user here
        }
        
        debugTool.logInfo('Settings page cleaned up');
    }
} 