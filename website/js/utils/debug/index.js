/**
 * Debug Tools Index
 * Exports all debugging utilities
 */

// Detect environment
const isNode = typeof window === 'undefined' && typeof process !== 'undefined';

// Browser compatibility
let debugTool;
let debugTools;

try {
  if (isNode) {
    // Node.js environment
    const debugToolModule = require('./debugTool.js');
    debugTool = debugToolModule.default || debugToolModule;
    
    const debugToolsModule = require('./debugTools.js');
    debugTools = debugToolsModule.default || debugToolsModule;
  } else {
    // Browser environment
    debugTool = window.debugTool || console;
    debugTools = window.debugTools;
  }
} catch (error) {
  console.error('Error loading debug modules:', error);
  // Fallback for debugTool
  debugTool = {
    logInfo: console.log,
    logWarning: console.warn,
    logError: console.error,
    log: console.log
  };
}

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { debugTool, debugTools };
}

// Export for ES modules
export { debugTool, debugTools };
