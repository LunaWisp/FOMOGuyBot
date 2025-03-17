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
            }
            
            this.render();
        } catch (error) {
            debugTool.logError('Failed to load analytics data:', error);
        }
    }
    
    /**
     * Set up event listeners for the analytics page
     */
    setupEventListeners() {
        // Time range selector
        const timeRangeButtons = this.container.querySelectorAll('.time-range-button');
        
        timeRangeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const timeframe = button.getAttribute('data-timeframe');
                this.changeTimeframe(timeframe);
            });
        });
        
        debugTool.logInfo('Analytics event listeners set up');
    }
    
    /**
     * Change the timeframe for analytics data
     */
    async changeTimeframe(timeframe) {
        if (timeframe === this.timeframe) return;
        
        debugTool.logInfo(`Changing analytics timeframe to ${timeframe}`);
        
        // Update UI state
        const buttons = this.container.querySelectorAll('.time-range-button');
        buttons.forEach(btn => {
            if (btn.getAttribute('data-timeframe') === timeframe) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update timeframe and reload data
        this.timeframe = timeframe;
        await this.loadData();
    }
    
    /**
     * Render analytics charts and data
     */
    render() {
        if (!this.dataCache) return;
        
        debugTool.logInfo('Rendering analytics page');
        
        // Render price chart
        this.renderPriceChart();
        
        // Render volume chart
        this.renderVolumeChart();
        
        // Render other statistics
        this.renderStats();
    }
    
    /**
     * Render the price chart
     */
    renderPriceChart() {
        const chartContainer = this.container.querySelector('#price-chart');
        
        if (!chartContainer) return;
        
        if (!this.charts.has('price')) {
            // Create new chart
            const chart = createChart(chartContainer, {
                type: 'line',
                title: 'Price History',
                xAxisLabel: 'Time',
                yAxisLabel: 'Price ($)'
            });
            
            this.charts.set('price', chart);
        }
        
        // Update existing chart with new data
        const chart = this.charts.get('price');
        updateChart(chart, this.dataCache.priceData);
    }
    
    /**
     * Render the volume chart
     */
    renderVolumeChart() {
        const chartContainer = this.container.querySelector('#volume-chart');
        
        if (!chartContainer) return;
        
        if (!this.charts.has('volume')) {
            // Create new chart
            const chart = createChart(chartContainer, {
                type: 'bar',
                title: 'Volume',
                xAxisLabel: 'Time',
                yAxisLabel: 'Volume ($)'
            });
            
            this.charts.set('volume', chart);
        }
        
        // Update existing chart with new data
        const chart = this.charts.get('volume');
        updateChart(chart, this.dataCache.volumeData);
    }
    
    /**
     * Render statistics
     */
    renderStats() {
        // Update statistics in UI
        const stats = this.dataCache.stats;
        
        if (stats) {
            // Update each statistic
            Object.entries(stats).forEach(([key, value]) => {
                const element = this.container.querySelector(`#stat-${key}`);
                if (element) {
                    element.textContent = value;
                }
            });
        }
    }
    
    /**
     * Clean up resources when navigating away
     */
    cleanup() {
        super.cleanup();
        
        // Destroy charts
        this.charts.forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts.clear();
        
        debugTool.logInfo('Analytics page cleaned up');
    }
} 