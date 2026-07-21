"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transaction_repo_1 = require("../repositories/transaction.repo");
const category_repo_1 = require("../repositories/category.repo");
const budget_repo_1 = require("../repositories/budget.repo");
const errorHandler_1 = require("../middlewares/errorHandler");
const db_1 = require("../config/db");
class TransactionService {
    static async getTransactions(userId, filters) {
        const data = await transaction_repo_1.TransactionRepository.findAll(userId, filters);
        const total = await transaction_repo_1.TransactionRepository.countAll(userId, filters);
        const page = filters.page ? parseInt(filters.page, 10) : 1;
        const limit = filters.limit ? parseInt(filters.limit, 10) : 10;
        const totalPages = Math.ceil(total / limit);
        return {
            transactions: data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
    static async createTransaction(userId, data) {
        // Verify category exists and belongs to the user
        const category = await category_repo_1.CategoryRepository.findById(data.category_id);
        if (!category || category.user_id !== userId) {
            throw new errorHandler_1.AppError('Category not found or access denied', 404);
        }
        // Create the transaction
        const tx = await transaction_repo_1.TransactionRepository.create({
            ...data,
            user_id: userId,
        });
        // Check if the user has set a budget for this transaction's month and year
        const txDate = new Date(data.transaction_date);
        const month = txDate.getMonth() + 1;
        const year = txDate.getFullYear();
        const budget = await budget_repo_1.BudgetRepository.findByMonthAndYear(userId, month, year);
        if (budget) {
            // Calculate total expenses for that month
            const expenseRes = await (0, db_1.query)(`SELECT COALESCE(SUM(amount), 0) as total_expenses 
         FROM transactions 
         WHERE user_id = $1 AND type = 'expense' AND EXTRACT(MONTH FROM transaction_date) = $2 AND EXTRACT(YEAR FROM transaction_date) = $3`, [userId, month, year]);
            const totalExpenses = parseFloat(expenseRes.rows[0].total_expenses);
            const budgetAmount = parseFloat(budget.amount);
            if (totalExpenses > budgetAmount) {
                // We will return a metadata warning with the response (or allow client to see stats update)
                tx.budgetWarning = {
                    message: `Monthly budget of ${budgetAmount} exceeded! Current monthly expenses are ${totalExpenses}.`,
                    budgetAmount,
                    totalExpenses,
                };
            }
        }
        return tx;
    }
    static async updateTransaction(id, userId, updates) {
        const existing = await transaction_repo_1.TransactionRepository.findById(id, userId);
        if (!existing) {
            throw new errorHandler_1.AppError('Transaction not found', 404);
        }
        if (updates.category_id) {
            const category = await category_repo_1.CategoryRepository.findById(updates.category_id);
            if (!category || category.user_id !== userId) {
                throw new errorHandler_1.AppError('Category not found or access denied', 404);
            }
        }
        const updated = await transaction_repo_1.TransactionRepository.update(id, userId, updates);
        if (!updated) {
            throw new errorHandler_1.AppError('Failed to update transaction', 500);
        }
        return updated;
    }
    static async deleteTransaction(id, userId) {
        const existing = await transaction_repo_1.TransactionRepository.findById(id, userId);
        if (!existing) {
            throw new errorHandler_1.AppError('Transaction not found', 404);
        }
        const success = await transaction_repo_1.TransactionRepository.delete(id, userId);
        if (!success) {
            throw new errorHandler_1.AppError('Failed to delete transaction', 500);
        }
    }
    static async getDashboardData(userId) {
        const summary = await transaction_repo_1.TransactionRepository.getSummaryStats(userId);
        // Get recent 5 transactions
        const recent = await transaction_repo_1.TransactionRepository.findAll(userId, { page: 1, limit: 5, sort: 'date_desc' });
        // Get category breakdown
        const categories = await transaction_repo_1.TransactionRepository.getCategoryDistribution(userId);
        // Get last 6 months trend
        const trend = await transaction_repo_1.TransactionRepository.getMonthlyTrend(userId, 6);
        // Get current month budget and status
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const budget = await budget_repo_1.BudgetRepository.findByMonthAndYear(userId, currentMonth, currentYear);
        let budgetInfo = null;
        if (budget) {
            const expenseRes = await (0, db_1.query)(`SELECT COALESCE(SUM(amount), 0) as total_expenses 
         FROM transactions 
         WHERE user_id = $1 AND type = 'expense' AND EXTRACT(MONTH FROM transaction_date) = $2 AND EXTRACT(YEAR FROM transaction_date) = $3`, [userId, currentMonth, currentYear]);
            const totalExpenses = parseFloat(expenseRes.rows[0].total_expenses);
            const budgetAmount = parseFloat(budget.amount);
            budgetInfo = {
                id: budget.id,
                month: currentMonth,
                year: currentYear,
                budgetAmount,
                totalExpenses,
                isExceeded: totalExpenses > budgetAmount,
                percentageUsed: budgetAmount > 0 ? Math.round((totalExpenses / budgetAmount) * 100) : 0,
            };
        }
        return {
            summary,
            recent,
            categories,
            trend,
            budgetInfo,
        };
    }
}
exports.TransactionService = TransactionService;
