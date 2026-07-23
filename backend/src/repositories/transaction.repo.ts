import { query } from '../config/db';
import { Transaction } from '../types';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category_id?: number;
  search?: string;
  month?: number;
  year?: number;
  sort?: string;
}

export class TransactionRepository {
  static async findById(id: number, userId: number): Promise<any | null> {
    const res = await query(
      `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, userId]
    );
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  static async create(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const res = await query(
      `INSERT INTO transactions (title, amount, description, transaction_date, type, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        transaction.title,
        transaction.amount,
        transaction.description || null,
        transaction.transaction_date,
        transaction.type,
        transaction.category_id,
        transaction.user_id,
      ]
    );
    return res.rows[0];
  }

  static async update(
    id: number,
    userId: number,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<Transaction | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.findById(id, userId);

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const key of keys) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push((updates as any)[key]);
      paramIndex++;
    }

    values.push(id);
    const idParam = `$${paramIndex}`;
    paramIndex++;

    values.push(userId);
    const userIdParam = `$${paramIndex}`;

    const res = await query(
      `UPDATE transactions
       SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ${idParam} AND user_id = ${userIdParam}
       RETURNING *`,
      values
    );

    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const res = await query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  static async findAll(
    userId: number,
    filters: TransactionFilters
  ): Promise<(Transaction & { category_name: string; category_icon: string; category_color: string })[]> {
    const { type, category_id, search, month, year, sort, page = 1, limit = 10 } = filters;
    const conditions: string[] = ['t.user_id = $1'];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (type) {
      conditions.push(`t.type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    if (category_id) {
      conditions.push(`t.category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (month) {
      conditions.push(`EXTRACT(MONTH FROM t.transaction_date) = $${paramIndex}`);
      values.push(month);
      paramIndex++;
    }

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM t.transaction_date) = $${paramIndex}`);
      values.push(year);
      paramIndex++;
    }

    // Sorting
    let orderBy = 't.transaction_date DESC, t.id DESC';
    if (sort) {
      switch (sort) {
        case 'date_asc':
          orderBy = 't.transaction_date ASC, t.id ASC';
          break;
        case 'date_desc':
          orderBy = 't.transaction_date DESC, t.id DESC';
          break;
        case 'amount_asc':
          orderBy = 't.amount ASC';
          break;
        case 'amount_desc':
          orderBy = 't.amount DESC';
          break;
        case 'title_asc':
          orderBy = 't.title ASC';
          break;
        case 'title_desc':
          orderBy = 't.title DESC';
          break;
      }
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    values.push(limit);
    const limitParam = `$${paramIndex}`;
    paramIndex++;

    values.push(offset);
    const offsetParam = `$${paramIndex}`;

    const sql = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const res = await query(sql, values);
    return res.rows;
  }

  static async countAll(userId: number, filters: Omit<TransactionFilters, 'page' | 'limit' | 'sort'>): Promise<number> {
    const { type, category_id, search, month, year } = filters;
    const conditions: string[] = ['user_id = $1'];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (type) {
      conditions.push(`type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    if (category_id) {
      conditions.push(`category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (month) {
      conditions.push(`EXTRACT(MONTH FROM transaction_date) = $${paramIndex}`);
      values.push(month);
      paramIndex++;
    }

    if (year) {
      conditions.push(`EXTRACT(YEAR FROM transaction_date) = $${paramIndex}`);
      values.push(year);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const sql = `SELECT COUNT(*) FROM transactions WHERE ${whereClause}`;
    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  }

  static async getSummaryStats(userId: number): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const res = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    );

    const totalIncome = parseFloat(res.rows[0].total_income);
    const totalExpense = parseFloat(res.rows[0].total_expense);
    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance };
  }

  static async getCategoryDistribution(userId: number): Promise<{ categoryName: string; amount: number; color: string; type: string }[]> {
    const res = await query(
      `SELECT 
        c.name as category_name,
        COALESCE(SUM(t.amount), 0) as amount,
        c.color as category_color,
        c.type
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       GROUP BY c.id, c.name, c.color, c.type
       ORDER BY amount DESC`,
      [userId]
    );

    return res.rows.map(row => {
      const val = parseFloat(row.amount) || 0;
      return {
        categoryName: row.category_name,
        category_name: row.category_name,
        name: row.category_name,
        amount: val,
        total: val,
        total_amount: val,
        color: row.category_color || '#f59e0b',
        type: row.type,
      };
    });
  }

  static async getMonthlyTrend(userId: number, limit: number = 6): Promise<{ month: string; income: number; expense: number }[]> {
    const res = await query(
      `SELECT 
        TO_CHAR(transaction_date, 'YYYY-MM') as month_str,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= DATE_TRUNC('month', NOW() - INTERVAL '${limit - 1} months')
       GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
       ORDER BY month_str ASC`,
      [userId]
    );

    return res.rows.map(row => ({
      month: row.month_str,
      income: parseFloat(row.income),
      expense: parseFloat(row.expense),
    }));
  }

  static async getGlobalStats(): Promise<{ totalVolume: number; totalTransactions: number }> {
    const res = await query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_volume,
        COUNT(*) as total_transactions
      FROM transactions
    `);
    return {
      totalVolume: parseFloat(res.rows[0].total_volume),
      totalTransactions: parseInt(res.rows[0].total_transactions, 10),
    };
  }
}
