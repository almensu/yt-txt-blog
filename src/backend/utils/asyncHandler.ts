/**
 * Async Handler Utility
 * Wrapper for async route handlers to catch errors and pass them to error middleware
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Type for async request handler functions
 */
type AsyncRequestHandler = (req: Request, res: Response, next?: NextFunction) => Promise<void>;

/**
 * Wrapper function that catches errors from async route handlers
 * and passes them to the Express error handling middleware
 *
 * @param fn - Async request handler function
 * @returns Express middleware function
 */
export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}