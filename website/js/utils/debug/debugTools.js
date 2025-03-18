/**
 * Enhanced Debug Tools
 * Provides debugging tools for API calls, click events, and token tracking
 */

// Self-executing function to avoid global scope pollution
(function() {
  // Check if we're in Node.js environment first
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  // Only access window properties if we're not in Node.js
  const baseDebugTool = isNode ? console : (window.debugTool || console);
  
  let fs;
  const logFilePath = 'C:\\Users\\chris\\Desktop\\FOMOBot\\logs\\console.log';
  
  // Only load fs module in Node.js environment
  if (isNode) {
    fs = require('fs');
    // Ensure the logs directory exists (Node.js only)
    const logDir = 'C:\\Users\\chris\\Desktop\\FOMOBot\\logs';
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  const debugTools = {
    // Console override for live logging
    initConsoleLogger: () => {
      const originalConsole = { ...console };

      // Helper to write to file
      const writeToFile = (type, message, data) => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type}: ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
        if (isNode && fs) {
          // Node.js environment
          fs.appendFileSync(logFilePath, logEntry, 'utf8');
        } else if (typeof window !== 'undefined') {
          // Browser environment - just log to console, skip the API call
          // Remote logging disabled as http-server doesn't support POST
          originalConsole.log('Debug log:', logEntry);
          
          // Don't try to use fetch with http-server as it causes 405 errors
          /*
          try {
            fetch('/api/log', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type,
                message,
                data,
                timestamp
              })
            }).catch(err => {
              originalConsole.error('Failed to send log to server:', err);
            });
          } catch (e) {
            // Silently fail if fetch is not available
            originalConsole.log('Would write to file:', logEntry);
          }
          */
        } else {
          // Browser fallback: just log to console
          originalConsole.log('Would write to file:', logEntry);
        }
      };

      // Override console methods
      console.log = (...args) => {
        originalConsole.log(...args);
        writeToFile('LOG', args[0], args.slice(1));
      };
      
      console.warn = (...args) => {
        originalConsole.warn(...args);
        writeToFile('WARN', args[0], args.slice(1));
      };
      
      console.error = (...args) => {
        originalConsole.error(...args);
        writeToFile('ERROR', args[0], args.slice(1));
      };
      
      console.info = (...args) => {
        originalConsole.info(...args);
        writeToFile('INFO', args[0], args.slice(1));
      };
      
      // Store original methods for reset if needed
      debugTools.originalConsole = originalConsole;
      
      return originalConsole;
    },
    
    // Reset console to original state
    resetConsoleLogger: () => {
      if (debugTools.originalConsole) {
        Object.keys(debugTools.originalConsole).forEach(key => {
          console[key] = debugTools.originalConsole[key];
        });
        console.log('Console logger reset to original state');
      }
    },

    // API Debugging
    api: {
      logRequest: (method, url, data = {}) => {
        baseDebugTool.logInfo(`API Request: ${method} ${url}`);
        console.groupCollapsed(`API Request: ${method} ${url}`);
        console.log('Request Data:', data);
        console.groupEnd();
      },
      logResponse: (method, url, response) => {
        baseDebugTool.logInfo(`API Response: ${method} ${url}`);
        console.groupCollapsed(`API Response: ${method} ${url}`);
        console.log('Response:', response);
        console.groupEnd();
      },
      logError: (method, url, error) => {
        baseDebugTool.logError(`API Error: ${method} ${url}`);
        console.error(`API Error: ${method} ${url}`);
        console.error('Error Details:', error);
      },
      retryFetch: async (url, maxRetries = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          debugTools.api.logRequest('GET', url);
          try {
            const response = await fetch(url);
            const data = await response.json();
            debugTools.api.logResponse('GET', url, data);
            return data;
          } catch (error) {
            debugTools.api.logError('GET', url, error);
            if (attempt === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            debugTools.console.log(`Retrying API call (${attempt}/${maxRetries})`);
          }
        }
      }
    },

    // Click Debugging with Debouncing
    clicks: {
      debounce: (func, wait) => {
        let timeout;
        return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func(...args), wait);
        };
      },
      track: (selector = 'button') => {
        baseDebugTool.logInfo(`Tracking clicks on selector: ${selector}`);
        document.querySelectorAll(selector).forEach((button, index) => {
          const debouncedClick = debugTools.clicks.debounce((event) => {
            baseDebugTool.logInfo(`Button Click: ${button.id || button.textContent || index}`);
            console.group(`Button Click #${index + 1}`);
            console.log('Button:', button);
            console.log('Event:', event);
            console.log('ID:', button.id || 'No ID');
            console.groupEnd();
          }, 300); // 300ms debounce
          button.addEventListener('click', debouncedClick);
        });
      },
      
      // Enhanced sidebar button tracking - FIXED to preserve navigation
      trackSidebar: () => {
        const sidebarButtons = document.querySelectorAll('.sidebar-nav a, .sidebar-menu button, .nav-item');
        
        if (sidebarButtons.length === 0) {
          console.warn('No sidebar buttons found to track');
          return;
        }
        
        console.log(`Found ${sidebarButtons.length} sidebar buttons to track`);
        
        // Create router instance if available in window
        const router = typeof window !== 'undefined' && window.router;
        
        sidebarButtons.forEach((button, index) => {
          // DON'T clone the button - work with the original
          const buttonText = button.textContent.trim();
          const buttonId = button.id || `sidebar-btn-${index}`;
          const href = button.getAttribute('href');
          const dataPage = button.getAttribute('data-page');
          
          // Add a click listener that doesn't interfere with default behavior
          button.addEventListener('click', (event) => {
            // Log the click event
            console.log(`Sidebar button clicked: ${buttonText || buttonId}`, {
              element: button,
              id: buttonId,
              href: href,
              dataPage: dataPage,
              dataTarget: button.getAttribute('data-target'),
              dataAction: button.getAttribute('data-action')
            });
            
            // Handle app navigation with data-page attribute (primary method)
            if (dataPage && router && typeof router.navigateTo === 'function') {
              event.preventDefault();
              router.navigateTo(dataPage);
              console.log(`Navigated to ${dataPage} using router (data-page)`);
              return;
            }
            
            // Fix for SPA navigation - if it's an internal link with hash
            if (href && href.startsWith('#')) {
              const targetId = href.substring(1);
              const targetElement = document.getElementById(targetId);
              
              if (!targetElement) {
                console.warn(`Target element #${targetId} not found for sidebar button`);
              } else {
                console.log(`Found target element for ${targetId}`);
                
                // If we have router and it's a page route, use router
                if (router && typeof router.navigateTo === 'function') {
                  event.preventDefault(); // Only prevent default if we're handling navigation
                  router.navigateTo(targetId);
                  console.log(`Navigated to ${targetId} using router (href)`);
                } else {
                  // Otherwise let browser handle the link
                  console.log(`No router found, using default navigation behavior`);
                  // Don't prevent default - let the link work normally
                }
              }
            }
          });
        });
        
        // Also fix direct page navigation links
        const pageLinks = document.querySelectorAll('a[href^="/"]');
        if (pageLinks.length > 0) {
          console.log(`Found ${pageLinks.length} direct page links to fix`);
          
          pageLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            link.addEventListener('click', (event) => {
              console.log(`Direct page link clicked: ${href}`);
              // Let the browser handle normal navigation
            });
          });
        }
        
        console.log('Sidebar button tracking enabled with navigation fixes');
      }
    },

    // Enhanced Console
    console: {
      log: (message, data = {}) => {
        baseDebugTool.logInfo(message);
        console.groupCollapsed(`Log: ${message}`);
        console.log('Data:', data);
        console.log('Timestamp:', new Date().toISOString());
        console.trace('Call Stack:');
        console.groupEnd();
      },
      error: (message, error) => {
        baseDebugTool.logError(`${message}: ${error?.message || error}`);
        console.error(`Error: ${message}`, error);
        console.trace('Stack Trace:');
      }
    },

    // Token Tracker Bot with Circuit Breaker and State Checks
    tokenTracker: {
      isRunning: false,
      failureCount: 0,
      maxFailures: 5,
      resetDelay: 10000, // 10 seconds
      init: () => {
        baseDebugTool.logInfo('Initializing Token Tracker Debug');
        
        // Find token tracking elements
        const tokenTrackerBtn = document.querySelector('#add-token-btn') || 
                               document.querySelector('[data-action="add-token"]');
        
        if (!tokenTrackerBtn) {
          debugTools.console.error('Token Tracker Button not found', 'Tried #add-token-btn and [data-action="add-token"]');
          return;
        }

        const debouncedRun = debugTools.clicks.debounce(async () => {
          if (debugTools.tokenTracker.isRunning) {
            debugTools.console.log('Bot already running, skipping');
            return;
          }
          
          if (debugTools.tokenTracker.failureCount >= debugTools.tokenTracker.maxFailures) {
            debugTools.console.error('Bot disabled due to repeated failures');
            return;
          }

          // Get the token input value
          const tokenInput = document.querySelector('#token-input');
          if (!tokenInput || !tokenInput.value.trim()) {
            debugTools.console.error('No token input found or empty value');
            return;
          }

          const tokenValue = tokenInput.value.trim();
          debugTools.tokenTracker.isRunning = true;
          
          // Update status indicators
          const botStatus = document.querySelector('.bot-status');
          if (botStatus) {
            botStatus.className = 'bot-status running';
            botStatus.textContent = 'Bot is currently running';
          }

          debugTools.console.log('Token Tracker Button Clicked', { token: tokenValue });
          
          try {
            // Use real blockchain data from DexScreener
            const url = `/api/token/${tokenValue}`;
            debugTools.console.log('Fetching token data', { url });
            
            const data = await debugTools.api.retryFetch(url);
            debugTools.console.log('Token Data Retrieved', data);
            debugTools.tokenTracker.failureCount = 0; // Reset on success
            
            // Log the token data
            debugTools.console.log('Token data received', data);
            
            // Update status back to normal
            if (botStatus) {
              botStatus.className = 'bot-status stopped';
              botStatus.textContent = 'Bot is currently stopped';
            }
          } catch (error) {
            debugTools.tokenTracker.failureCount++;
            debugTools.console.error('Token Tracker Failed', error);
            
            if (debugTools.tokenTracker.failureCount >= debugTools.tokenTracker.maxFailures) {
              debugTools.console.error('Max failures reached, disabling bot');
              setTimeout(() => {
                debugTools.tokenTracker.failureCount = 0;
                debugTools.console.log('Bot failure count reset');
              }, debugTools.tokenTracker.resetDelay);
            }
            
            // Update status to error
            if (botStatus) {
              botStatus.className = 'bot-status stopped';
              botStatus.textContent = 'Bot failed to retrieve token data';
            }
          } finally {
            debugTools.tokenTracker.isRunning = false;
          }
        }, 1000); // 1-second debounce

        tokenTrackerBtn.addEventListener('click', debouncedRun);
        baseDebugTool.logInfo('Token tracker debug initialized');
      }
    }
  };

  // Helper function to add a token to the UI
  function addTokenToUI(tokenData) {
    const tokenList = document.querySelector('#tracked-tokens') || 
                     document.querySelector('.token-list-body');
    
    if (!tokenList) {
      debugTools.console.error('Token list container not found');
      return;
    }
    
    // Remove "no tokens" message if present
    const emptyState = tokenList.querySelector('.empty-state, .no-tokens');
    if (emptyState) {
      emptyState.remove();
    }
    
    // Log the token data
    debugTools.console.log('Token data received', tokenData);
  }

  // Initialize after DOM is loaded
  function initializeTools() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Initialize console logger first
      debugTools.initConsoleLogger();
      
      // Track sidebar buttons to fix issues - run immediately and after a delay
      if (typeof document !== 'undefined') {
        // Try immediately 
        debugTools.clicks.trackSidebar();
        
        // And also with delay to catch dynamically loaded elements
        setTimeout(() => {
          debugTools.clicks.trackSidebar();
        }, 500);
        
        // Also try again after SPA navigation might have happened
        window.addEventListener('hashchange', () => {
          setTimeout(() => {
            debugTools.clicks.trackSidebar();
          }, 300);
        });
      }
      
      // Initialize token tracker if in browser environment
      if (typeof document !== 'undefined') {
        debugTools.tokenTracker.init();
        debugTools.clicks.track('.sidebar-nav a, .nav-item');
      }
      
      console.log('Debug tools initialized with live logging');
    } else {
      document.addEventListener('DOMContentLoaded', initializeTools);
    }
  }
  
  // Export for different environments
  if (isNode && typeof module !== 'undefined') {
    module.exports = debugTools;
  } else if (typeof window !== 'undefined') {
    window.debugTools = debugTools;
    initializeTools();
  }
})(); 

