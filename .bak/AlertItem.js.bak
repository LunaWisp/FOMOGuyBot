/**
 * Alert Item Component
 * Renders alert items
 */
import { formatTime } from '../utils/formatters.js';

/**
 * Creates an alert element
 * @param {Object} alert - The alert data object
 * @returns {HTMLElement} The created alert element
 */
export function createAlertElement(alert) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${alert.type || 'info'}`;
    
    const timeString = formatTime(alert.timestamp);
    
    alertElement.innerHTML = `
        <div class="alert-message">${alert.message}</div>
        <div class="alert-time">${timeString}</div>
    `;
    
    // Add pulse animation to new alerts
    if (Date.now() - alert.timestamp < 10000) {
        alertElement.classList.add('pulse-animation');
    }
    
    return alertElement;
} 