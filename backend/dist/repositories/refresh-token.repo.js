"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const db_1 = require("../config/db");
class RefreshTokenRepository {
    static async create(token, userId, expiresAt) {
        const res = await (0, db_1.query)(`INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`, [token, userId, expiresAt]);
        return res.rows[0];
    }
    static async findByToken(token) {
        const res = await (0, db_1.query)('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async deleteByToken(token) {
        const res = await (0, db_1.query)('DELETE FROM refresh_tokens WHERE token = $1', [token]);
        return (res.rowCount && res.rowCount > 0) || false;
    }
    static async deleteByUserId(userId) {
        const res = await (0, db_1.query)('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
        return res.rowCount || 0;
    }
    static async deleteExpired() {
        const res = await (0, db_1.query)('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
        return res.rowCount || 0;
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
