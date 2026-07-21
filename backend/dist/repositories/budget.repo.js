"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetRepository = void 0;
const db_1 = require("../config/db");
class BudgetRepository {
    static async findByMonthAndYear(userId, month, year) {
        const res = await (0, db_1.query)('SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3', [userId, month, year]);
        return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
    }
    static async findByUserId(userId) {
        const res = await (0, db_1.query)('SELECT * FROM budgets WHERE user_id = $1 ORDER BY year DESC, month DESC', [userId]);
        return res.rows;
    }
    static async upsert(userId, month, year, amount) {
        const res = await (0, db_1.query)(`INSERT INTO budgets (user_id, month, year, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, month, year)
       DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`, [userId, month, year, amount]);
        return res.rows[0];
    }
    static async delete(id, userId) {
        const res = await (0, db_1.query)('DELETE FROM budgets WHERE id = $1 AND user_id = $2', [id, userId]);
        return (res.rowCount && res.rowCount > 0) || false;
    }
}
exports.BudgetRepository = BudgetRepository;
