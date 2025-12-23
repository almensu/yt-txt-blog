/**
 * Logging utility
 * Winston-based logging configuration
 */

import winston from 'winston';
import { config } from '../config/app.config';
import { LogLevel } from '@shared/enums';

/**
 * Create Winston logger instance
 */
const createLogger = (): winston.Logger => {
  const transports: winston.transport[] = [];

  // Console transport
  if (config.logging.logToConsole) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            let log = `${timestamp} [${level}]: ${message}`;

            // Add metadata if present
            if (Object.keys(meta).length > 0) {
              log += ` ${JSON.stringify(meta)}`;
            }

            // Add stack trace if present
            if (stack) {
              log += `\n${stack}`;
            }

            return log;
          })
        )
      })
    );
  }

  // File transport
  if (config.logging.logToFile) {
    transports.push(
      new winston.transports.File({
        filename: config.logging.logFilePath,
        maxsize: config.logging.maxFileSize,
        maxFiles: config.logging.maxFiles,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      })
    );

    // Separate error log file
    transports.push(
      new winston.transports.File({
        filename: config.logging.logFilePath.replace('.log', '.error.log'),
        level: 'error',
        maxsize: config.logging.maxFileSize,
        maxFiles: config.logging.maxFiles,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      })
    );
  }

  return winston.createLogger({
    level: config.logging.level,
    transports,
    // Handle uncaught exceptions and rejections
    exceptionHandlers: config.logging.logToFile ? [
      new winston.transports.File({
        filename: config.logging.logFilePath.replace('.log', '.exceptions.log'),
        maxsize: config.logging.maxFileSize,
        maxFiles: config.logging.maxFiles
      })
    ] : [],
    rejectionHandlers: config.logging.logToFile ? [
      new winston.transports.File({
        filename: config.logging.logFilePath.replace('.log', '.rejections.log'),
        maxsize: config.logging.maxFileSize,
        maxFiles: config.logging.maxFiles
      })
    ] : []
  });
};

// Create logger instance
export const logger = createLogger();

/**
 * Extended logger with context support
 */
export class LoggerWithContext {
  constructor(private context: string) {}

  private formatMessage(message: string, meta?: any): string {
    if (meta) {
      return `[${this.context}] ${message}`;
    }
    return `[${this.context}] ${message}`;
  }

  debug(message: string, meta?: any): void {
    logger.debug(this.formatMessage(message), meta);
  }

  info(message: string, meta?: any): void {
    logger.info(this.formatMessage(message), meta);
  }

  warn(message: string, meta?: any): void {
    logger.warn(this.formatMessage(message), meta);
  }

  error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      logger.error(this.formatMessage(message), {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
    } else {
      logger.error(this.formatMessage(message), error);
    }
  }
}

/**
 * Create logger with context
 */
export function createLoggerWithContext(context: string): LoggerWithContext {
  return new LoggerWithContext(context);
}

/**
 * Request logging middleware helper
 */
export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  userAgent?: string,
  ip?: string
): void => {
  logger.info('HTTP Request', {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userAgent,
    ip
  });
};

/**
 * Error logging helper
 */
export const logError = (
  error: Error,
  context?: string,
  requestId?: string
): void => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    requestId,
    timestamp: new Date().toISOString()
  });
};

export default logger;