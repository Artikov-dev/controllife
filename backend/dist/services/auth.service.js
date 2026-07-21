"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repo_1 = require("../repositories/user.repo");
const refresh_token_repo_1 = require("../repositories/refresh-token.repo");
const errorHandler_1 = require("../middlewares/errorHandler");
const env_1 = require("../config/env");
class AuthService {
    static generateTokens(userId, email, role) {
        const payload = { userId, email, role };
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }
    static async register(data) {
        const existingUser = await user_repo_1.UserRepository.findByEmail(data.email);
        if (existingUser) {
            throw new errorHandler_1.AppError('Email address already registered', 400);
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(data.password, salt);
        // First user is Admin (for testing convenience), subsequent users are normal users.
        // Let's check if any users exist.
        const platformStats = await user_repo_1.UserRepository.getPlatformStats();
        const role = platformStats.totalUsers === 0 ? 'admin' : 'user';
        const user = await user_repo_1.UserRepository.create({
            full_name: data.full_name,
            email: data.email,
            password: hashedPassword,
            role,
            avatar: data.avatar || null,
            currency: data.currency || 'UZS',
        });
        const tokens = this.generateTokens(user.id, user.email, user.role);
        // Save refresh token to db
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await refresh_token_repo_1.RefreshTokenRepository.create(tokens.refreshToken, user.id, expiresAt);
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, ...tokens };
    }
    static async login(email, passwordInput) {
        const user = await user_repo_1.UserRepository.findByEmail(email);
        if (!user) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        if (user.is_blocked) {
            throw new errorHandler_1.AppError('Your account has been blocked by an administrator', 403);
        }
        const isMatch = await bcryptjs_1.default.compare(passwordInput, user.password);
        if (!isMatch) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        const tokens = this.generateTokens(user.id, user.email, user.role);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await refresh_token_repo_1.RefreshTokenRepository.create(tokens.refreshToken, user.id, expiresAt);
        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, ...tokens };
    }
    static async refresh(token) {
        if (!token) {
            throw new errorHandler_1.AppError('Refresh token required', 400);
        }
        const storedToken = await refresh_token_repo_1.RefreshTokenRepository.findByToken(token);
        if (!storedToken) {
            throw new errorHandler_1.AppError('Invalid refresh token', 401);
        }
        if (new Date(storedToken.expires_at) < new Date()) {
            await refresh_token_repo_1.RefreshTokenRepository.deleteByToken(token);
            throw new errorHandler_1.AppError('Expired refresh token', 401);
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
        }
        catch (err) {
            throw new errorHandler_1.AppError('Invalid refresh token signature', 401);
        }
        const user = await user_repo_1.UserRepository.findById(decoded.userId);
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 401);
        }
        if (user.is_blocked) {
            throw new errorHandler_1.AppError('Account is blocked', 403);
        }
        // Single-use token rotation: Delete old refresh token, generate new tokens
        await refresh_token_repo_1.RefreshTokenRepository.deleteByToken(token);
        const tokens = this.generateTokens(user.id, user.email, user.role);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await refresh_token_repo_1.RefreshTokenRepository.create(tokens.refreshToken, user.id, expiresAt);
        return tokens;
    }
    static async logout(token) {
        if (!token)
            return;
        await refresh_token_repo_1.RefreshTokenRepository.deleteByToken(token);
    }
    static async getProfile(userId) {
        const user = await user_repo_1.UserRepository.findById(userId);
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
exports.AuthService = AuthService;
