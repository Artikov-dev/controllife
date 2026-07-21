"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetController = void 0;
const budget_service_1 = require("../services/budget.service");
class BudgetController {
    static async getBudgets(req, res, next) {
        try {
            const userId = req.user.userId;
            const budgets = await budget_service_1.BudgetService.getBudgets(userId);
            res.status(200).json({
                status: 'success',
                data: budgets,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async upsertBudget(req, res, next) {
        try {
            const userId = req.user.userId;
            const budget = await budget_service_1.BudgetService.upsertBudget(userId, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Budget saved successfully',
                data: budget,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteBudget(req, res, next) {
        try {
            const userId = req.user.userId;
            const budgetId = parseInt(req.params.id, 10);
            await budget_service_1.BudgetService.deleteBudget(budgetId, userId);
            res.status(200).json({
                status: 'success',
                message: 'Budget deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BudgetController = BudgetController;
