"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2, 'Name must be at least 2 characters long').max(100),
    email: zod_1.z.string().email('Invalid email address').max(255),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    currency: zod_1.z.string().max(10).optional().default('UZS'),
    avatar: zod_1.z.string().url().or(zod_1.z.literal('')).optional().nullable(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
