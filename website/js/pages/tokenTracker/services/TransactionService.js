/**
 * Transaction Service
 * Handles transaction-related operations
 */
const { apiService } = require('../../../services/api.js');

export class TransactionService {
    constructor() {
        this.transactions = [];
    }
    
    /**
     * Loads transactions from the API
     * @param {number} limit - Optional limit for number of transactions to load
     * @returns {Promise<Array>} A promise that resolves to the loaded transactions
     */
    async loadTransactions(limit = 50) {
        try {
            const transactions = await apiService.getTransactions(limit);
            this.transactions = transactions;
            return transactions;
        } catch (error) {
            console.error('Failed to load transactions:', error);
            return [];
        }
    }
    
    /**
     * Adds a new transaction
     * @param {Object} transaction - The transaction object to add
     * @returns {Object} The newly added transaction
     */
    addTransaction(transaction) {
        try {
            const newTransaction = {
                id: Date.now(),
                timestamp: Date.now(),
                ...transaction
            };
            
            this.transactions.unshift(newTransaction);
            
            // Keep only the last 50 transactions
            if (this.transactions.length > 50) {
                this.transactions = this.transactions.slice(0, 50);
            }
            
            // Store transaction via API
            apiService.addTransaction(newTransaction);
            
            return newTransaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            return null;
        }
    }
    
    /**
     * Gets all transactions or a filtered subset
     * @param {number} limit - Optional limit for number of transactions to return
     * @returns {Array} The transactions array
     */
    getTransactions(limit) {
        if (limit && limit > 0) {
            return this.transactions.slice(0, limit);
        }
        return this.transactions;
    }
} 