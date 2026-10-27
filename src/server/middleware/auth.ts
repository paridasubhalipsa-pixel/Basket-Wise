import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/storageEngine.js';
import type { UserDoc } from '../types.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'basketwise-super-secret-jwt-key-2026-production';

export interface AuthenticatedRequest extends Request {
  user?: UserDoc;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = undefined;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.users.find((u) => u._id === decoded.id);

    if (!user) {
      req.user = undefined;
      return next();
    }

    req.user = user;
    next();
  } catch {
    req.user = undefined;
    next();
  }
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to proceed.',
      errors: ['Unauthorized'],
    });
    return;
  }
  next();
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
      errors: ['Unauthorized'],
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      errors: ['Forbidden'],
    });
    return;
  }

  next();
};
