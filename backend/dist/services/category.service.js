"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repo_1 = require("../repositories/category.repo");
const errorHandler_1 = require("../middlewares/errorHandler");
class CategoryService {
    static async getCategories(userId) {
        return category_repo_1.CategoryRepository.findByUserId(userId);
    }
    static async createCategory(userId, data) {
        const existing = await category_repo_1.CategoryRepository.findByNameAndType(data.name, data.type, userId);
        if (existing) {
            throw new errorHandler_1.AppError(`Category named "${data.name}" already exists for type "${data.type}"`, 400);
        }
        return category_repo_1.CategoryRepository.create({
            ...data,
            user_id: userId,
        });
    }
    static async updateCategory(id, userId, updates) {
        const category = await category_repo_1.CategoryRepository.findById(id);
        if (!category || category.user_id !== userId) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
        const updated = await category_repo_1.CategoryRepository.update(id, userId, updates);
        if (!updated) {
            throw new errorHandler_1.AppError('Failed to update category', 500);
        }
        return updated;
    }
    static async deleteCategory(id, userId) {
        const category = await category_repo_1.CategoryRepository.findById(id);
        if (!category || category.user_id !== userId) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
        // Check if any transactions reference this category
        const hasTx = await category_repo_1.CategoryRepository.hasTransactions(id);
        if (hasTx) {
            throw new errorHandler_1.AppError('Cannot delete category because it has associated transactions. Please delete or reassign the transactions first.', 400);
        }
        const success = await category_repo_1.CategoryRepository.delete(id, userId);
        if (!success) {
            throw new errorHandler_1.AppError('Failed to delete category', 500);
        }
    }
}
exports.CategoryService = CategoryService;
