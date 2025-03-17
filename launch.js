/**
 * FOMOBot Server Manager
 * This script kills any existing http-server processes on port 8080 and starts a new one
 */

const path = require('path');
const { logger, portUtils, serverUtils } = require('./src/utils');
const { debugTool } = require('./website/js/utils/debug');
const serverDebug = require('./website/js/utils/debug/server');

// Main function to orchestrate the server launch
async function main() {
  try {
    // Display welcome message
    logger.section('FOMOBot Server - Starting');
    debugTool.logInfo('FOMOBot Server - Starting');
    
    // Kill any processes running on port 8080
    await portUtils.findAndKillProcessOnPort(8080);
    serverDebug.logServerInfo('Killed processes on port 8080');
    
    // Start the HTTP server
    await serverUtils.startServer(__dirname);
    serverDebug.logServerInfo('HTTP server started successfully');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    serverDebug.logServerError(error, 'Server startup');
    process.exit(1);
  }
}

// Run the main function
main(); 