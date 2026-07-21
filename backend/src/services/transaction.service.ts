import { TransactionRepository, TransactionFilters } from '../repositories/transaction.repo';
import { CategoryRepository } from '../repositories/category.repo';
import { BudgetRepository } from '../repositories/budget.repo';
import { AppError } from '../middlewares/errorHandler';
import { Transaction } from '../types';
import { query } from '../config/db';

export class TransactionService {
  static async getTransactions(userId: number, filters: TransactionFilters) {
    const data = await TransactionRepository.findAll(userId, filters);
    const total = await TransactionRepository.countAll(userId, filters);
    
    const page = filters.page ? parseInt(filters.page as any, 10) : 1;
    const limit = filters.limit ? parseInt(filters.limit as any, 10) : 10;
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

  static async createTransaction(userId: number, data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    // Verify category exists and belongs to the user
    const category = await CategoryRepository.findById(data.category_id);
    if (!category || category.user_id !== userId) {
      throw new AppError('Category not found or access denied', 404);
    }

    // Create the transaction
    const tx = await TransactionRepository.create({
      ...data,
      user_id: userId,
    });

    // Check if the user has set a budget for this transaction's month and year
    const txDate = new Date(data.transaction_date);
    const month = txDate.getMonth() + 1;
    const year = txDate.getFullYear();

    const budget = await BudgetRepository.findByMonthAndYear(userId, month, year);
    if (budget) {
      // Calculate total expenses for that month
      const expenseRes = await query(
        `SELECT COALESCE(SUM(amount), 0) as total_expenses 
         FROM transactions 
         WHERE user_id = $1 AND type = 'expense' AND EXTRACT(MONTH FROM transaction_date) = $2 AND EXTRACT(YEAR FROM transaction_date) = $3`,
        [userId, month, year]
      );
      const totalExpenses = parseFloat(expenseRes.rows[0].total_expenses);
      const budgetAmount = parseFloat(budget.amount as string);

      if (totalExpenses > budgetAmount) {
        // We will return a metadata warning with the response (or allow client to see stats update)
        (tx as any).budgetWarning = {
          message: `Monthly budget of ${budgetAmount} exceeded! Current monthly expenses are ${totalExpenses}.`,
          budgetAmount,
          totalExpenses,
        };
      }
    }

    return tx;
  }

  static async updateTransaction(
    id: number,
    userId: number,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<Transaction> {
    const existing = await TransactionRepository.findById(id, userId);
    if (!existing) {
      throw new AppError('Transaction not found', 404);
    }

    if (updates.category_id) {
      const category = await CategoryRepository.findById(updates.category_id);
      if (!category || category.user_id !== userId) {
        throw new AppError('Category not found or access denied', 404);
      }
    }

    const updated = await TransactionRepository.update(id, userId, updates);
    if (!updated) {
      throw new AppError('Failed to update transaction', 500);
    }

    return updated;
  }

  static async deleteTransaction(id: number, userId: number): Promise<void> {
    const existing = await TransactionRepository.findById(id, userId);
    if (!existing) {
      throw new AppError('Transaction not found', 404);
    }

    const success = await TransactionRepository.delete(id, userId);
    if (!success) {
      throw new AppError('Failed to delete transaction', 500);
    }
  }

  static async getDashboardData(userId: number) {
    const summary = await TransactionRepository.getSummaryStats(userId);
    
    // Get recent 5 transactions
    const recent = await TransactionRepository.findAll(userId, { page: 1, limit: 5, sort: 'date_desc' });
    
    // Get category breakdown
    const categories = await TransactionRepository.getCategoryDistribution(userId);
    
    // Get last 6 months trend
    const trend = await TransactionRepository.getMonthlyTrend(userId, 6);

    // Get current month budget and status
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budget = await BudgetRepository.findByMonthAndYear(userId, currentMonth, currentYear);
    
    let budgetInfo = null;
    if (budget) {
      const expenseRes = await query(
        `SELECT COALESCE(SUM(amount), 0) as total_expenses 
         FROM transactions 
         WHERE user_id = $1 AND type = 'expense' AND EXTRACT(MONTH FROM transaction_date) = $2 AND EXTRACT(YEAR FROM transaction_date) = $3`,
        [userId, currentMonth, currentYear]
      );
      const totalExpenses = parseFloat(expenseRes.rows[0].total_expenses);
      const budgetAmount = parseFloat(budget.amount as string);
      
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
