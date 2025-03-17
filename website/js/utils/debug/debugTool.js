/**
 * Universal Debug Tool
 * Logs messages for debugging in both browser and Node.js environments
 */

// Detect environment
const isNode = typeof window === 'undefined' && typeof process !== 'undefined';

// Set up environment-specific requirements
let fs, path, logFilePath;
if (isNode) {
    fs = require('fs');
    path = require('path');
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        try {
            fs.mkdirSync(logsDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create logs directory:', error);
        }
    }
    
    logFilePath = path.join(logsDir, 'debug.log');
}

// Maximum number of log entries to keep in localStorage (browser only)
const MAX_LOG_ENTRIES = 100;

// Log levels
const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
};

/**
 * Log a message with timestamp
 * @param {string} message - The message to log
 * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
 */
function log(message, level = LOG_LEVELS.INFO) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message
    };
    
    // Format for console
    const consoleMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Log to console with appropriate method
    switch (level) {
        case LOG_LEVELS.ERROR:
            console.error(consoleMessage);
            break;
        case LOG_LEVELS.WARN:
            console.warn(consoleMessage);
            break;
        case LOG_LEVELS.DEBUG:
            console.debug(consoleMessage);
            break;
        default:
            console.log(consoleMessage);
    }
    
    if (isNode) {
        // Node.js: Append to log file
        try {
            fs.appendFileSync(logFilePath, consoleMessage + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    } else {
        // Browser: Store in localStorage
        try {
            // Get existing logs
            const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
            
            // Add new log entry
            logs.push(logEntry);
            
            // Keep only the most recent logs
            while (logs.length > MAX_LOG_ENTRIES) {
                logs.shift();
            }
            
            // Save back to localStorage
            localStorage.setItem('debug_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to store log in localStorage:', error);
        }
    }
    
    return logEntry;
}

/**
 * Log an info message
 * @param {string} message - The message to log
 */
function logInfo(message) {
    return log(message, LOG_LEVELS.INFO);
}

/**
 * Log a warning message
 * @param {string} message - The message to log
 */
function logWarning(message) {
    return log(message, LOG_LEVELS.WARN);
}

/**
 * Log an error message
 * @param {string|Error} error - The error to log
 */
function logError(error) {
    const errorMessage = error instanceof Error ? `${error.message}\n${error.stack}` : error;
    return log(errorMessage, LOG_LEVELS.ERROR);
}

/**
 * Log a debug message
 * @param {string} message - The message to log
 */
function logDebug(message) {
    return log(message, LOG_LEVELS.DEBUG);
}

/**
 * Get all logs
 * @returns {Array} Array of log entries
 */
function getLogs() {
    if (isNode) {
        try {
            if (fs.existsSync(logFilePath)) {
                const logContent = fs.readFileSync(logFilePath, 'utf8');
                const logLines = logContent.split('\n').filter(line => line.trim());
                return logLines.map(line => {
                    try {
                        // Parse log line into structured format if possible
                        const timestampMatch = line.match(/\[(.*?)\]/);
                        const levelMatch = line.match(/\[.*?\] \[(.*?)\]/);
                        const timestamp = timestampMatch ? timestampMatch[1] : '';
                        const level = levelMatch ? levelMatch[1] : 'INFO';
                        const message = line.replace(/\[.*?\] \[.*?\] /, '');
                        
                        return { timestamp, level, message };
                    } catch (e) {
                        return { 
                            timestamp: new Date().toISOString(), 
                            level: 'INFO', 
                            message: line 
                        };
                    }
                });
            }
            return [];
        } catch (error) {
            console.error('Failed to read log file:', error);
            return [];
        }
    } else {
        try {
            return JSON.parse(localStorage.getItem('debug_logs') || '[]');
        } catch (error) {
            console.error('Failed to retrieve logs from localStorage:', error);
            return [];
        }
    }
}

/**
 * Clear all logs
 */
function clearLogs() {
    if (isNode) {
        try {
            fs.writeFileSync(logFilePath, '');
            console.log('Debug logs cleared');
        } catch (error) {
            console.error('Failed to clear log file:', error);
        }
    } else {
        localStorage.removeItem('debug_logs');
        console.log('Debug logs cleared');
    }
}

// Create debug tool object
const debugTool = {
    logInfo,
    logWarning,
    logError,
    logDebug,
    getLogs,
    clearLogs,
    LOG_LEVELS
};

// Export the debug tool
if (isNode) {
    // CommonJS export for Node.js
    module.exports = debugTool;
} else if (typeof window !== 'undefined') {
    // Make available globally in browser
    window.debugTool = debugTool;
    
    // Handle script module tag in browser
    if (typeof document !== 'undefined') {
        // Create a global that other modules can import
        window._debugToolExport = {
            debugTool: debugTool
        };
    }
} 