/**
 * Event Delegation Module
 * Handles global event delegation for the Token Tracker
 */

const { debugTool } = require('../../../utils/debug/index.js');

/**
 * Setup event delegation for all button clicks in the token tracker
 * This ensures we capture all button events even if direct handlers fail
 * @returns {void}
 */
export function setupEventDelegation() {
    if (!this.container) return;
    
    debugTool.logInfo("Setting up event delegation for TokenTracker");
    
    this.container.addEventListener('click', (event) => {
        // Find closest button or clickable element
        const button = event.target.closest('button, input[type="button"], input[type="submit"], .btn');
        
        if (!button) return; // Not a button click
        
        const buttonId = button.id;
        const buttonText = button.textContent?.trim();
        
        debugTool.logInfo(`Button clicked via delegation: ${buttonId || buttonText || 'unnamed'}`);
        
        // Handle specific buttons
        if (buttonId === 'add-token-btn') {
            debugTool.logInfo("Delegation captured add-token-btn click");
            
            // Check if the event was already handled by a direct handler
            if (event.defaultPrevented) {
                debugTool.logInfo("Event was already handled by direct handler");
                return;
            }
            
            // If the button has a direct handler but it didn't work, handle it here
            const directlyHandled = button.hasAttribute('data-directly-handled');
            if (directlyHandled) {
                debugTool.logWarning("Button has direct handler but event wasn't handled - handling via delegation");
            }
            
            // Get the input value
            const tokenInput = document.getElementById('token-input');
            if (!tokenInput) return;
            
            const searchText = tokenInput.value.trim();
            if (searchText.length < 2) return;
            
            debugTool.logInfo(`Delegation handling search for: "${searchText}"`);
            
            // If it looks like a full Solana address, try to add it
            if (searchText.length >= 32 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(searchText)) {
                this.tokenService.addToken(searchText)
                    .then(() => this.updateTokensUI())
                    .catch(err => debugTool.logError("Error adding token in delegation handler:", err));
            } else {
                // Otherwise use it as a search term
                this.searchTerm = searchText;
                this.updateTokensUI();
            }
        }
    });
    
    debugTool.logInfo("Event delegation setup complete");
} 