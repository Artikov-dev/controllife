import { Request, Response, NextFunction } from 'express';
import { BudgetService } from '../services/budget.service';

export class BudgetController {
  static async getBudgets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budgets = await BudgetService.getBudgets(userId);
      res.status(200).json({
        status: 'success',
        data: budgets,
      });
    } catch (error) {
      next(error);
    }
  }

  static async upsertBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budget = await BudgetService.upsertBudget(userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Budget saved successfully',
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budgetId = parseInt(req.params.id, 10);
      await BudgetService.deleteBudget(budgetId, userId);
      res.status(200).json({
        status: 'success',
        message: 'Budget deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
