// Import bot interfaces
const { TokenTrackerBot } = require('./tokenTracker/index.js');

// Bot interface registry
const bots = {
    tokenTracker: new TokenTrackerBot()
};

// Export individual bots
const tokenTrackerBot = bots.tokenTracker;

// Export all bots
module.exports = bots;

// Helper function to get a bot instance
export function getBot(botType) {
    return bots[botType] || null;
}

// Helper function to initialize all bots
export function initializeBots() {
    Object.values(bots).forEach(bot => {
        if (bot && typeof bot.initialize === 'function') {
            bot.initialize();
        }
    });
}

// Helper function to connect all bots
export function connectAllBots() {
    return Promise.all(
        Object.values(bots).map(bot => {
            if (bot && typeof bot.connect === 'function') {
                return bot.connect();
            }
            return Promise.resolve();
        })
    );
} 