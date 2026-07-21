import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repo';
import { RefreshTokenRepository } from '../repositories/refresh-token.repo';
import { AppError } from '../middlewares/errorHandler';
import { env } from '../config/env';
import { JwtPayload, User } from '../types';

export class AuthService {
  private static generateTokens(userId: number, email: string, role: 'user' | 'admin') {
    const payload: JwtPayload = { userId, email, role };
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  static async register(data: Omit<User, 'id' | 'role' | 'is_blocked' | 'created_at' | 'updated_at'>) {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email address already registered', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password!, salt);

    // First user is Admin (for testing convenience), subsequent users are normal users.
    // Let's check if any users exist.
    const platformStats = await UserRepository.getPlatformStats();
    const role = platformStats.totalUsers === 0 ? 'admin' : 'user';

    const user = await UserRepository.create({
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
    await RefreshTokenRepository.create(tokens.refreshToken, user.id, expiresAt);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  static async login(email: string, passwordInput: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.is_blocked) {
      throw new AppError('Your account has been blocked by an administrator', 403);
    }

    const isMatch = await bcrypt.compare(passwordInput, user.password!);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshTokenRepository.create(tokens.refreshToken, user.id, expiresAt);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  static async refresh(token: string) {
    if (!token) {
      throw new AppError('Refresh token required', 400);
    }

    const storedToken = await RefreshTokenRepository.findByToken(token);
    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      await RefreshTokenRepository.deleteByToken(token);
      throw new AppError('Expired refresh token', 401);
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch (err) {
      throw new AppError('Invalid refresh token signature', 401);
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.is_blocked) {
      throw new AppError('Account is blocked', 403);
    }

    // Single-use token rotation: Delete old refresh token, generate new tokens
    await RefreshTokenRepository.deleteByToken(token);

    const tokens = this.generateTokens(user.id, user.email, user.role);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshTokenRepository.create(tokens.refreshToken, user.id, expiresAt);

    return tokens;
  }

  static async logout(token: string) {
    if (!token) return;
    await RefreshTokenRepository.deleteByToken(token);
  }

  static async getProfile(userId: number) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
