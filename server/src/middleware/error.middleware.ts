import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = (err as AppError).statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  let finalStatusCode = statusCode;
  let finalMessage = message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    finalStatusCode = 400;
    finalMessage = 'Validation failed';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    finalStatusCode = 401;
    finalMessage = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    finalStatusCode = 401;
    finalMessage = 'Token expired';
  }

  if (process.env.NODE_ENV === 'development') {
    // Only log 500 errors or non-expected errors to avoid cluttering the terminal
    if (finalStatusCode === 500) {
      console.error(`[ERROR] ${finalStatusCode} — ${finalMessage}\n`, err.stack);
    } else {
      console.warn(`[WARN] ${finalStatusCode} — ${finalMessage}`);
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, finalMessage, finalStatusCode, errors);
  }

  return sendError(res, finalMessage, finalStatusCode);
};
