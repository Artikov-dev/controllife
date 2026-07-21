import { CategoryRepository } from '../repositories/category.repo';
import { AppError } from '../middlewares/errorHandler';
import { Category } from '../types';

export class CategoryService {
  static async getCategories(userId: number): Promise<Category[]> {
    return CategoryRepository.findByUserId(userId);
  }

  static async createCategory(userId: number, data: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<Category> {
    const existing = await CategoryRepository.findByNameAndType(data.name, data.type, userId);
    if (existing) {
      throw new AppError(`Category named "${data.name}" already exists for type "${data.type}"`, 400);
    }
    return CategoryRepository.create({
      ...data,
      user_id: userId,
    });
  }

  static async updateCategory(
    id: number,
    userId: number,
    updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>
  ): Promise<Category> {
    const category = await CategoryRepository.findById(id);
    if (!category || category.user_id !== userId) {
      throw new AppError('Category not found', 404);
    }

    const updated = await CategoryRepository.update(id, userId, updates);
    if (!updated) {
      throw new AppError('Failed to update category', 500);
    }
    return updated;
  }

  static async deleteCategory(id: number, userId: number): Promise<void> {
    const category = await CategoryRepository.findById(id);
    if (!category || category.user_id !== userId) {
      throw new AppError('Category not found', 404);
    }

    // Check if any transactions reference this category
    const hasTx = await CategoryRepository.hasTransactions(id);
    if (hasTx) {
      throw new AppError(
        'Cannot delete category because it has associated transactions. Please delete or reassign the transactions first.',
        400
      );
    }

    const success = await CategoryRepository.delete(id, userId);
    if (!success) {
      throw new AppError('Failed to delete category', 500);
    }
  }
}
