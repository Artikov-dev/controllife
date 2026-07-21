"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetService = void 0;
const budget_repo_1 = require("../repositories/budget.repo");
const errorHandler_1 = require("../middlewares/errorHandler");
class BudgetService {
    static async getBudgets(userId) {
        return budget_repo_1.BudgetRepository.findByUserId(userId);
    }
    static async getBudgetByPeriod(userId, month, year) {
        return budget_repo_1.BudgetRepository.findByMonthAndYear(userId, month, year);
    }
    static async upsertBudget(userId, data) {
        return budget_repo_1.BudgetRepository.upsert(userId, data.month, data.year, data.amount);
    }
    static async deleteBudget(id, userId) {
        const success = await budget_repo_1.BudgetRepository.delete(id, userId);
        if (!success) {
            throw new errorHandler_1.AppError('Budget not found or unauthorized', 404);
        }
    }
}
exports.BudgetService = BudgetService;
