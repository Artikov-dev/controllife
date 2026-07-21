import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {
  static async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { page, limit, type, category_id, search, month, year, sort } = req.query;

      const filters = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        type: type ? (type as 'income' | 'expense') : undefined,
        category_id: category_id ? parseInt(category_id as string, 10) : undefined,
        search: search as string || undefined,
        month: month ? parseInt(month as string, 10) : undefined,
        year: year ? parseInt(year as string, 10) : undefined,
        sort: sort as string || undefined,
      };

      const result = await TransactionService.getTransactions(userId, filters);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transaction = await TransactionService.createTransaction(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transactionId = parseInt(req.params.id, 10);
      const transaction = await TransactionService.updateTransaction(transactionId, userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Transaction updated successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transactionId = parseInt(req.params.id, 10);
      await TransactionService.deleteTransaction(transactionId, userId);
      res.status(200).json({
        status: 'success',
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data = await TransactionService.getDashboardData(userId);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
