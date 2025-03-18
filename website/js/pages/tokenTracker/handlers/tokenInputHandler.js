/**
 * Token Input Handler
 * Manages token input and search functionality
 */

import { debugTool } from '../../../utils/debug/index.js';
import { filterTokens, showNotification } from '../utils/index.js';

/**
 * Set up the token input and search button handlers
 * @returns {void}
 */
export function setupTokenInputHandlers() {
    debugTool.logInfo('Setting up token input handlers directly');
    
    const searchBtn = document.getElementById('add-token-btn');
    const tokenInput = document.getElementById('token-input');
    const tokenFeedback = document.getElementById('token-input-feedback');
    
    if (!searchBtn || !tokenInput) {
        debugTool.logError('Search button or input not found:', {
            searchBtn: !!searchBtn,
            tokenInput: !!tokenInput
        });
        
        // Try again after a short delay
        setTimeout(() => this.setupTokenInputHandlers(), 500);
        return;
    }
    
    debugTool.logInfo('Found search button and input, setting up handlers');
    
    // Mark this button as directly handled to prevent duplicate handlers
    searchBtn.setAttribute('data-directly-handled', 'true');
    
    // Change button text to "Search"
    searchBtn.textContent = 'Search';
    
    // Update input placeholder
    tokenInput.placeholder = 'Enter token name, symbol or address';
    
    // Input validation
    tokenInput.addEventListener('input', () => {
        const value = tokenInput.value.trim();
        debugTool.logDebug(`Token input value changed: "${value}"`);
        
        if (value.length === 0) {
            if (tokenFeedback) tokenFeedback.textContent = '';
            if (tokenFeedback) tokenFeedback.className = 'input-feedback';
            searchBtn.disabled = true;
        } else if (value.length < 2) {
            if (tokenFeedback) tokenFeedback.textContent = 'Enter at least 2 characters';
            if (tokenFeedback) tokenFeedback.className = 'input-feedback error';
            searchBtn.disabled = true;
        } else {
            if (tokenFeedback) tokenFeedback.textContent = 'Press Search to find tokens';
            if (tokenFeedback) tokenFeedback.className = 'input-feedback valid';
            searchBtn.disabled = false;
        }
    });
    
    // Trigger validation on initial load
    tokenInput.dispatchEvent(new Event('input'));
    
    // Direct connection to token tracker bot
    const self = this;
    searchBtn.addEventListener('click', async function(event) {
        event.preventDefault();
        const searchText = tokenInput.value.trim();
        const tokenFeedback = document.getElementById('token-input-feedback');
        
        if (!searchText) {
            if (tokenFeedback) {
                tokenFeedback.textContent = 'Please enter a token address';
                tokenFeedback.className = 'input-feedback error';
            }
            return;
        }
        
        // Check if input looks like a token address
        if (searchText.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(searchText)) {
            debugTool.logInfo('Detected token address format, fetching token data from bot');
            
            try {
                // Show loading state
                if (tokenFeedback) {
                    tokenFeedback.textContent = 'Adding token...';
                    tokenFeedback.className = 'input-feedback loading';
                }
                
                // Connect to token tracker bot to add token
                const newToken = await self.tokenService.addToken(searchText);
                debugTool.logInfo('Token data retrieved from bot:', newToken);
                
                // Update UI with new token
                self.updateTokensUI();
                
                // Add notification for the user
                self.addAlert({
                    type: 'success',
                    tokenId: newToken.id,
                    message: `Started tracking ${newToken.symbol}`
                });
                
                // Clear input on success
                tokenInput.value = '';
                if (tokenFeedback) {
                    tokenFeedback.textContent = `Token ${newToken.symbol} added successfully!`;
                    tokenFeedback.className = 'input-feedback valid';
                }
                
                // Highlight the newly added token
                setTimeout(() => {
                    const tokenElement = document.querySelector(`[data-token-id="${newToken.id}"]`);
                    if (tokenElement) {
                        tokenElement.classList.add('highlight');
                        setTimeout(() => tokenElement.classList.remove('highlight'), 2000);
                    }
                }, 100);
            } catch (error) {
                console.error('Error adding token:', error);
                if (tokenFeedback) {
                    tokenFeedback.textContent = error.message || 'Failed to add token';
                    tokenFeedback.className = 'input-feedback error';
                }
            }
        } else {
            if (tokenFeedback) {
                tokenFeedback.textContent = 'Please enter a valid Solana token address';
                tokenFeedback.className = 'input-feedback error';
            }
        }
    });
    
    // Allow pressing Enter to search
    tokenInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && !searchBtn.disabled) {
            debugTool.logInfo('Enter key pressed in token input');
            searchBtn.click(); // Trigger the click event
        }
    });
    
    debugTool.logInfo('Token input handlers set up successfully');
} 