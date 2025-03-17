/**
 * Token Input Handler
 * Manages token input and search functionality
 */

const { debugTool } = require('../../../utils/debug/index.js');
const { filterTokens, showNotification } = require('../utils/index.js');

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
        event.preventDefault(); // Prevent form submission if in a form
        debugTool.logInfo('Search button clicked - connecting to token tracker bot');
        const searchText = tokenInput.value.trim();
        
        if (searchText.length < 2) {
            if (tokenFeedback) {
                tokenFeedback.textContent = 'Enter at least 2 characters';
                tokenFeedback.className = 'input-feedback error';
            }
            return;
        }
        
        try {
            // Visual feedback during search
            searchBtn.disabled = true;
            searchBtn.textContent = 'Searching...';
            if (tokenFeedback) {
                tokenFeedback.textContent = 'Connecting to token tracker...';
                tokenFeedback.className = 'input-feedback';
            }
            
            // Check if input looks like a token address
            if (searchText.length >= 32 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(searchText)) {
                debugTool.logInfo('Detected token address format, fetching token data from bot');
                
                try {
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
                    debugTool.logError(`Error connecting to token tracker bot: ${error.message}`);
                    if (tokenFeedback) {
                        tokenFeedback.textContent = error.message || 'Failed to connect to token tracker';
                        tokenFeedback.className = 'input-feedback error';
                    }
                }
            } else {
                // Use as search term to find tokens
                debugTool.logInfo('Using as search term for token metadata');
                
                // Update search term and refresh token display
                self.searchTerm = searchText;
                self.updateTokensUI();
                
                // Get matched tokens for user feedback
                const filteredTokens = filterTokens(
                    self.tokenService.tokens,
                    searchText,
                    self.tokenFilter
                );
                
                // Show feedback about search results
                if (tokenFeedback) {
                    if (filteredTokens.length > 0) {
                        tokenFeedback.textContent = `Found ${filteredTokens.length} matching token(s)`;
                        tokenFeedback.className = 'input-feedback valid';
                    } else {
                        tokenFeedback.textContent = 'No matching tokens found';
                        tokenFeedback.className = 'input-feedback';
                    }
                }
                
                // Show notification about search results
                showNotification(
                    `Found ${filteredTokens.length} token(s) matching "${searchText}"`, 
                    filteredTokens.length > 0 ? 'success' : 'info'
                );
            }
        } catch (error) {
            debugTool.logError(`Error in token search: ${error.message}`);
            if (tokenFeedback) {
                tokenFeedback.textContent = error.message || 'Search failed';
                tokenFeedback.className = 'input-feedback error';
            }
        } finally {
            // Reset button state
            searchBtn.disabled = false;
            searchBtn.textContent = 'Search';
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