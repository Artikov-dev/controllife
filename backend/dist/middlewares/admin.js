"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const admin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
            status: 'error',
            message: 'Access denied. Administrator rights required.',
        });
        return;
    }
    next();
};
exports.admin = admin;
