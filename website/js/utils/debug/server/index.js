/**
 * Server Debug Utilities
 * Node.js-specific debugging tools for server-side code
 */

const fs = require('fs');
const path = require('path');
const debugTool = require('../debugTool');

/**
 * Create a log directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
function ensureLogDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Ensure log directory exists
const logDir = path.join(__dirname, '..', 'logs');
ensureLogDirectory(logDir);

/**
 * Log server-specific information
 * @param {Object} info - Information to log
 */
function logServerInfo(info) {
    const timestamp = new Date().toISOString();
    const infoString = typeof info === 'object' ? JSON.stringify(info, null, 2) : info.toString();
    const message = `Server info: ${infoString}`;
    
    debugTool.logInfo(message);
}

/**
 * Log request information
 * @param {Object} req - Request object
 * @param {string} context - Request context
 */
function logRequest(req, context = '') {
    if (!req) {
        debugTool.logWarning('Attempted to log request with undefined request object');
        return;
    }
    
    const info = {
        method: req.method || 'UNKNOWN',
        url: req.url || 'UNKNOWN',
        headers: req.headers || {},
        query: req.query || {},
        body: req.body || {},
        context
    };
    
    const message = `Request [${info.method}] ${info.url} ${context ? `(${context})` : ''}`;
    debugTool.logInfo(message);
    
    // Also log to separate file for requests
    try {
        const requestLogPath = path.join(logDir, 'requests.log');
        const logEntry = `[${new Date().toISOString()}] ${message}\n${JSON.stringify(info, null, 2)}\n\n`;
        fs.appendFileSync(requestLogPath, logEntry);
    } catch (error) {
        console.error('Failed to log request details:', error);
    }
}

/**
 * Log performance metrics
 * @param {string} operation - Operation being measured
 * @param {number} duration - Duration in milliseconds
 */
function logPerformance(operation, duration) {
    const message = `Performance: ${operation} took ${duration}ms`;
    debugTool.logInfo(message);
    
    // Log to performance-specific file
    try {
        const perfLogPath = path.join(logDir, 'performance.log');
        const logEntry = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFileSync(perfLogPath, logEntry);
    } catch (error) {
        console.error('Failed to log performance data:', error);
    }
}

/**
 * Create a performance timer
 * @param {string} operation - Operation being timed
 * @returns {Function} - Function to end timing and log result
 */
function startTimer(operation) {
    const startTime = process.hrtime();
    
    return () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = (seconds * 1000) + (nanoseconds / 1000000);
        logPerformance(operation, Math.round(duration));
        return duration;
    };
}

/**
 * Log server errors in a structured way
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function logServerError(error, context = '') {
    if (!error) {
        debugTool.logWarning('Attempted to log undefined error');
        return;
    }
    
    const errorInfo = {
        message: error.message || 'Unknown error',
        stack: error.stack || 'No stack trace',
        context
    };
    
    debugTool.logError(`Server error: ${context ? `[${context}] ` : ''}${errorInfo.message}`);
    
    // Log to error-specific file
    try {
        const errorLogPath = path.join(logDir, 'errors.log');
        const logEntry = `[${new Date().toISOString()}] Error: ${errorInfo.message}\nContext: ${context}\n${errorInfo.stack}\n\n`;
        fs.appendFileSync(errorLogPath, logEntry);
    } catch (err) {
        console.error('Failed to log error details:', err);
    }
}

// Export server debug utilities
module.exports = {
    logServerInfo,
    logRequest,
    logPerformance,
    startTimer,
    logServerError
}; 