"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const db_1 = require("../config/db");
class UserRepository {
    static async findByEmail(email) {
        const res = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async findById(id) {
        const res = await (0, db_1.query)('SELECT * FROM users WHERE id = $1', [id]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async findByShareToken(shareToken) {
        const res = await (0, db_1.query)('SELECT * FROM users WHERE share_token = $1 AND is_share_enabled = true', [shareToken]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async updateShareToken(id, shareToken, isShareEnabled) {
        const res = await (0, db_1.query)(`UPDATE users
       SET share_token = $1, is_share_enabled = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`, [shareToken, isShareEnabled, id]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async create(user) {
        const res = await (0, db_1.query)(`INSERT INTO users (full_name, email, password, role, avatar, currency)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [user.full_name, user.email, user.password, user.role || 'user', user.avatar || null, user.currency || 'UZS']);
        return res.rows[0];
    }
    static async update(id, updates) {
        const keys = Object.keys(updates);
        if (keys.length === 0)
            return this.findById(id);
        const setClauses = [];
        const values = [];
        let paramIndex = 1;
        for (const key of keys) {
            setClauses.push(`${key} = $${paramIndex}`);
            values.push(updates[key]);
            paramIndex++;
        }
        values.push(id);
        const res = await (0, db_1.query)(`UPDATE users
       SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`, values);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async setBlockStatus(id, isBlocked) {
        const res = await (0, db_1.query)(`UPDATE users
       SET is_blocked = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`, [isBlocked, id]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async findAll(filters) {
        const { search, isBlocked, limit, offset } = filters;
        const conditions = [];
        const values = [];
        let paramIndex = 1;
        if (search) {
            conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }
        if (isBlocked !== undefined) {
            conditions.push(`is_blocked = $${paramIndex}`);
            values.push(isBlocked);
            paramIndex++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        values.push(limit);
        const limitParam = `$${paramIndex}`;
        paramIndex++;
        values.push(offset);
        const offsetParam = `$${paramIndex}`;
        const sql = `
      SELECT id, full_name, email, role, avatar, currency, is_blocked, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;
        const res = await (0, db_1.query)(sql, values);
        return res.rows;
    }
    static async countAll(filters) {
        const { search, isBlocked } = filters;
        const conditions = [];
        const values = [];
        let paramIndex = 1;
        if (search) {
            conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }
        if (isBlocked !== undefined) {
            conditions.push(`is_blocked = $${paramIndex}`);
            values.push(isBlocked);
            paramIndex++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `SELECT COUNT(*) FROM users ${whereClause}`;
        const res = await (0, db_1.query)(sql, values);
        return parseInt(res.rows[0].count, 10);
    }
    static async getPlatformStats() {
        const res = await (0, db_1.query)(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_blocked = true THEN 1 ELSE 0 END) as total_blocked
      FROM users
    `);
        return {
            totalUsers: parseInt(res.rows[0].total_users, 10) || 0,
            totalBlocked: parseInt(res.rows[0].total_blocked, 10) || 0,
        };
    }
}
exports.UserRepository = UserRepository;
