/**
 * Request logging middleware
 * Logs HTTP requests and responses
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logRequest } from '../utils/logger';

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  const requestId = uuidv4();

  // Add request ID to request headers for tracking
  req.headers['x-request-id'] = requestId;

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  // Record start time
  const startTime = Date.now();

  // Log request details
  console.log(`📥 [${requestId}] ${req.method} ${req.path} - ${req.ip} - ${req.get('User-Agent') || 'Unknown'}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response {
    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log response details
    logRequest(
      req.method,
      req.path,
      res.statusCode,
      responseTime,
      req.get('User-Agent'),
      req.ip
    );

    console.log(`📤 [${requestId}] ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms`);

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  } as any;

  next();
};

/**
 * Request timing middleware for performance monitoring
 */
export const requestTimer = (req: Request, res: Response, next: NextFunction): void => {
  req.startTime = Date.now();
  next();
};

declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}