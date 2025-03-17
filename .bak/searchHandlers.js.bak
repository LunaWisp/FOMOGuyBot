/**
 * Search Handlers Module
 * Handles token search functionality
 */

import { debugTool } from '../../../utils/debug';

/**
 * Sets up event listeners for token search
 * @param {HTMLElement} container - The container element
 * @param {Object} callbacks - Callback functions for various events
 */
export function setupSearchHandlers(container, callbacks) {
    const { onSearch } = callbacks;
    
    const searchInput = document.getElementById('token-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        debugTool.logInfo(`Setting up search handlers for input #${searchInput.id} and button #${searchBtn.id}`);
        
        // Clear any existing event listeners
        const searchInputClone = searchInput.cloneNode(true);
        const searchBtnClone = searchBtn.cloneNode(true);
        
        if (searchInput.parentNode) {
            searchInput.parentNode.replaceChild(searchInputClone, searchInput);
        }
        
        if (searchBtn.parentNode) {
            searchBtn.parentNode.replaceChild(searchBtnClone, searchBtn);
        }
        
        // Get the new DOM references
        const newSearchInput = document.getElementById('token-search');
        const newSearchBtn = document.getElementById('search-btn');
        
        if (!newSearchInput || !newSearchBtn) {
            debugTool.logError("Failed to replace search elements");
            return;
        }
        
        // Make search button visible and properly styled
        newSearchBtn.style.display = 'inline-block';
        newSearchBtn.disabled = false;
        
        // Handle input changes for live search
        newSearchInput.addEventListener('input', (e) => {
            const searchTerm = newSearchInput.value.trim().toLowerCase();
            debugTool.logDebug(`Search input changed: "${searchTerm}"`);
            
            // Enable/disable search button
            newSearchBtn.disabled = searchTerm.length === 0;
        });
        
        // Handle search button clicks
        newSearchBtn.addEventListener('click', (e) => {
            debugTool.logInfo("Search button clicked");
            e.preventDefault(); // Prevent form submission if in a form
            
            const searchTerm = newSearchInput.value.trim().toLowerCase();
            debugTool.logInfo(`Executing search for: "${searchTerm}"`);
            
            if (typeof onSearch === 'function') {
                onSearch(searchTerm);
                
                // Visual feedback
                newSearchBtn.classList.add('active');
                setTimeout(() => {
                    newSearchBtn.classList.remove('active');
                }, 200);
            } else {
                debugTool.logError("onSearch callback is not defined");
            }
        });
        
        // Handle pressing Enter in search field
        newSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                debugTool.logInfo("Enter key pressed in search field");
                const searchTerm = newSearchInput.value.trim().toLowerCase();
                
                if (typeof onSearch === 'function') {
                    onSearch(searchTerm);
                } else {
                    debugTool.logError("onSearch callback is not defined");
                }
                
                // Trigger button visual feedback
                newSearchBtn.classList.add('active');
                setTimeout(() => {
                    newSearchBtn.classList.remove('active');
                }, 200);
            }
        });
        
        // Focus search field when clicking the search button
        newSearchBtn.addEventListener('focus', () => {
            newSearchInput.focus();
        });
        
        debugTool.logInfo("Search handlers setup complete");
    } else {
        debugTool.logError(`Search elements not found: input=${!!searchInput}, button=${!!searchBtn}`);
    }
} 