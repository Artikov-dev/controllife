"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("../services/transaction.service");
class TransactionController {
    static async getTransactions(req, res, next) {
        try {
            const userId = req.user.userId;
            const { page, limit, type, category_id, search, month, year, sort } = req.query;
            const filters = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 10,
                type: type ? type : undefined,
                category_id: category_id ? parseInt(category_id, 10) : undefined,
                search: search || undefined,
                month: month ? parseInt(month, 10) : undefined,
                year: year ? parseInt(year, 10) : undefined,
                sort: sort || undefined,
            };
            const result = await transaction_service_1.TransactionService.getTransactions(userId, filters);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createTransaction(req, res, next) {
        try {
            const userId = req.user.userId;
            const transaction = await transaction_service_1.TransactionService.createTransaction(userId, req.body);
            res.status(201).json({
                status: 'success',
                message: 'Transaction created successfully',
                data: transaction,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTransaction(req, res, next) {
        try {
            const userId = req.user.userId;
            const transactionId = parseInt(req.params.id, 10);
            const transaction = await transaction_service_1.TransactionService.updateTransaction(transactionId, userId, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Transaction updated successfully',
                data: transaction,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteTransaction(req, res, next) {
        try {
            const userId = req.user.userId;
            const transactionId = parseInt(req.params.id, 10);
            await transaction_service_1.TransactionService.deleteTransaction(transactionId, userId);
            res.status(200).json({
                status: 'success',
                message: 'Transaction deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDashboardData(req, res, next) {
        try {
            const userId = req.user.userId;
            const data = await transaction_service_1.TransactionService.getDashboardData(userId);
            res.status(200).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TransactionController = TransactionController;
