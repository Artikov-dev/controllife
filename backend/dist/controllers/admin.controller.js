"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
class AdminController {
    static async getUsers(req, res, next) {
        try {
            const { search, isBlocked, page, limit } = req.query;
            const filters = {
                search: search || undefined,
                isBlocked: isBlocked === 'true' ? true : isBlocked === 'false' ? false : undefined,
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 10,
            };
            const result = await admin_service_1.AdminService.getUsers(filters);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async blockUser(req, res, next) {
        try {
            const adminId = req.user.userId;
            const userIdToBlock = parseInt(req.params.id, 10);
            const { isBlocked } = req.body;
            if (isBlocked === undefined) {
                res.status(400).json({ status: 'error', message: 'isBlocked field is required' });
                return;
            }
            const updatedUser = await admin_service_1.AdminService.toggleBlockUser(userIdToBlock, isBlocked, adminId);
            res.status(200).json({
                status: 'success',
                message: `User successfully ${isBlocked ? 'blocked' : 'unblocked'}`,
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(req, res, next) {
        try {
            const stats = await admin_service_1.AdminService.getSystemStats();
            res.status(200).json({
                status: 'success',
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
