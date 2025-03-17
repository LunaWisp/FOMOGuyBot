// Simple terminal UI without dependencies
class TerminalUI {
    constructor() {
        this.spinner = null;
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

    // Token information display
    displayTokenInfo(token) {
        const price = token.lastPrice ? `$${token.lastPrice.price.toFixed(6)}` : 'N/A';
        const symbol = token.metadata?.symbol || 'UNKNOWN';
        const name = token.metadata?.name || token.mintAddress.substring(0, 8) + '...';

        this.box(
            `Token: ${name}\n` +
            `Symbol: ${symbol}\n` +
            `Price: ${price}\n` +
            `Address: ${token.mintAddress}`,
            'Token Information'
        );
    }

    // Price alert display
    displayPriceAlert(alert) {
        const arrow = alert.type === 'increase' ? '↑' : '↓';
        const color = alert.type === 'increase' ? this.colors.green : this.colors.red;
        
        this.box(
            `${color}${arrow}${this.colors.reset} Price Alert\n` +
            `Token: ${alert.mintAddress}\n` +
            `Change: ${color}${alert.change}%${this.colors.reset}\n` +
            `Old Price: $${alert.oldPrice.toFixed(6)}\n` +
            `New Price: $${alert.newPrice.toFixed(6)}`,
            'Price Alert'
        );
    }

    // Transaction display
    displayTransaction(tx) {
        this.box(
            `Transaction Type: ${tx.type}\n` +
            `Amount: ${tx.amount}\n` +
            `From: ${tx.from}\n` +
            `To: ${tx.to}`,
            'New Transaction'
        );
    }

    // Error display
    displayError(error) {
        this.box(
            `${this.colors.red}Error: ${error.message}${this.colors.reset}\n` +
            `${this.colors.gray}${error.stack || ''}${this.colors.reset}`,
            'Error Details'
        );
    }

    // Table display for multiple tokens
    displayTokenTable(tokens) {
        const header = [
            'Name',
            'Symbol',
            'Price',
            'Change'
        ].join(' | ');

        const separator = '-'.repeat(header.length);

        console.log(`${this.colors.cyan}${header}${this.colors.reset}`);
        console.log(separator);

        tokens.forEach(token => {
            const price = token.lastPrice ? `$${token.lastPrice.price.toFixed(6)}` : 'N/A';
            const symbol = token.metadata?.symbol || 'UNKNOWN';
            const name = token.metadata?.name || token.mintAddress.substring(0, 8) + '...';
            const change = token.lastPrice?.change ? 
                `${token.lastPrice.change > 0 ? '+' : ''}${token.lastPrice.change.toFixed(2)}%` : 
                'N/A';
            const changeColor = token.lastPrice?.change > 0 ? this.colors.green : 
                token.lastPrice?.change < 0 ? this.colors.red : this.colors.white;

            console.log([
                name.padEnd(20),
                symbol.padEnd(10),
                price.padEnd(15),
                `${changeColor}${change}${this.colors.reset}`
            ].join(' | '));
        });
    }

    // Simple loading spinner simulation (no animation)
    startSpinner(message) {
        console.log(`${this.colors.cyan}Loading:${this.colors.reset} ${message}...`);
        this.spinner = { message };
    }

    stopSpinner(success = true, message = '') {
        if (this.spinner) {
            const result = message || this.spinner.message;
            if (success) {
                this.success(result);
            } else {
                this.error(result);
            }
            this.spinner = null;
        }
    }
}

module.exports = new TerminalUI(); 