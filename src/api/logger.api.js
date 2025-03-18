/**
 * Logger API Endpoint
 * Handles logging from client-side applications
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFilePath = join(__dirname, '..', '..', 'logs', 'console.log');

// Ensure the logs directory exists
const logDir = join(__dirname, '..', '..', 'logs');
try {
  await fs.mkdir(logDir, { recursive: true });
} catch (error) {
  console.error('Failed to create logs directory:', error);
  // Don't throw here, just log the error
}

/**
 * Save log message to the log file
 * @param {Object} logData - Log data from client
 * @param {string} logData.type - Log type (LOG, WARN, ERROR, INFO)
 * @param {string} logData.message - The log message
 * @param {Object|undefined} logData.data - Additional data
 * @param {string|undefined} logData.timestamp - When the log was created
 * @returns {Promise<boolean>} Success status
 */
async function saveLog(logData) {
  try {
    // Validate log data
    if (!logData || typeof logData !== 'object') {
      throw new Error('Invalid log data: must be an object');
    }

    // Use provided timestamp or create new one
    const timestamp = logData.timestamp || new Date().toISOString();
    const type = logData.type || 'LOG';
    const message = logData.message || 'No message';
    const data = logData.data ? ` ${JSON.stringify(logData.data)}` : '';
    
    // Format log entry
    const logEntry = `[${timestamp}] [CLIENT] ${type}: ${message}${data}\n`;
    
    // Append to log file
    await fs.appendFile(logFilePath, logEntry, 'utf8');
    
    return true;
  } catch (error) {
    console.error('Failed to save log:', error);
    // Log to console as fallback
    console.error('Original log data:', logData);
    return false;
  }
}

/**
 * Set up log endpoint handlers
 * @param {Object} app - Express app instance
 */
function setupLogEndpoints(app) {
  if (!app || typeof app.post !== 'function') {
    throw new Error('Invalid Express app instance provided to setupLogEndpoints');
  }

  // Log API endpoint for browser clients
  app.post('/api/log', async (req, res) => {
    try {
      const logData = req.body;
      
      if (!logData || !logData.message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid log data: message is required' 
        });
      }
      
      const success = await saveLog(logData);
      
      return res.json({ 
        success,
        message: success ? 'Log saved successfully' : 'Failed to save log'
      });
    } catch (error) {
      console.error('Error in log API:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error processing log',
        details: error.message
      });
    }
  });
  
  // Debug endpoint to test if logging API is working
  app.get('/api/log/test', async (req, res) => {
    try {
      const testSuccess = await saveLog({
        type: 'INFO',
        message: 'Log API test',
        data: { test: true, timestamp: new Date().toISOString() }
      });
      
      res.json({ 
        success: testSuccess,
        message: 'Log API test endpoint',
        logPath: logFilePath,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in log test endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test logging API',
        details: error.message
      });
    }
  });
}

// Export the functions
export { setupLogEndpoints, saveLog }; 