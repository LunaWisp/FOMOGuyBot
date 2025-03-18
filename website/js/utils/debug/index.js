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
    const debugToolModule = await import('./debugTool.js');
    debugTool = debugToolModule.default || debugToolModule;
    
    const debugToolsModule = await import('./debugTools.js');
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

// Export for ES modules
export { debugTool, debugTools };
