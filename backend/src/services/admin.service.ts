import { UserRepository } from '../repositories/user.repo';
import { TransactionRepository } from '../repositories/transaction.repo';
import { AppError } from '../middlewares/errorHandler';

export class AdminService {
  static async getUsers(filters: { search?: string; isBlocked?: boolean; page: number; limit: number }) {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const users = await UserRepository.findAll({ ...filters, offset });
    const total = await UserRepository.countAll(filters);
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

  static async toggleBlockUser(userIdToBlock: number, isBlocked: boolean, adminId: number) {
    if (userIdToBlock === adminId) {
      throw new AppError('You cannot block or unblock yourself', 400);
    }

    const user = await UserRepository.findById(userIdToBlock);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot block another administrator', 400);
    }

    const updated = await UserRepository.setBlockStatus(userIdToBlock, isBlocked);
    if (!updated) {
      throw new AppError('Failed to change block status', 500);
    }

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  static async getSystemStats() {
    const userStats = await UserRepository.getPlatformStats();
    const txStats = await TransactionRepository.getGlobalStats();

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
