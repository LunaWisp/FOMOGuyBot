/**
 * Server Utilities
 * Functions for managing the HTTP server
 */

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
      // Import and start the Express server
      const server = require('../server');
      
      logger.success('Server is now running at: http://localhost:8080');
      logger.warning('Press Ctrl+C to stop the server');
      logger.separator();
      
      resolve(server);
    } catch (error) {
      logger.error(`Error starting server: ${error.message}`);
      reject(error);
    }
  });
}

module.exports = {
  startServer
}; 