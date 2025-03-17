/**
 * Debug Checks
 * Provides specific debugging utilities for checking app functionality
 */

let debugTool;

// Check if we're in a Node.js environment
const isNode = typeof window === 'undefined';

if (isNode) {
    // Import debugTool in Node.js environment
    debugTool = require('../debugTool');
} else {
    // In browser, use the global debugTool
    debugTool = window.debugTool || console;
}

/**
 * Debugs the add token button functionality
 * @param {string} buttonId - ID of the add token button
 * @param {string} inputId - ID of the token input field
 */
function debugAddTokenButton(buttonId = 'add-token-btn', inputId = 'token-input') {
    if (isNode) {
        debugTool.logWarning('Cannot debug DOM elements in Node.js environment');
        return;
    }
    
    const button = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    
    if (!button) {
        debugTool.logWarning(`Add token button (${buttonId}) not found`);
        return;
    }
    
    if (!input) {
        debugTool.logWarning(`Token input (${inputId}) not found`);
        return;
    }
    
    debugTool.logInfo('Debugging add token functionality');
    
    // Track button clicks
    button.addEventListener('click', () => {
        const tokenValue = input.value.trim();
        debugTool.logInfo(`Add token clicked with value: "${tokenValue}"`);
        
        // Additional checks
        if (!tokenValue) {
            debugTool.logWarning('Empty token value entered');
        } else if (!/^[0-9a-fA-F]+$/.test(tokenValue)) {
            debugTool.logWarning('Token value may not be valid (not hexadecimal)');
        }
    });
    
    // Track input changes
    input.addEventListener('input', () => {
        const tokenValue = input.value.trim();
        debugTool.logDebug(`Token input value changed: "${tokenValue}"`);
    });
    
    // Apply visual indicator
    button.style.border = '1px solid rgba(0, 255, 0, 0.3)';
    input.style.border = '1px solid rgba(0, 255, 0, 0.3)';
    
    debugTool.logInfo('Token add functionality debugging enabled');
    
    // Return a function to stop debugging
    return () => {
        button.style.border = '';
        input.style.border = '';
        debugTool.logInfo('Token add functionality debugging disabled');
    };
}

/**
 * Debug form submission
 * @param {string} formId - ID of the form to debug
 */
function debugFormSubmission(formId) {
    if (isNode) {
        debugTool.logWarning('Cannot debug DOM elements in Node.js environment');
        return;
    }
    
    const form = document.getElementById(formId);
    
    if (!form) {
        debugTool.logWarning(`Form (${formId}) not found`);
        return;
    }
    
    debugTool.logInfo(`Debugging form submission: ${formId}`);
    
    // Track form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const formData = new FormData(form);
        const formValues = {};
        
        for (const [key, value] of formData.entries()) {
            formValues[key] = value;
        }
        
        debugTool.logInfo(`Form submitted: ${formId}`);
        console.log('Form values:', formValues);
        
        // Continue with original form submission
        setTimeout(() => {
            form.submit();
        }, 0);
    });
    
    // Apply visual indicator
    form.style.border = '1px dashed rgba(0, 0, 255, 0.3)';
    
    debugTool.logInfo('Form submission debugging enabled');
    
    // Return a function to stop debugging
    return () => {
        form.style.border = '';
        debugTool.logInfo('Form submission debugging disabled');
    };
}

// Export the debug functions
if (isNode) {
    module.exports = {
        debugAddTokenButton,
        debugFormSubmission
    };
} else {
    // Export for browser usage with ES modules
    export {
        debugAddTokenButton,
        debugFormSubmission
    };
} 