import { query } from '../config/db';
import { RefreshToken } from '../types';

export class RefreshTokenRepository {
  static async create(token: string, userId: number, expiresAt: Date): Promise<RefreshToken> {
    const res = await query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [token, userId, expiresAt]
    );
    return res.rows[0];
  }

  static async findByToken(token: string): Promise<RefreshToken | null> {
    const res = await query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  static async deleteByToken(token: string): Promise<boolean> {
    const res = await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  static async deleteByUserId(userId: number): Promise<number> {
    const res = await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    return res.rowCount || 0;
  }

  static async deleteExpired(): Promise<number> {
    const res = await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    return res.rowCount || 0;
  }
}
