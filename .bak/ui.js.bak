import { StatusTypes } from './types.js';

export function updateStatus(isConnected) {
    const statusElement = document.getElementById('bot-status');
    if (statusElement) {
        const status = isConnected ? StatusTypes.CONNECTED : StatusTypes.DISCONNECTED;
        statusElement.className = `status-${status}`;
        statusElement.textContent = `Bot Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
}

export function updateTokenDisplay(tokens) {
    const container = document.getElementById('tracked-tokens');
    if (container) {
        container.innerHTML = '';
        if (tokens.length === 0) {
            container.innerHTML = `
                <div class="token-item" style="text-align: center;">
                    <span class="name">No tokens tracked</span>
                    <span class="price">Add a token to start tracking</span>
                    <span></span>
                </div>
            `;
            return;
        }

        tokens.forEach(token => {
            const tokenElement = document.createElement('div');
            tokenElement.className = 'token-item';
            tokenElement.innerHTML = `
                <span class="name">${token.name || 'Unknown Token'}</span>
                <span class="price">$${(token.price || 0).toFixed(2)}</span>
                <span class="change ${(token.priceChange || 0) >= 0 ? 'positive' : 'negative'}">
                    ${token.priceChange > 0 ? '+' : ''}${(token.priceChange || 0).toFixed(2)}%
                </span>
            `;
            
            // Add click handler to show more details
            tokenElement.addEventListener('click', () => {
                showTokenDetails(token);
            });
            
            container.appendChild(tokenElement);
        });
    }
}

export function showTokenDetails(token) {
    // Create modal for token details
    const modal = document.createElement('div');
    modal.className = 'token-modal';
    modal.innerHTML = `
        <div class="token-modal-content">
            <h2>${token.name || 'Unknown Token'}</h2>
            <div class="token-details">
                <p><strong>Price:</strong> $${(token.price || 0).toFixed(2)}</p>
                <p><strong>24h Change:</strong> <span class="${(token.priceChange || 0) >= 0 ? 'positive' : 'negative'}">
                    ${token.priceChange > 0 ? '+' : ''}${(token.priceChange || 0).toFixed(2)}%
                </span></p>
                <p><strong>Volume:</strong> $${(token.volume || 0).toLocaleString()}</p>
                <p><strong>Market Cap:</strong> $${(token.marketCap || 0).toLocaleString()}</p>
                <p><strong>Address:</strong> <span class="address">${token.address}</span></p>
            </div>
            <button class="close-modal">Close</button>
        </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Add close handler
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

export function showPriceAlert(alert) {
    const alertsContainer = document.getElementById('price-alerts');
    if (alertsContainer) {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert';
        alertElement.innerHTML = `
            <strong>${alert.token}</strong>
            <p>${alert.message}</p>
            <span class="time">${new Date(alert.timestamp).toLocaleString()}</span>
        `;
        alertsContainer.prepend(alertElement);

        // Remove old alerts if there are too many
        const alerts = alertsContainer.children;
        if (alerts.length > 50) {
            alerts[alerts.length - 1].remove();
        }
    }
}

export function addTransaction(transaction) {
    const transactionsContainer = document.getElementById('recent-transactions');
    if (transactionsContainer) {
        const txElement = document.createElement('div');
        txElement.className = 'transaction';
        txElement.innerHTML = `
            <span class="type">${transaction.type}</span>
            <span class="amount">${transaction.amount}</span>
            <span class="token">${transaction.token}</span>
            <span class="time">${new Date(transaction.timestamp).toLocaleString()}</span>
        `;
        transactionsContainer.prepend(txElement);

        // Remove old transactions if there are too many
        const transactions = transactionsContainer.children;
        if (transactions.length > 50) {
            transactions[transactions.length - 1].remove();
        }
    }
}

// Add styles for the modal
const style = document.createElement('style');
style.textContent = `
    .token-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .token-modal-content {
        background: var(--card-bg);
        padding: 20px;
        border-radius: 10px;
        border: 1px solid var(--primary-color);
        box-shadow: 0 0 20px var(--gold-glow);
        max-width: 500px;
        width: 90%;
    }

    .token-modal h2 {
        color: var(--primary-color);
        margin-bottom: 20px;
        text-align: center;
    }

    .token-details p {
        margin: 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .token-details .address {
        font-family: monospace;
        font-size: 0.9em;
        word-break: break-all;
    }

    .close-modal {
        display: block;
        width: 100%;
        padding: 10px;
        margin-top: 20px;
        background: var(--primary-color);
        color: var(--sidebar-bg);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .close-modal:hover {
        background: var(--secondary-color);
    }
`;

document.head.appendChild(style); 