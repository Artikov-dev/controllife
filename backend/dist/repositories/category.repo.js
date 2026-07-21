"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const db_1 = require("../config/db");
class CategoryRepository {
    static async findById(id) {
        const res = await (0, db_1.query)('SELECT * FROM categories WHERE id = $1', [id]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async findByUserId(userId) {
        const res = await (0, db_1.query)('SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC', [userId]);
        return res.rows;
    }
    static async findByNameAndType(name, type, userId) {
        const res = await (0, db_1.query)('SELECT * FROM categories WHERE LOWER(name) = LOWER($1) AND type = $2 AND user_id = $3', [name, type, userId]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async create(category) {
        const res = await (0, db_1.query)(`INSERT INTO categories (name, icon, color, type, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [category.name, category.icon || null, category.color || null, category.type, category.user_id]);
        return res.rows[0];
    }
    static async update(id, userId, updates) {
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
        const idParam = `$${paramIndex}`;
        paramIndex++;
        values.push(userId);
        const userIdParam = `$${paramIndex}`;
        const res = await (0, db_1.query)(`UPDATE categories
       SET ${setClauses.join(', ')}
       WHERE id = ${idParam} AND user_id = ${userIdParam}
       RETURNING *`, values);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async delete(id, userId) {
        const res = await (0, db_1.query)('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
        return (res.rowCount && res.rowCount > 0) || false;
    }
    static async hasTransactions(id) {
        const res = await (0, db_1.query)('SELECT 1 FROM transactions WHERE category_id = $1 LIMIT 1', [id]);
        return (res.rowCount && res.rowCount > 0) || false;
    }
}
exports.CategoryRepository = CategoryRepository;
