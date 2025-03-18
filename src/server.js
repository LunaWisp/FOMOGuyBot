import { WebSocket } from 'ws';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { tokenTracker } from './bots/tokenTracker.bot.js';
import { setupLogEndpoints } from './api/logger.api.js';
import { agentRules } from '../agentRules.js';
import { terminalUI } from './utils/terminal.ui.js';
import { logger } from './utils/logger.js';
import { config } from './utils/config.js';
import { heliusAPI } from './api/helius.api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server {
    constructor() {
        this.app = express();
        this.server = null;
        this.wss = null;
        this.isRunning = false;
        this.port = config.getNumber('PORT');
    }

    async start() {
        if (this.isRunning) {
            console.log('Server is already running');
            return;
        }

        try {
            // Setup middleware and routes
            this.setupMiddleware();
            this.setupRoutes();

            // Start the server
            this.server = http.createServer(this.app);
            this.wss = new WebSocket.Server({ 
                server: this.server,
                path: config.getString('WS_ENDPOINT')
            });

            // Handle WebSocket connections
            this.wss.on('connection', (ws) => {
                console.log('New WebSocket connection');
                ws.on('message', (message) => {
                    console.log('Received:', message);
                });
            });

            // Start listening on configured port
            await new Promise((resolve, reject) => {
                this.server.listen(this.port, () => {
                    this.isRunning = true;
                    console.log(`Server is running on port ${this.port}`);
                    resolve();
                }).on('error', (error) => {
                    reject(error);
                });
            });

        } catch (error) {
            console.error('Failed to start server:', error);
            throw error;
        }
    }

    async stop() {
        if (!this.isRunning) {
            return;
        }

        try {
            // Close all WebSocket connections
            if (this.wss) {
                this.wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.close();
                    }
                });
                this.wss.close();
            }

            // Stop the HTTP server
            if (this.server) {
                await new Promise((resolve) => {
                    this.server.close(() => {
                        this.isRunning = false;
                        resolve();
                    });
                });
            }

            logger.info('Server stopped successfully');
        } catch (error) {
            logger.error('Error stopping server:', error);
            throw error;
        }
    }

    setupMiddleware() {
        // Middleware for parsing JSON and CORS
        this.app.use(express.json());
        this.app.use(cors());

        // Serve static files from the website directory with proper MIME types
        this.app.use(express.static(path.join(__dirname, '../website'), {
            setHeaders: (res, filePath) => {
                // Set proper MIME types
                if (filePath.endsWith('.css')) {
                    res.setHeader('Content-Type', 'text/css');
                } else if (filePath.endsWith('.js')) {
                    res.setHeader('Content-Type', 'application/javascript');
                    // Add type="module" for ES modules
                    if (filePath.includes('/js/')) {
                        res.setHeader('X-Content-Type-Options', 'nosniff');
                    }
                } else if (filePath.endsWith('.html')) {
                    res.setHeader('Content-Type', 'text/html');
                } else if (filePath.endsWith('.ico')) {
                    res.setHeader('Content-Type', 'image/x-icon');
                }
                // Add cache control headers
                res.setHeader('Cache-Control', 'public, max-age=3600');
            }
        }));
    }

    setupRoutes() {
        // Setup logging API endpoints
        setupLogEndpoints(this.app);

        // Token API endpoints
        this.app.post('/api/token/add', async (req, res) => {
            try {
                const { address } = req.body;
                if (!address) {
                    return res.status(400).json({ error: 'Token address is required' });
                }

                const tokenData = await tokenTracker.trackToken(address);
                res.json(tokenData);
            } catch (error) {
                logger.error('Error adding token:', error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.delete('/api/token/:mintAddress', (req, res) => {
            try {
                const { mintAddress } = req.params;
                tokenTracker.stopTracking(mintAddress);
                res.json({ success: true });
            } catch (error) {
                terminalUI.displayError(error);
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/token/:mintAddress', async (req, res) => {
            try {
                const { mintAddress } = req.params;
                
                // Validate mint address
                if (!mintAddress || mintAddress.length !== 44) {
                    return res.status(400).json({ error: 'Invalid token address format' });
                }

                // Try to get token data
                let tokenData = await tokenTracker.getTokenData(mintAddress);
                
                // If token is not being tracked, start tracking it automatically
                if (!tokenData) {
                    logger.info(`Token ${mintAddress} not found, automatically tracking it`);
                    try {
                        tokenData = await tokenTracker.trackToken(mintAddress);
                    } catch (trackError) {
                        logger.error(`Failed to auto-track token ${mintAddress}:`, trackError);
                        return res.status(404).json({ 
                            error: 'Token not found and could not be tracked automatically',
                            details: trackError.message
                        });
                    }
                }
                
                // Add timestamp to response
                tokenData.timestamp = new Date().toISOString();
                
                // Add warning if using fallback data
                if (tokenData.isFallback) {
                    tokenData.warning = "Using fallback data due to API authentication issues. Please check your Helius API key.";
                    logger.warn(`Serving fallback data for token ${mintAddress} due to API key issues`);
                }
                
                res.json(tokenData);
            } catch (error) {
                logger.error('Error fetching token data:', error);
                terminalUI.displayError(error);
                res.status(500).json({ 
                    error: error.message || 'Internal server error',
                    timestamp: new Date().toISOString()
                });
            }
        });

        this.app.get('/api/tokens', (req, res) => {
            try {
                const tokens = tokenTracker.getTrackedTokens();
                res.json(tokens);
            } catch (error) {
                terminalUI.displayError(error);
                res.status(500).json({ error: error.message });
            }
        });

        // Admin endpoint to update API key
        this.app.post('/api/admin/update-api-key', (req, res) => {
            try {
                const { apiKey, adminToken } = req.body;
                
                // Simple validation to ensure we have required fields
                if (!apiKey) {
                    return res.status(400).json({ error: 'API key is required' });
                }
                
                // Basic authentication check (should be enhanced with proper JWT validation)
                if (!adminToken || adminToken !== config.getString('ADMIN_TOKEN')) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
                
                // Update API key
                const result = heliusAPI.updateApiKey(apiKey);
                
                logger.info('Helius API key updated successfully');
                res.json({ success: true, message: 'API key updated successfully' });
            } catch (error) {
                logger.error('Error updating API key:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Endpoint to test API key
        this.app.get('/api/admin/test-api-key', async (req, res) => {
            try {
                const { adminToken } = req.query;
                
                // Basic authentication check
                if (!adminToken || adminToken !== config.getString('ADMIN_TOKEN')) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
                
                // Test the current API key
                const result = await heliusAPI.testApiKey();
                
                res.json(result);
            } catch (error) {
                logger.error('Error testing API key:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Serve each page route
        this.app.get(['/', '/dashboard', '/bot', '/analytics', '/settings'], (req, res) => {
            res.sendFile(path.join(__dirname, '../website/index.html'));
        });
    }

    handleWebSocketMessage(ws, data) {
        // Handle different message types
        switch (data.type) {
            case 'SUBSCRIBE':
                // Handle subscription
                break;
            case 'UNSUBSCRIBE':
                // Handle unsubscription
                break;
            default:
                ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
    }

    broadcast(data) {
        if (!this.wss) return;

        const message = JSON.stringify(data);
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

// Create and export server instance
export const server = new Server(); 