// Track sidebar button clicks and fix navigation
window.addEventListener('DOMContentLoaded', function() {
    // Ensure our navigation fix runs after everything else
    setTimeout(function() {
        const sidebarButtons = document.querySelectorAll('.sidebar-btn');
        console.log(`Found ${sidebarButtons.length} sidebar buttons to track`);
        
        sidebarButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                const pageId = this.dataset.page;
                
                // Force the content to be visible with a slight delay to let other handlers run
                setTimeout(function() {
                    const targetSection = document.getElementById(pageId);
                    if (targetSection) {
                        // Hide all sections
                        const allSections = document.querySelectorAll('.content-section');
                        allSections.forEach(section => {
                            section.classList.add('hidden');
                            console.log(`Force hiding section: ${section.id}`);
                        });
                        
                        // Show target section
                        targetSection.classList.remove('hidden');
                        console.log(`Force showing section: ${pageId}`);
                        
                        // Update active sidebar button
                        sidebarButtons.forEach(btn => {
                            if (btn.dataset.page === pageId) {
                                btn.classList.add('active');
                            } else {
                                btn.classList.remove('active');
                            }
                        });
                    } else {
                        console.error(`Force navigation failed - section not found: ${pageId}`);
                    }
                }, 100);
            });
        });
        
        console.log('Sidebar button tracking enabled with navigation fixes');
    }, 500);
}); 