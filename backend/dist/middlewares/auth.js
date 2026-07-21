"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ status: 'error', message: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch (err) {
            res.status(401).json({ status: 'error', message: 'Invalid or expired access token' });
            return;
        }
        // Check if user is blocked or deleted in the database
        const userRes = await (0, db_1.query)('SELECT is_blocked FROM users WHERE id = $1', [decoded.userId]);
        if (userRes.rowCount === 0) {
            res.status(401).json({ status: 'error', message: 'User no longer exists' });
            return;
        }
        if (userRes.rows[0].is_blocked) {
            res.status(403).json({ status: 'error', message: 'Your account has been blocked by an administrator' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.auth = auth;
