import { query } from '../config/db';
import { RecurringTransaction } from '../types';

export class RecurringTransactionRepository {
  static async findById(id: number, userId: number): Promise<any | null> {
    const res = await query(
      `SELECT r.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM recurring_transactions r
       JOIN categories c ON r.category_id = c.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [id, userId]
    );
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  static async findByUserId(userId: number): Promise<any[]> {
    const res = await query(
      `SELECT r.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM recurring_transactions r
       JOIN categories c ON r.category_id = c.id
       WHERE r.user_id = $1
       ORDER BY r.next_run ASC`,
      [userId]
    );
    return res.rows;
  }

  static async create(rt: Omit<RecurringTransaction, 'id' | 'created_at'>): Promise<RecurringTransaction> {
    const res = await query(
      `INSERT INTO recurring_transactions (title, amount, frequency, next_run, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [rt.title, rt.amount, rt.frequency, rt.next_run, rt.category_id, rt.user_id]
    );
    return res.rows[0];
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const res = await query('DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2', [id, userId]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  static async findDueByUserId(userId: number): Promise<RecurringTransaction[]> {
    const res = await query(
      `SELECT * FROM recurring_transactions 
       WHERE user_id = $1 AND next_run <= CURRENT_DATE`,
      [userId]
    );
    return res.rows;
  }

  static async updateNextRun(id: number, nextRun: string): Promise<void> {
    await query(
      'UPDATE recurring_transactions SET next_run = $1 WHERE id = $2',
      [nextRun, id]
    );
  }
}
