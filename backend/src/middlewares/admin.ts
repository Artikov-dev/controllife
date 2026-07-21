import { Request, Response, NextFunction } from 'express';

export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Access denied. Administrator rights required.',
    });
    return;
  }
  next();
};
