import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const categories = await CategoryService.getCategories(userId);
      res.status(200).json({
        status: 'success',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const category = await CategoryService.createCategory(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const categoryId = parseInt(req.params.id, 10);
      const category = await CategoryService.updateCategory(categoryId, userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const categoryId = parseInt(req.params.id, 10);
      await CategoryService.deleteCategory(categoryId, userId);
      res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
