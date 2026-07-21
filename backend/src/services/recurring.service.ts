import { RecurringTransactionRepository } from '../repositories/recurring.repo';
import { TransactionRepository } from '../repositories/transaction.repo';
import { CategoryRepository } from '../repositories/category.repo';
import { AppError } from '../middlewares/errorHandler';
import { RecurringTransaction } from '../types';

export class RecurringTransactionService {
  static async getRecurring(userId: number) {
    return RecurringTransactionRepository.findByUserId(userId);
  }

  static async createRecurring(
    userId: number,
    data: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>
  ): Promise<RecurringTransaction> {
    // Verify category exists and belongs to the user
    const category = await CategoryRepository.findById(data.category_id);
    if (!category || category.user_id !== userId) {
      throw new AppError('Category not found or access denied', 404);
    }

    if (category.type !== 'expense') {
      throw new AppError('Recurring transactions must be linked to an expense category', 400);
    }

    return RecurringTransactionRepository.create({
      ...data,
      user_id: userId,
    });
  }

  static async deleteRecurring(id: number, userId: number): Promise<void> {
    const existing = await RecurringTransactionRepository.findById(id, userId);
    if (!existing) {
      throw new AppError('Recurring transaction not found', 404);
    }

    const success = await RecurringTransactionRepository.delete(id, userId);
    if (!success) {
      throw new AppError('Failed to delete recurring transaction', 500);
    }
  }

  static async processDueRecurring(userId: number): Promise<void> {
    const dueList = await RecurringTransactionRepository.findDueByUserId(userId);
    if (dueList.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const rt of dueList) {
      let nextRunDate = new Date(rt.next_run);
      nextRunDate.setHours(0, 0, 0, 0);

      // Loop to backfill transactions if the user has missed multiple run cycles
      while (nextRunDate <= today) {
        const txDateStr = nextRunDate.toISOString().split('T')[0];

        // Create actual transaction
        await TransactionRepository.create({
          title: rt.title,
          amount: rt.amount,
          description: `Avtomatik obuna to'lovi (${rt.frequency})`,
          transaction_date: txDateStr,
          type: 'expense',
          category_id: rt.category_id,
          user_id: rt.user_id,
        });

        // Advance the next run date based on frequency
        if (rt.frequency === 'daily') {
          nextRunDate.setDate(nextRunDate.getDate() + 1);
        } else if (rt.frequency === 'weekly') {
          nextRunDate.setDate(nextRunDate.getDate() + 7);
        } else if (rt.frequency === 'monthly') {
          nextRunDate.setMonth(nextRunDate.getMonth() + 1);
        } else if (rt.frequency === 'yearly') {
          nextRunDate.setFullYear(nextRunDate.getFullYear() + 1);
        }
      }

      // Save the updated schedule run date back to the database
      const finalNextRunStr = nextRunDate.toISOString().split('T')[0];
      await RecurringTransactionRepository.updateNextRun(rt.id, finalNextRunStr);
    }
  }
}
