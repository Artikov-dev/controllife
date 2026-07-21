"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
class CategoryController {
    static async getCategories(req, res, next) {
        try {
            const userId = req.user.userId;
            const categories = await category_service_1.CategoryService.getCategories(userId);
            res.status(200).json({
                status: 'success',
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createCategory(req, res, next) {
        try {
            const userId = req.user.userId;
            const category = await category_service_1.CategoryService.createCategory(userId, req.body);
            res.status(201).json({
                status: 'success',
                message: 'Category created successfully',
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCategory(req, res, next) {
        try {
            const userId = req.user.userId;
            const categoryId = parseInt(req.params.id, 10);
            const category = await category_service_1.CategoryService.updateCategory(categoryId, userId, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Category updated successfully',
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteCategory(req, res, next) {
        try {
            const userId = req.user.userId;
            const categoryId = parseInt(req.params.id, 10);
            await category_service_1.CategoryService.deleteCategory(categoryId, userId);
            res.status(200).json({
                status: 'success',
                message: 'Category deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CategoryController = CategoryController;
