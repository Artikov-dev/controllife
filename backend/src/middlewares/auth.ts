import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { query } from '../config/db';
import { JwtPayload } from '../types';

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch (err) {
      res.status(401).json({ status: 'error', message: 'Invalid or expired access token' });
      return;
    }

    // Check if user is blocked or deleted in the database
    const userRes = await query('SELECT is_blocked FROM users WHERE id = $1', [decoded.userId]);
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
  } catch (error) {
    next(error);
  }
};
