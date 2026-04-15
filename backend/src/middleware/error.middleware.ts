import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global error handling middleware.
 * Catches all unhandled errors and returns structured error responses.
 */
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    name: err.name,
  });

  // Prisma known request errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      error: 'Database operation failed',
      message: err.message,
    });
    return;
  }

  // Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    res.status(400).json({
      error: 'Invalid data provided',
      message: 'The request data does not match the expected schema.',
    });
    return;
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    res.status(422).json({
      error: 'Validation error',
      message: err.message,
    });
    return;
  }

  // Default 500 error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
}
