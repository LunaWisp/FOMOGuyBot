/**
 * Port Utilities
 * Functions for managing processes running on specific ports
 */

const { exec } = require('child_process');
const os = require('os');
const logger = require('./logger');

// Determine the operating system
const isWindows = os.platform() === 'win32';

/**
 * Finds and kills processes running on a specific port
 * @param {number} port - The port to check
 * @returns {Promise<void>} - Resolves when processes are killed or none found
 */
function findAndKillProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    let command;
    
    if (isWindows) {
      // Windows command
      command = `netstat -ano | findstr :${port}`;
    } else {
      // Unix/Mac command
      command = `lsof -i :${port} -t`;
    }
    
    logger.info(`Checking for processes using port ${port}...`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // No process found or other error
        logger.success(`No processes found using port ${port}.`);
        return resolve();
      }
      
      if (stdout) {
        try {
          let pids = [];
          
          if (isWindows) {
            // Parse Windows netstat output
            const lines = stdout.split('\n');
            lines.forEach(line => {
              const parts = line.trim().split(/\s+/);
              if (parts.length > 4) {
                const pid = parts[parts.length - 1];
                if (/^\d+$/.test(pid) && !pids.includes(pid)) {
                  pids.push(pid);
                }
              }
            });
          } else {
            // Parse Unix/Mac lsof output
            pids = stdout.split('\n').filter(Boolean);
          }
          
          if (pids.length > 0) {
            logger.warning(`Found ${pids.length} process(es) using port ${port}.`);
            
            // Kill each process
            const killPromises = pids.map(pid => {
              return new Promise((killResolve) => {
                const killCommand = isWindows ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
                
                logger.warning(`Terminating process with PID: ${pid}...`);
                exec(killCommand, (killError) => {
                  if (killError) {
                    logger.error(`Failed to terminate process: ${killError.message}`);
                  } else {
                    logger.success(`Process terminated successfully.`);
                  }
                  killResolve();
                });
              });
            });
            
            Promise.all(killPromises).then(() => {
              // Give the system a moment to release the port
              logger.info('Waiting for port to be released...');
              setTimeout(resolve, 1000);
            });
          } else {
            logger.success(`No processes found using port ${port}.`);
            resolve();
          }
        } catch (parseError) {
          logger.error(`Error parsing process list: ${parseError.message}`);
          reject(parseError);
        }
      } else {
        logger.success(`No processes found using port ${port}.`);
        resolve();
      }
    });
  });
}

module.exports = {
  findAndKillProcessOnPort
}; 