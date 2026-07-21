import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, isBlocked, page, limit } = req.query;
      
      const filters = {
        search: search as string || undefined,
        isBlocked: isBlocked === 'true' ? true : isBlocked === 'false' ? false : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      const result = await AdminService.getUsers(filters);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user!.userId;
      const userIdToBlock = parseInt(req.params.id, 10);
      const { isBlocked } = req.body;

      if (isBlocked === undefined) {
        res.status(400).json({ status: 'error', message: 'isBlocked field is required' });
        return;
      }

      const updatedUser = await AdminService.toggleBlockUser(userIdToBlock, isBlocked, adminId);
      res.status(200).json({
        status: 'success',
        message: `User successfully ${isBlocked ? 'blocked' : 'unblocked'}`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getSystemStats();
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
