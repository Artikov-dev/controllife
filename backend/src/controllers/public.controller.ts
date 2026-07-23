import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repo';
import { TransactionService } from '../services/transaction.service';
import { AppError } from '../middlewares/errorHandler';

export class PublicController {
  // Public endpoint: View shared dashboard by share_token
  static async getSharedDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shareToken } = req.params;
      if (!shareToken) {
        throw new AppError('Share token is required', 400);
      }

      const user = await UserRepository.findByShareToken(shareToken);
      if (!user) {
        throw new AppError('Ommaviy havola topilmadi yoki havola egasi tomonidan o\'chirilgan', 404);
      }

      const dashboardData = await TransactionService.getDashboardData(user.id);

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            full_name: user.full_name,
            avatar: user.avatar,
            currency: user.currency,
          },
          ...dashboardData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Auth endpoint: Get user's share link status
  static async getShareStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new AppError('Foydalanuvchi topilmadi', 404);
      }

      res.status(200).json({
        status: 'success',
        data: {
          share_token: user.share_token || null,
          is_share_enabled: !!user.is_share_enabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Auth endpoint: Enable / Generate share link
  static async generateShareLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const newShareToken = crypto.randomBytes(16).toString('hex');

      const updatedUser = await UserRepository.updateShareToken(userId, newShareToken, true);

      res.status(200).json({
        status: 'success',
        message: 'Ommaviy havola muvaffaqiyatli yaratildi',
        data: {
          share_token: updatedUser?.share_token,
          is_share_enabled: updatedUser?.is_share_enabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Auth endpoint: Disable / Revoke share link
  static async revokeShareLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await UserRepository.updateShareToken(userId, null, false);

      res.status(200).json({
        status: 'success',
        message: 'Ommaviy havola bekor qilindi',
        data: {
          share_token: null,
          is_share_enabled: false,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
