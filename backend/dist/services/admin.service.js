"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const user_repo_1 = require("../repositories/user.repo");
const transaction_repo_1 = require("../repositories/transaction.repo");
const errorHandler_1 = require("../middlewares/errorHandler");
class AdminService {
    static async getUsers(filters) {
        const { page, limit } = filters;
        const offset = (page - 1) * limit;
        const users = await user_repo_1.UserRepository.findAll({ ...filters, offset });
        const total = await user_repo_1.UserRepository.countAll(filters);
        const totalPages = Math.ceil(total / limit);
        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
    static async toggleBlockUser(userIdToBlock, isBlocked, adminId) {
        if (userIdToBlock === adminId) {
            throw new errorHandler_1.AppError('You cannot block or unblock yourself', 400);
        }
        const user = await user_repo_1.UserRepository.findById(userIdToBlock);
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        if (user.role === 'admin') {
            throw new errorHandler_1.AppError('Cannot block another administrator', 400);
        }
        const updated = await user_repo_1.UserRepository.setBlockStatus(userIdToBlock, isBlocked);
        if (!updated) {
            throw new errorHandler_1.AppError('Failed to change block status', 500);
        }
        const { password, ...userWithoutPassword } = updated;
        return userWithoutPassword;
    }
    static async getSystemStats() {
        const userStats = await user_repo_1.UserRepository.getPlatformStats();
        const txStats = await transaction_repo_1.TransactionRepository.getGlobalStats();
        return {
            totalUsers: userStats.totalUsers,
            totalBlockedUsers: userStats.totalBlocked,
            totalTransactionVolume: txStats.totalVolume,
            totalTransactions: txStats.totalTransactions,
            averageTransactionAmount: txStats.totalTransactions > 0
                ? parseFloat((txStats.totalVolume / txStats.totalTransactions).toFixed(2))
                : 0,
        };
    }
}
exports.AdminService = AdminService;
