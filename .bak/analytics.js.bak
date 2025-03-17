/**
 * Analytics Page Module
 * Handles analytics functionality
 */

import { BasePage } from '../common/index.js';
import { apiService } from '../../services/index.js';
import { createChart, updateChart } from '../../utils/index.js';
import { debugTool } from '../../utils/debug/index.js';

export class AnalyticsPage extends BasePage {
    constructor() {
        super('analytics');
        
        this.charts = new Map();
        this.dataCache = null;
        this.timeframe = '24h';
    }
    
    /**
     * Load initial data for the analytics page
     */
    async loadData() {
        try {
            debugTool.logInfo('Loading analytics data');
            
            // Fetch analytics data from API
            const analyticsData = await apiService.getAnalyticsData(this.timeframe);
            
            if (analyticsData) {
                this.dataCache = analyticsData;
                this.render();
            }
        } catch (error) {
            debugTool.logError('Failed to load analytics data:', error);
        }
    }
    
    /**
     * Set up event listeners for the analytics page
     */
    setupEventListeners() {
        // Time frame selectors
        const timeframeButtons = this.container.querySelectorAll('.timeframe-selector button');
        
        timeframeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const timeframe = button.dataset.timeframe;
                this.changeTimeframe(timeframe);
            });
        });
        
        debugTool.logInfo('Analytics event listeners set up');
    }
    
    /**
     * Change the timeframe and reload data
     * @param {string} timeframe - The new timeframe to display
     */
    async changeTimeframe(timeframe) {
        try {
            debugTool.logInfo(`Changing timeframe to ${timeframe}`);
            
            // Update active state on buttons
            const timeframeButtons = this.container.querySelectorAll('.timeframe-selector button');
            timeframeButtons.forEach(button => {
                if (button.dataset.timeframe === timeframe) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            // Update timeframe and reload data
            this.timeframe = timeframe;
            await this.loadData();
            
        } catch (error) {
            debugTool.logError('Failed to change timeframe:', error);
        }
    }
    
    /**
     * Render the analytics page
     */
    render() {
        if (!this.dataCache) {
            debugTool.logWarning('No data to render in analytics');
            return;
        }
        
        // Render different components
        this.renderPriceChart();
        this.renderVolumeChart();
        this.renderStats();
        
        debugTool.logInfo('Analytics page rendered');
    }
    
    /**
     * Render the price chart component
     */
    renderPriceChart() {
        const priceChartContainer = this.container.querySelector('#price-chart');
        
        if (!priceChartContainer) {
            debugTool.logError('Price chart container not found');
            return;
        }
        
        if (!this.charts.has('price')) {
            // Create new chart if doesn't exist
            const chart = createChart(priceChartContainer, 'Price', this.dataCache.priceData);
            this.charts.set('price', chart);
        } else {
            // Update existing chart
            const chart = this.charts.get('price');
            updateChart(chart, this.dataCache.priceData);
        }
    }
    
    /**
     * Render the volume chart component
     */
    renderVolumeChart() {
        const volumeChartContainer = this.container.querySelector('#volume-chart');
        
        if (!volumeChartContainer) {
            debugTool.logError('Volume chart container not found');
            return;
        }
        
        if (!this.charts.has('volume')) {
            // Create new chart if doesn't exist
            const chart = createChart(volumeChartContainer, 'Volume', this.dataCache.volumeData);
            this.charts.set('volume', chart);
        } else {
            // Update existing chart
            const chart = this.charts.get('volume');
            updateChart(chart, this.dataCache.volumeData);
        }
    }
    
    /**
     * Render the analytics stats
     */
    renderStats() {
        // Update stats values
        const statsElements = this.container.querySelectorAll('.analytics-stat span');
        
        if (statsElements.length >= 4) {
            statsElements[0].textContent = this.dataCache.stats.totalVolume;
            statsElements[1].textContent = this.dataCache.stats.averagePrice;
            statsElements[2].textContent = this.dataCache.stats.priceChange;
            statsElements[3].textContent = this.dataCache.stats.transactions;
        }
    }
    
    /**
     * Clean up resources when leaving the page
     */
    cleanup() {
        // Clean up charts
        this.charts.forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts.clear();
        
        // Call base cleanup
        super.cleanup();
        
        debugTool.logInfo('Analytics page cleaned up');
    }
}

/**
 * Load the analytics page
 * @returns {AnalyticsPage} The analytics page instance
 */
export function loadAnalytics() {
    console.log('Loading analytics page');
    try {
        const analyticsPage = new AnalyticsPage();
        analyticsPage.initialize();
        analyticsPage.loadData();
        return analyticsPage;
    } catch (error) {
        console.error('Error loading analytics page:', error);
        throw error;
    }
} 