/**
 * Button Debug Tools
 * Provides tools for tracking and debugging button interactions
 */

/**
 * Track a specific button's events
 * @param {HTMLElement} button - Button element to track
 * @param {string} description - Description of the button
 */
export function trackButton(button, description) {
    if (!button) return;
    
    console.log(`Tracking button: ${description || button.textContent || 'Unknown button'}`);
    
    // Add data attributes for debugging
    button.setAttribute('data-debug-tracked', 'true');
    if (description) {
        button.setAttribute('data-debug-description', description);
    }
    
    // Track clicks
    button.addEventListener('click', (event) => {
        console.log(`Button clicked: ${description || button.textContent || 'Unknown button'}`);
    });
}

/**
 * Track all buttons in a container
 * @param {HTMLElement} container - Container element
 */
export function trackAllButtons(container) {
    if (!container) container = document;
    
    const buttons = container.querySelectorAll('button, .button, [role="button"]');
    console.log(`Found ${buttons.length} buttons to track`);
    
    buttons.forEach((button, index) => {
        trackButton(button, button.textContent || `Button ${index + 1}`);
    });
}

/**
 * Highlight all tracked buttons
 * @param {boolean} highlight - Whether to highlight or remove highlight
 */
export function highlightTrackedButtons(highlight = true) {
    const trackedButtons = document.querySelectorAll('[data-debug-tracked="true"]');
    
    trackedButtons.forEach(button => {
        if (highlight) {
            button.style.border = '2px solid red';
            button.style.position = 'relative';
            
            // Add debug indicator
            let indicator = button.querySelector('.debug-indicator');
            if (!indicator) {
                indicator = document.createElement('span');
                indicator.className = 'debug-indicator';
                indicator.style.position = 'absolute';
                indicator.style.top = '-8px';
                indicator.style.right = '-8px';
                indicator.style.background = 'red';
                indicator.style.color = 'white';
                indicator.style.borderRadius = '50%';
                indicator.style.width = '16px';
                indicator.style.height = '16px';
                indicator.style.fontSize = '12px';
                indicator.style.lineHeight = '16px';
                indicator.style.textAlign = 'center';
                indicator.textContent = '🔍';
                button.appendChild(indicator);
            }
        } else {
            button.style.border = '';
            
            // Remove debug indicator
            const indicator = button.querySelector('.debug-indicator');
            if (indicator) {
                button.removeChild(indicator);
            }
        }
    });
} 