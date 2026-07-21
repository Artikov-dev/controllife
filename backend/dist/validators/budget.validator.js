"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetSchema = void 0;
const zod_1 = require("zod");
exports.budgetSchema = zod_1.z.object({
    month: zod_1.z.coerce.number().int().min(1).max(12),
    year: zod_1.z.coerce.number().int().min(2000).max(2100),
    amount: zod_1.z.coerce.number().positive('Budget amount must be greater than 0'),
});
