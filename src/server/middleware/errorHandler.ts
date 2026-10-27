import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  errors?: string[];
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const errors = err.errors || [];

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[BasketWise Server Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : [message],
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
    errors: ['Not Found'],
  });
};
