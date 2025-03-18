/**
 * FOMOBot Server Manager
 * This script manages the server process and handles startup/shutdown
 */

import { exec } from 'child_process';
import { terminalUI } from './src/utils/terminal.ui.js';
import { logger } from './src/utils/logger.js';
import { server } from './src/server.js';
import { config } from './src/utils/config.js';

const PORT = config.getNumber('PORT');
let isShuttingDown = false;

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
            // Check if the port is in TIME_WAIT state
            if (stdout.includes('TIME_WAIT')) {
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
            ? `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port} ^| findstr /v "TIME_WAIT"') do taskkill /F /PID %a`
            : `lsof -ti :${port} | grep -v TIME_WAIT | xargs kill -9`;

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
        
        // Wait a moment for the port to be fully released
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        logger.error(`Error killing process on port ${port}: ${error.message}`);
        throw error;
    }
}

// Function to handle graceful shutdown
async function shutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    try {
        terminalUI.warning('Shutting down server...');
        await server.stop();
        logger.info('Server stopped gracefully');
        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
}

// Main launch function
async function launch() {
    try {
        // Display launch banner
        terminalUI.displayLaunchBanner();
        
        // Check if port is in use
        const isPortInUse = await checkPort(PORT);
        
        if (isPortInUse) {
            terminalUI.warning(`Port ${PORT} is in use. Attempting to free it...`);
            await killProcessOnPort(PORT);
            
            // Check again to make sure port is free
            const stillInUse = await checkPort(PORT);
            if (stillInUse) {
                throw new Error(`Failed to free port ${PORT}. Please try a different port or manually close the process.`);
            }
        }
        
        // Start the server
        terminalUI.info('Starting server...');
        await server.start(PORT);
        
        // Display server status
        terminalUI.displayServerStatus(PORT);
        
        // Display ready message
        terminalUI.displayReadyMessage();
        
    } catch (error) {
        terminalUI.displayError(error);
        logger.error('Failed to start server:', error);
        await shutdown();
    }
}

// Handle process termination signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    logger.error('Uncaught Exception:', error);
    terminalUI.displayError(error);
    await shutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    terminalUI.displayError(reason);
    await shutdown();
});

// Launch the server
launch(); 