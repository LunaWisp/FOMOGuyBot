/**
 * Server Utilities
 * Functions for managing the HTTP server
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

/**
 * Starts the HTTP server
 * @param {string} rootDir - The root directory of the project
 * @returns {Promise<void>} - Resolves when server is started
 */
function startServer(rootDir) {
  return new Promise((resolve, reject) => {
    try {
      const websitePath = path.join(rootDir, 'website');
      logger.info(`Changing to website directory: ${websitePath}`);
      
      // Check if directory exists
      if (!fs.existsSync(websitePath)) {
        const error = new Error(`Website directory not found: ${websitePath}`);
        logger.error(error.message);
        return reject(error);
      }
      
      process.chdir(websitePath);
      
      // Check if http-server is installed
      logger.info('Checking if http-server is installed...');
      
      exec('npx http-server --version', (error) => {
        if (error) {
          logger.warning('http-server not found. Installing globally...');
          exec('npm install -g http-server', (installError) => {
            if (installError) {
              logger.error(`Failed to install http-server: ${installError.message}`);
              reject(installError);
            } else {
              resolve(startHttpServer());
            }
          });
        } else {
          resolve(startHttpServer());
        }
      });
    } catch (error) {
      logger.error(`Error navigating to website directory: ${error.message}`);
      reject(error);
    }
  });
}

/**
 * Starts the HTTP server process
 * @returns {Object} - The server process
 */
function startHttpServer() {
  logger.success('Starting http-server on port 8080...');
  logger.separator();
  logger.success('Server is now running at: http://localhost:8080');
  logger.warning('Press Ctrl+C to stop the server');
  logger.separator();
  
  // Start the server in a child process
  const serverProcess = spawn('npx', ['http-server', '-p', '8080'], {
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('error', (error) => {
    logger.error(`Error starting http-server: ${error.message}`);
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      logger.error(`http-server exited with code ${code}`);
    }
  });
  
  // Handle script termination
  process.on('SIGINT', () => {
    logger.warning('Stopping server...');
    serverProcess.kill();
    process.exit();
  });
  
  return serverProcess;
}

module.exports = {
  startServer
}; 