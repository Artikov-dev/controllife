import { query } from '../config/db';
import { Budget } from '../types';

export class BudgetRepository {
  static async findByMonthAndYear(userId: number, month: number, year: number): Promise<Budget | null> {
    const res = await query(
      'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
      [userId, month, year]
    );
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  static async findByUserId(userId: number): Promise<Budget[]> {
    const res = await query('SELECT * FROM budgets WHERE user_id = $1 ORDER BY year DESC, month DESC', [userId]);
    return res.rows;
  }

  static async upsert(userId: number, month: number, year: number, amount: number): Promise<Budget> {
    const res = await query(
      `INSERT INTO budgets (user_id, month, year, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, month, year)
       DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [userId, month, year, amount]
    );
    return res.rows[0];
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const res = await query('DELETE FROM budgets WHERE id = $1 AND user_id = $2', [id, userId]);
    return (res.rowCount && res.rowCount > 0) || false;
  }
}
