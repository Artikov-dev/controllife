import { Request, Response, NextFunction } from 'express';
import { RecurringTransactionService } from '../services/recurring.service';

export class RecurringTransactionController {
  static async getRecurring(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await RecurringTransactionService.getRecurring(userId);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRecurring(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await RecurringTransactionService.createRecurring(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Recurring transaction scheduled successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRecurring(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = parseInt(req.params.id, 10);
      await RecurringTransactionService.deleteRecurring(id, userId);
      res.status(200).json({
        status: 'success',
        message: 'Recurring transaction deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
