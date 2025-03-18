class TokenAnalytics {
    constructor(address, data) {
        this.address = address;
        this.data = data;
        this.chart = null;
    }

    create() {
        const modal = document.createElement('div');
        modal.className = 'analytics-modal';
        
        const { dexData, heliusData, transactions = [] } = this.data;
        
        modal.innerHTML = `
            <div class="analytics-content">
                <div class="analytics-header">
                    <div class="token-info">
                        <img src="${dexData?.image || 'default-token.png'}" alt="${dexData?.symbol}" class="token-icon">
                        <h2>${dexData?.name || 'Unknown Token'} Analytics</h2>
                    </div>
                    <button class="close-analytics">&times;</button>
                </div>

                <div class="analytics-grid">
                    <div class="analytics-card price-chart">
                        <h3>Price History</h3>
                        <canvas id="priceChart"></canvas>
                    </div>

                    <div class="analytics-card volume-chart">
                        <h3>Volume Analysis</h3>
                        <canvas id="volumeChart"></canvas>
                    </div>

                    <div class="analytics-card transaction-stats">
                        <h3>Transaction Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="label">Total Transactions</span>
                                <span class="value">${transactions.length}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">Buy/Sell Ratio</span>
                                <span class="value">${this.calculateBuySellRatio(transactions)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">Avg. Transaction Size</span>
                                <span class="value">$${this.calculateAvgTxSize(transactions)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">Unique Wallets</span>
                                <span class="value">${this.calculateUniqueWallets(transactions)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="analytics-card holder-distribution">
                        <h3>Holder Distribution</h3>
                        <canvas id="holderChart"></canvas>
                    </div>
                </div>

                <div class="analytics-footer">
                    <div class="time-range-selector">
                        <button class="time-btn active" data-range="24h">24h</button>
                        <button class="time-btn" data-range="7d">7d</button>
                        <button class="time-btn" data-range="30d">30d</button>
                    </div>
                    <button class="export-data">Export Data</button>
                </div>
            </div>
        `;

        this.initializeCharts();
        this.initializeEventListeners(modal);

        return modal;
    }

    initializeCharts() {
        // Price Chart
        const priceCtx = document.getElementById('priceChart').getContext('2d');
        this.priceChart = new Chart(priceCtx, {
            type: 'line',
            data: this.preparePriceData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        // Volume Chart
        const volumeCtx = document.getElementById('volumeChart').getContext('2d');
        this.volumeChart = new Chart(volumeCtx, {
            type: 'bar',
            data: this.prepareVolumeData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Holder Distribution Chart
        const holderCtx = document.getElementById('holderChart').getContext('2d');
        this.holderChart = new Chart(holderCtx, {
            type: 'doughnut',
            data: this.prepareHolderData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    preparePriceData() {
        // Prepare price data for chart
        const prices = this.data.priceHistory || [];
        return {
            labels: prices.map(p => new Date(p.timestamp).toLocaleTimeString()),
            datasets: [{
                data: prices.map(p => p.price),
                borderColor: '#6464ff',
                tension: 0.4
            }]
        };
    }

    prepareVolumeData() {
        // Prepare volume data for chart
        const volumes = this.data.volumeHistory || [];
        return {
            labels: volumes.map(v => new Date(v.timestamp).toLocaleTimeString()),
            datasets: [{
                data: volumes.map(v => v.volume),
                backgroundColor: '#6464ff'
            }]
        };
    }

    prepareHolderData() {
        // Prepare holder distribution data
        const holders = this.data.heliusData?.holderDistribution || [];
        return {
            labels: ['Top 10', '11-100', '101-1000', '1000+'],
            datasets: [{
                data: holders,
                backgroundColor: ['#6464ff', '#4a4a4a', '#2a2a2a', '#1a1a1a']
            }]
        };
    }

    calculateBuySellRatio(transactions) {
        const buys = transactions.filter(tx => tx.type === 'buy').length;
        const sells = transactions.filter(tx => tx.type === 'sell').length;
        return sells ? (buys / sells).toFixed(2) : '0';
    }

    calculateAvgTxSize(transactions) {
        if (!transactions.length) return '0';
        const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        return (total / transactions.length).toLocaleString();
    }

    calculateUniqueWallets(transactions) {
        const wallets = new Set(transactions.map(tx => tx.wallet));
        return wallets.size;
    }

    initializeEventListeners(modal) {
        // Close button
        modal.querySelector('.close-analytics').addEventListener('click', () => {
            modal.remove();
        });

        // Time range buttons
        modal.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCharts(e.target.dataset.range);
            });
        });

        // Export data button
        modal.querySelector('.export-data').addEventListener('click', () => {
            this.exportData();
        });
    }

    updateCharts(timeRange) {
        // Update charts based on selected time range
        // Implementation depends on available historical data
    }

    exportData() {
        const data = {
            token: this.data.dexData,
            analytics: {
                transactions: this.data.transactions,
                priceHistory: this.data.priceHistory,
                volumeHistory: this.data.volumeHistory,
                holderDistribution: this.data.heliusData?.holderDistribution
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.data.dexData.symbol}_analytics.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

export { TokenAnalytics }; 