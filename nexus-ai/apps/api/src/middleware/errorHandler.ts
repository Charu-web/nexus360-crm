import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export class AppError extends Error {
  statusCode: number;
  code?: string;
  errors?: any[];

  constructor(message: string, statusCode = 500, code?: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] || 'req-' + Date.now();
  const statusCode = err.statusCode || (err instanceof ZodError ? 400 : 500);

  if (statusCode >= 500) {
    logger.error(`[${requestId}] Server Error: ${err.message}`, {
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn(`[${requestId}] Client Warning (${statusCode}): ${err.message}`, {
      path: req.path,
      method: req.method,
    });
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Request payload validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      requestId,
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR'),
    message: err.message || 'An unexpected error occurred',
    ...(err.errors && { errors: err.errors }),
    requestId,
  });
};
