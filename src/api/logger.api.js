/**
 * Logger API Endpoint
 * Handles logging from client-side applications
 */

const fs = require('fs');
const path = require('path');
const logFilePath = path.join(process.cwd(), 'logs', 'console.log');

// Ensure the logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Save log message to the log file
 * @param {Object} logData - Log data from client
 * @param {string} logData.type - Log type (LOG, WARN, ERROR, INFO)
 * @param {string} logData.message - The log message
 * @param {Object|undefined} logData.data - Additional data
 * @param {string|undefined} logData.timestamp - When the log was created
 * @returns {boolean} Success status
 */
function saveLog(logData) {
  try {
    // Use provided timestamp or create new one
    const timestamp = logData.timestamp || new Date().toISOString();
    const type = logData.type || 'LOG';
    const message = logData.message || 'No message';
    const data = logData.data ? ` ${JSON.stringify(logData.data)}` : '';
    
    // Format log entry
    const logEntry = `[${timestamp}] [CLIENT] ${type}: ${message}${data}\n`;
    
    // Append to log file
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
    
    return true;
  } catch (error) {
    console.error('Failed to save log:', error);
    return false;
  }
}

/**
 * Set up log endpoint handlers
 * @param {Object} app - Express app instance
 */
function setupLogEndpoints(app) {
  // Log API endpoint for browser clients
  app.post('/api/log', (req, res) => {
    try {
      const logData = req.body;
      
      if (!logData || !logData.message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid log data' 
        });
      }
      
      const success = saveLog(logData);
      
      return res.json({ success });
    } catch (error) {
      console.error('Error in log API:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error processing log' 
      });
    }
  });
  
  // Debug endpoint to test if logging API is working
  app.get('/api/log/test', (req, res) => {
    const testSuccess = saveLog({
      type: 'INFO',
      message: 'Log API test',
      data: { test: true, timestamp: new Date().toISOString() }
    });
    
    res.json({ 
      success: testSuccess,
      message: 'Log API test endpoint',
      logPath: logFilePath
    });
  });
}

module.exports = {
  setupLogEndpoints,
  saveLog
}; 