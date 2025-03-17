const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');
const tokenTracker = require('./bots/tokenTracker.bot');
const { setupLogEndpoints } = require('./api/logger.api');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// Middleware for parsing JSON
app.use(express.json());

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
    console.log('New client connected');

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
            console.error('Error handling message:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

// Forward bot events to all connected clients
function broadcastToClients(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start tracking initial tokens
    const INITIAL_TOKENS = [
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        'So11111111111111111111111111111111111111112'    // Wrapped SOL
    ];

    INITIAL_TOKENS.forEach(async (mintAddress) => {
        try {
            await tokenTracker.trackToken(mintAddress);
        } catch (error) {
            console.error(`Error tracking initial token ${mintAddress}:`, error);
        }
    });
}); 