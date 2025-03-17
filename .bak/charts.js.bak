// Chart.js Utility Module

// Default chart options
const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#ffffff'
            }
        },
        title: {
            display: true,
            color: '#ffffff'
        }
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
                color: '#ffffff'
            }
        },
        y: {
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
                color: '#ffffff'
            }
        }
    }
};

// Chart configurations
export const chartConfigs = {
    price: {
        type: 'line',
        options: {
            ...defaultOptions,
            plugins: {
                ...defaultOptions.plugins,
                title: {
                    ...defaultOptions.plugins.title,
                    text: 'Price History'
                }
            },
            scales: {
                ...defaultOptions.scales,
                y: {
                    ...defaultOptions.scales.y,
                    beginAtZero: false
                }
            }
        }
    },
    volume: {
        type: 'bar',
        options: {
            ...defaultOptions,
            plugins: {
                ...defaultOptions.plugins,
                title: {
                    ...defaultOptions.plugins.title,
                    text: 'Volume History'
                }
            },
            scales: {
                ...defaultOptions.scales,
                y: {
                    ...defaultOptions.scales.y,
                    beginAtZero: true
                }
            }
        }
    },
    transactions: {
        type: 'line',
        options: {
            ...defaultOptions,
            plugins: {
                ...defaultOptions.plugins,
                title: {
                    ...defaultOptions.plugins.title,
                    text: 'Transaction History'
                }
            },
            scales: {
                ...defaultOptions.scales,
                y: {
                    ...defaultOptions.scales.y,
                    beginAtZero: true
                }
            }
        }
    }
};

// Create chart data structure
export function createChartData(labels, data, label, color) {
    return {
        labels,
        datasets: [{
            label,
            data,
            borderColor: color,
            backgroundColor: color.replace(')', ', 0.2)'),
            borderWidth: 2,
            tension: 0.1,
            fill: true
        }]
    };
}

// Format timestamp for chart labels
export function formatChartTime(timestamp, timeframe) {
    const date = new Date(timestamp);
    switch (timeframe) {
        case '24h':
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case '7d':
            return date.toLocaleDateString([], { weekday: 'short' });
        case '30d':
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        default:
            return date.toLocaleString();
    }
}

// Update chart data
export function updateChartData(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// Create a new chart instance
export function createChart(ctx, type, data, options = {}) {
    const config = chartConfigs[type];
    return new Chart(ctx, {
        type: config.type,
        data,
        options: {
            ...config.options,
            ...options
        }
    });
}

// Chart colors
export const chartColors = {
    price: 'rgb(75, 192, 192)',
    volume: 'rgb(153, 102, 255)',
    transactions: 'rgb(255, 99, 132)'
}; 