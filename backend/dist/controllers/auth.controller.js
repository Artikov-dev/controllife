"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.register(req.body);
            res.status(214).json({
                status: 'success',
                message: 'Registration successful',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.login(email, password);
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await auth_service_1.AuthService.refresh(refreshToken);
            res.status(200).json({
                status: 'success',
                message: 'Token refreshed successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await auth_service_1.AuthService.logout(refreshToken);
            res.status(200).json({
                status: 'success',
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            const userId = req.user.userId;
            const profile = await auth_service_1.AuthService.getProfile(userId);
            res.status(200).json({
                status: 'success',
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
