// Simple terminal UI without dependencies
class TerminalUI {
    constructor() {
        this.spinner = null;
        this.isWindows = process.platform === 'win32';
    }

    // ANSI color codes
    colors = {
        reset: '\x1b[0m',
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        gray: '\x1b[90m',
        white: '\x1b[37m'
    };

    // Status messages
    success(message) {
        console.log(`${this.colors.green}✓${this.colors.reset} ${message}`);
    }

    error(message) {
        console.log(`${this.colors.red}✗${this.colors.reset} ${message}`);
    }

    warning(message) {
        console.log(`${this.colors.yellow}⚠${this.colors.reset} ${message}`);
    }

    info(message) {
        console.log(`${this.colors.blue}ℹ${this.colors.reset} ${message}`);
    }

    // Simple box
    box(message, title = '') {
        const width = 60;
        const line = '─'.repeat(width);
        console.log('\n' + line);
        if (title) {
            const padding = Math.floor((width - title.length) / 2);
            console.log(' '.repeat(padding) + `${this.colors.cyan}${title}${this.colors.reset}`);
            console.log(line);
        }
        console.log('\n' + message + '\n');
        console.log(line + '\n');
    }

    // Launch banner
    displayLaunchBanner() {
        const banner = `
${this.colors.cyan}╔════════════════════════════════════════════════════════════════╗
║                     FOMOBot Token Tracker Server                     ║
║                                                                      ║
║  Version: 1.0.0                                                      ║
║  Port: 3001                                                          ║
║  Environment: ${process.env.NODE_ENV || 'development'}                ║
║  Platform: ${process.platform}                                        ║
║                                                                      ║
╚════════════════════════════════════════════════════════════════════╝${this.colors.reset}
`;
        console.log(banner);
    }

    // Server status
    displayServerStatus(port) {
        const status = `
${this.colors.green}Server Status:
✓ HTTP Server running on port ${port}
✓ WebSocket endpoint: ws://localhost:${port}/ws
✓ Static file serving enabled
✓ API endpoints ready${this.colors.reset}
`;
        this.box(status, 'Server Status');
    }

    // Ready message
    displayReadyMessage() {
        const message = `
${this.colors.green}Server is ready to:
✓ Track tokens
✓ Handle WebSocket connections
✓ Process API requests
✓ Serve static files${this.colors.reset}
`;
        this.box(message, 'Ready');
    }

    // Error display
    displayError(error) {
        const errorMessage = `
${this.colors.red}Error Details:
${error.message}
${error.stack ? `\nStack Trace:\n${error.stack}` : ''}${this.colors.reset}
`;
        this.box(errorMessage, 'Error');
    }

    // Token information display
    displayTokenInfo(token) {
        // Extract token data from the potentially nested structure
        const metadata = token.metadata || {};
        const price = token.lastPrice || token.price || {};
        
        // Format the data with fallbacks for missing values
        const info = `
${this.colors.cyan}Token Information:
Symbol: ${metadata.symbol || 'Unknown'}
Name: ${metadata.name || 'Unknown'}
Mint Address: ${token.mintAddress || metadata.mint || 'Unknown'}
Price: $${typeof price.price === 'number' ? price.price.toFixed(6) : 'Unknown'}
24h Change: ${price.priceChange24h ? price.priceChange24h.toFixed(2) + '%' : '0%'}
Market Cap: $${price.marketCap ? price.marketCap.toLocaleString() : 'Unknown'}
Volume 24h: $${price.volume24h ? price.volume24h.toLocaleString() : 'Unknown'}${this.colors.reset}
`;

        // Add fallback indicator if using fallback data
        const title = token.isFallback ? 'Token Info (Fallback Data)' : 'Token Info';
        this.box(info, title);
    }

    // Price alert display
    displayPriceAlert(alert) {
        const alertMessage = `
${this.colors.yellow}Price Alert:
Token: ${alert.symbol}
Current Price: $${alert.currentPrice}
Target Price: $${alert.targetPrice}
Change: ${alert.change}%${this.colors.reset}
`;
        this.box(alertMessage, 'Price Alert');
    }

    // Transaction display
    displayTransaction(tx) {
        const txInfo = `
${this.colors.blue}Transaction:
Type: ${tx.type}
Amount: ${tx.amount}
Price: $${tx.price}
Time: ${new Date(tx.timestamp).toLocaleString()}${this.colors.reset}
`;
        this.box(txInfo, 'Transaction');
    }

    // Token table display
    displayTokenTable(tokens) {
        if (!tokens || tokens.length === 0) {
            this.box(`${this.colors.yellow}No tokens being tracked${this.colors.reset}`, 'Token Tracker Status');
            return;
        }
        
        // Create header row
        const header = `${this.colors.cyan}Symbol    | Price         | Change 24h | Volume 24h        | Fallback${this.colors.reset}`;
        
        // Create table rows
        const table = tokens.map(token => {
            const symbol = (token.symbol || 'UNKNOWN').padEnd(8);
            const price = ('$' + (token.price || 'N/A')).padStart(12);
            const change = ((token.change24h || '0') + '%').padStart(7);
            const volume = ('$' + (token.volume24h || 'N/A')).padStart(15);
            const fallback = token.isFallback ? '    ✓' : '    -';
            
            return `${this.colors.white}${symbol} | ${price} | ${change} | ${volume} ${fallback}${this.colors.reset}`;
        }).join('\n');
        
        // Display the table
        this.box(`${header}\n${table}`, 'Token Tracker Status');
    }

    // Spinner methods
    startSpinner(message) {
        if (this.spinner) return;
        this.spinner = setInterval(() => {
            process.stdout.write(`\r${this.colors.blue}⠋${this.colors.reset} ${message}`);
        }, 100);
    }

    stopSpinner(success = true, message = '') {
        if (this.spinner) {
            clearInterval(this.spinner);
            this.spinner = null;
            process.stdout.write('\r');
            if (message) {
                if (success) {
                    this.success(message);
                } else {
                    this.error(message);
                }
            }
        }
    }
}

// Create and export singleton instance
export const terminalUI = new TerminalUI(); 