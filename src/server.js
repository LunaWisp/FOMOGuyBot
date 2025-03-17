const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const tokenTracker = require('./bots/tokenTracker.bot');
const { setupLogEndpoints } = require('./api/logger.api');
const agentRules = require('../agentRules');
const terminalUI = require('./utils/terminal.ui');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// Middleware for parsing JSON and CORS
app.use(express.json());
app.use(cors());

// Serve static files from the website directory
app.use(express.static(path.join(__dirname, '../website')));

// Setup logging API endpoints
setupLogEndpoints(app);

// Serve each page route
app.get(['/', '/dashboard', '/bot', '/analytics', '/settings'], (req, res) => {
    res.sendFile(path.join(__dirname, '../website/index.html'));
});

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
    clients.add(ws);
    terminalUI.success('New client connected');

    // Send current token list to new client
    const trackedTokens = tokenTracker.getTrackedTokens();
    ws.send(JSON.stringify({
        type: 'initialState',
        tokens: trackedTokens
    }));

    // Handle messages from client
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'addToken':
                    await tokenTracker.trackToken(data.mintAddress);
                    break;
                case 'stopTracking':
                    tokenTracker.stopTracking(data.mintAddress);
                    break;
            }
        } catch (error) {
            terminalUI.displayError(error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        clients.delete(ws);
        terminalUI.warning('Client disconnected');
    });
});

// Broadcast to all connected clients
function broadcastToClients(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Listen for bot events
tokenTracker.on('tokenAdded', (data) => {
    broadcastToClients({
        type: 'tokenAdded',
        ...data
    });
});

tokenTracker.on('priceAlert', (data) => {
    broadcastToClients({
        type: 'priceAlert',
        ...data
    });
});

tokenTracker.on('transaction', (data) => {
    broadcastToClients({
        type: 'transaction',
        ...data
    });
});

tokenTracker.on('tokenRemoved', (mintAddress) => {
    broadcastToClients({
        type: 'tokenRemoved',
        mintAddress
    });
});

// Start the server
const PORT = 8080; // Use port 8080 for consistency
server.listen(PORT, () => {
    terminalUI.box(
        `Server running on port ${PORT}\nWebSocket endpoint: ws://localhost:${PORT}/ws`,
        'Server Status'
    );
    
    // Start listening for token requests
    terminalUI.info('Server ready to track tokens on request');
    terminalUI.info('Use the web interface to add tokens for tracking');
}); 