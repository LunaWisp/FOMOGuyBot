const tokenTracker = require('./bots/tokenTracker.bot');

// Example token mint addresses (replace with actual tokens you want to track)
const TOKENS_TO_TRACK = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'So11111111111111111111111111111111111111112'    // Wrapped SOL
];

// Event handlers
tokenTracker.on('tokenAdded', (data) => {
    console.log(`Started tracking ${data.metadata.name} (${data.mintAddress})`);
    console.log(`Current price: $${data.price.value}`);
});

tokenTracker.on('priceAlert', (alert) => {
    console.log(`🚨 Price Alert for ${alert.mintAddress}:`);
    console.log(`${alert.type === 'increase' ? '📈' : '📉'} ${alert.change.toFixed(2)}% change`);
    console.log(`Old price: $${alert.oldPrice}`);
    console.log(`New price: $${alert.newPrice}`);
});

tokenTracker.on('transaction', (transaction) => {
    console.log('New transaction detected:', transaction);
});

tokenTracker.on('tokenRemoved', (mintAddress) => {
    console.log(`Stopped tracking ${mintAddress}`);
});

// Start tracking tokens
async function startBot() {
    try {
        console.log('🤖 Starting FOMOBot Token Tracker...');
        
        for (const mintAddress of TOKENS_TO_TRACK) {
            await tokenTracker.trackToken(mintAddress, {
                up: 2,   // Alert on 2% price increase
                down: 2  // Alert on 2% price decrease
            });
        }

        console.log('✅ Bot started successfully!');
        console.log('📊 Currently tracking:', tokenTracker.getTrackedTokens().length, 'tokens');
    } catch (error) {
        console.error('❌ Error starting bot:', error);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    TOKENS_TO_TRACK.forEach(mintAddress => {
        tokenTracker.stopTracking(mintAddress);
    });
    process.exit(0);
});

// Start the bot
startBot(); 