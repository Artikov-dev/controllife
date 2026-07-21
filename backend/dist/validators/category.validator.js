"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required').max(100),
    icon: zod_1.z.string().max(100).optional().nullable(),
    color: zod_1.z.string().max(20).optional().nullable(),
    type: zod_1.z.enum(['income', 'expense']),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
