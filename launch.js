/**
 * FOMOBot Server Manager
 * This script kills any existing http-server processes on port 8080 and starts a new one
 */

const { exec } = require('child_process');
const terminalUI = require('./src/utils/terminal.ui');
const logger = require('./src/utils/logger');

// Function to check if a port is in use
function checkPort(port) {
    return new Promise((resolve) => {
        const command = process.platform === 'win32' 
            ? `netstat -ano | findstr :${port}`
            : `lsof -i :${port}`;

        exec(command, (error, stdout) => {
            if (error) {
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
}

// Function to kill process on port
async function killProcessOnPort(port) {
    try {
        const command = process.platform === 'win32'
            ? `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /F /PID %a`
            : `lsof -ti :${port} | xargs kill -9`;

        await new Promise((resolve, reject) => {
            exec(command, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
        logger.info(`Killed processes on port ${port}`);
    } catch (error) {
        logger.error(`Error killing process on port ${port}: ${error.message}`);
    }
}

// Main launch function
async function launch() {
    try {
        const port = 8080;
        terminalUI.box('FOMOBot Server - Starting', 'Server Launch');

        // Check if port is in use
        const isPortInUse = await checkPort(port);
        if (isPortInUse) {
            terminalUI.warning(`Port ${port} is in use. Attempting to free it...`);
            await killProcessOnPort(port);
        }

        // Start the server
        require('./src/server');
        
        logger.info('HTTP server started successfully');
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
}

// Run the launch function
launch(); 