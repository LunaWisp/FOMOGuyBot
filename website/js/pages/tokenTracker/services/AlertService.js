/**
 * Alert Service
 * Handles alert-related operations
 */
const { apiService } = require('../../../services/api.js');

export class AlertService {
    constructor() {
        this.alerts = [];
    }
    
    /**
     * Loads alerts from the API
     * @returns {Promise<Array>} A promise that resolves to the loaded alerts
     */
    async loadAlerts() {
        try {
            const alerts = await apiService.getAlerts();
            this.alerts = alerts;
            return alerts;
        } catch (error) {
            console.error('Failed to load alerts:', error);
            return [];
        }
    }
    
    /**
     * Adds a new alert
     * @param {Object} alert - The alert object to add
     * @returns {Object} The newly added alert
     */
    addAlert(alert) {
        try {
            const newAlert = {
                id: Date.now(),
                timestamp: Date.now(),
                ...alert
            };
            
            this.alerts.unshift(newAlert);
            
            // Keep only the last 50 alerts
            if (this.alerts.length > 50) {
                this.alerts = this.alerts.slice(0, 50);
            }
            
            // Store alerts in localStorage
            localStorage.setItem('alerts', JSON.stringify(this.alerts));
            
            return newAlert;
        } catch (error) {
            console.error('Error adding alert:', error);
            return null;
        }
    }
    
    /**
     * Clears all alerts
     */
    clearAlerts() {
        this.alerts = [];
        localStorage.removeItem('alerts');
    }
    
    /**
     * Gets all alerts or a filtered subset
     * @param {number} limit - Optional limit for number of alerts to return
     * @returns {Array} The alerts array
     */
    getAlerts(limit) {
        if (limit && limit > 0) {
            return this.alerts.slice(0, limit);
        }
        return this.alerts;
    }
} 