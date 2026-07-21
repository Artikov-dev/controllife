import { BudgetRepository } from '../repositories/budget.repo';
import { AppError } from '../middlewares/errorHandler';
import { Budget } from '../types';

export class BudgetService {
  static async getBudgets(userId: number): Promise<Budget[]> {
    return BudgetRepository.findByUserId(userId);
  }

  static async getBudgetByPeriod(userId: number, month: number, year: number): Promise<Budget | null> {
    return BudgetRepository.findByMonthAndYear(userId, month, year);
  }

  static async upsertBudget(userId: number, data: { month: number; year: number; amount: number }): Promise<Budget> {
    return BudgetRepository.upsert(userId, data.month, data.year, data.amount);
  }

  static async deleteBudget(id: number, userId: number): Promise<void> {
    const success = await BudgetRepository.delete(id, userId);
    if (!success) {
      throw new AppError('Budget not found or unauthorized', 404);
    }
  }
}
