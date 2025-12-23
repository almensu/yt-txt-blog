/**
 * Error handling middleware
 * Centralized error processing and response formatting
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCategory, ErrorSeverity } from '@shared/types';
import { logger, logError } from '../utils/logger';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Generate request ID if not present
  const requestId = req.headers['x-request-id'] as string || generateRequestId();

  // Handle different types of errors
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error.name === 'ValidationError') {
    appError = new AppError(
      'VALIDATION_ERROR',
      error.message,
      ErrorCategory.VALIDATION_ERROR,
      ErrorSeverity.MEDIUM,
      error.stack,
      requestId
    );
  } else if (error.name === 'SyntaxError' && (error as any).type === 'entity.parse.failed') {
    appError = new AppError(
      'INVALID_JSON',
      'Invalid JSON in request body',
      ErrorCategory.VALIDATION_ERROR,
      ErrorSeverity.MEDIUM,
      error.stack,
      requestId
    );
  } else {
    // Unknown error
    appError = new AppError(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      ErrorCategory.PROCESSING_ERROR,
      ErrorSeverity.HIGH,
      error.stack,
      requestId
    );
  }

  // Log the error
  logError(error, `${req.method} ${req.path}`, requestId);

  // Send error response
  const errorResponse = appError.toJSON();
  const statusCode = getStatusCodeFromError(appError.severity);

  res.status(statusCode).json(errorResponse);
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Map error severity to HTTP status code
 */
function getStatusCodeFromError(severity: ErrorSeverity): number {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 200; // Warning, but successful response
    case ErrorSeverity.MEDIUM:
      return 400; // Bad request
    case ErrorSeverity.HIGH:
      return 500; // Internal server error
    case ErrorSeverity.CRITICAL:
      return 503; // Service unavailable
    default:
      return 500;
  }
}

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 error handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const error = new AppError(
    'NOT_FOUND',
    `Route ${req.originalUrl} not found`,
    ErrorCategory.VALIDATION_ERROR,
    ErrorSeverity.MEDIUM
  );

  const errorResponse = error.toJSON();
  res.status(404).json(errorResponse);
};