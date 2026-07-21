import { query } from '../config/db';
import { Category } from '../types';

export class CategoryRepository {
  static async findById(id: number): Promise<Category | null> {
    const res = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  static async findByUserId(userId: number): Promise<Category[]> {
    const res = await query('SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC', [userId]);
    return res.rows;
  }

  static async findByNameAndType(name: string, type: 'income' | 'expense', userId: number): Promise<Category | null> {
    const res = await query(
      'SELECT * FROM categories WHERE LOWER(name) = LOWER($1) AND type = $2 AND user_id = $3',
      [name, type, userId]
    );
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  static async create(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const res = await query(
      `INSERT INTO categories (name, icon, color, type, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [category.name, category.icon || null, category.color || null, category.type, category.user_id]
    );
    return res.rows[0];
  }

  static async update(
    id: number,
    userId: number,
    updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>
  ): Promise<Category | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.findById(id);

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
      `UPDATE categories
       SET ${setClauses.join(', ')}
       WHERE id = ${idParam} AND user_id = ${userIdParam}
       RETURNING *`,
      values
    );

    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const res = await query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  static async hasTransactions(id: number): Promise<boolean> {
    const res = await query('SELECT 1 FROM transactions WHERE category_id = $1 LIMIT 1', [id]);
    return (res.rowCount && res.rowCount > 0) || false;
  }
}
