/**
 * Logger Utility
 * Provides colored console logging functions for the application
 */

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Logger functions
const logger = {
  /**
   * Logs an informational message in cyan
   * @param {string} msg - The message to log
   */
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  
  /**
   * Logs a success message in green
   * @param {string} msg - The message to log
   */
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  
  /**
   * Logs a warning message in yellow
   * @param {string} msg - The message to log
   */
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  
  /**
   * Logs an error message in red
   * @param {string} msg - The message to log
   */
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  
  /**
   * Logs a separator line
   */
  separator: () => console.log('=========================================='),
  
  /**
   * Logs a titled section with separator lines
   * @param {string} title - The section title
   */
  section: (title) => {
    console.log('==========================================');
    console.log(`${colors.cyan}${title}${colors.reset}`);
    console.log('==========================================');
  }
};

module.exports = logger; 