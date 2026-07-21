"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(255),
    amount: zod_1.z.coerce.number().positive('Amount must be greater than 0'),
    description: zod_1.z.string().optional().nullable(),
    transaction_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Transaction date must be in YYYY-MM-DD format'),
    type: zod_1.z.enum(['income', 'expense']),
    category_id: zod_1.z.coerce.number().int().positive('Valid category ID is required'),
});
exports.updateTransactionSchema = exports.createTransactionSchema.partial();
