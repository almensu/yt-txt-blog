/**
 * Error related type definitions
 * Based on P01-Spec.md error handling specifications
 */

/**
 * Error categories
 */
export enum ErrorCategory {
  /** Input validation error */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Network related error */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Filesystem error */
  FILESYSTEM_ERROR = 'FILESYSTEM_ERROR',
  /** Processing logic error */
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  /** External tool error */
  EXTERNAL_TOOL_ERROR = 'EXTERNAL_TOOL_ERROR',
  /** Configuration error */
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  /** Warning level, doesn't affect core functionality */
  LOW = 'LOW',
  /** Medium error, affects partial functionality */
  MEDIUM = 'MEDIUM',
  /** Serious error, affects core functionality */
  HIGH = 'HIGH',
  /** Fatal error, system cannot run */
  CRITICAL = 'CRITICAL'
}

/**
 * yt-dlp specific errors
 */
export enum YtdlpError {
  /** Video not found */
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  /** Subtitle not available */
  SUBTITLE_NOT_AVAILABLE = 'SUBTITLE_NOT_AVAILABLE',
  /** Network error */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Permission denied */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** Rate limited */
  RATE_LIMITED = 'RATE_LIMITED',
  /** Invalid URL */
  INVALID_URL = 'INVALID_URL'
}

/**
 * Application specific error codes
 */
export enum AppErrorCode {
  /** Invalid YouTube URL */
  INVALID_YOUTUBE_URL = 'INVALID_YOUTUBE_URL',
  /** Video not found */
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  /** Subtitle download failed */
  SUBTITLE_DOWNLOAD_FAILED = 'SUBTITLE_DOWNLOAD_FAILED',
  /** File not found */
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  /** File processing failed */
  FILE_PROCESSING_FAILED = 'FILE_PROCESSING_FAILED',
  /** Storage quota exceeded */
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  /** Invalid file format */
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  /** Processing timeout */
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  /** Configuration error */
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  /** External tool not found */
  EXTERNAL_TOOL_NOT_FOUND = 'EXTERNAL_TOOL_NOT_FOUND',
  /** Permission denied */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  /** Internal server error */
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

/**
 * Error details
 */
export interface ErrorDetails {
  /** Error code */
  code: string;
  /** Error category */
  category: ErrorCategory;
  /** Error severity */
  severity: ErrorSeverity;
  /** User-friendly error message */
  message: string;
  /** Technical details */
  technicalDetails?: string;
  /** Error occurrence time */
  timestamp: Date;
  /** Request ID for tracking */
  requestId?: string;
  /** Stack trace */
  stack?: string;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  error: ErrorDetails;
}

/**
 * Error log entry
 */
export interface ErrorLog {
  /** Timestamp */
  timestamp: Date;
  /** Log level */
  level: 'ERROR' | 'WARN';
  /** Error category */
  category: ErrorCategory;
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Stack trace */
  stack?: string;
  /** Context information */
  context: {
    /** User ID */
    userId?: string;
    /** Request ID */
    requestId?: string;
    /** Video ID */
    videoId?: string;
    /** IP address */
    ip?: string;
    /** User agent */
    userAgent?: string;
  };
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly technicalDetails?: string;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    code: string,
    message: string,
    category: ErrorCategory = ErrorCategory.PROCESSING_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    technicalDetails?: string,
    requestId?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.technicalDetails = technicalDetails;
    this.timestamp = new Date();
    this.requestId = requestId;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert to error response format
   */
  toJSON(): ErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        category: this.category,
        severity: this.severity,
        message: this.message,
        technicalDetails: this.technicalDetails,
        timestamp: this.timestamp,
        requestId: this.requestId,
        stack: this.stack
      }
    };
  }

  /**
   * Create validation error
   */
  static validation(message: string, technicalDetails?: string): AppError {
    return new AppError(
      AppErrorCode.INVALID_YOUTUBE_URL,
      message,
      ErrorCategory.VALIDATION_ERROR,
      ErrorSeverity.MEDIUM,
      technicalDetails
    );
  }

  /**
   * Create network error
   */
  static network(message: string, technicalDetails?: string): AppError {
    return new AppError(
      AppErrorCode.SUBTITLE_DOWNLOAD_FAILED,
      message,
      ErrorCategory.NETWORK_ERROR,
      ErrorSeverity.HIGH,
      technicalDetails
    );
  }

  /**
   * Create filesystem error
   */
  static filesystem(message: string, technicalDetails?: string): AppError {
    return new AppError(
      AppErrorCode.FILE_NOT_FOUND,
      message,
      ErrorCategory.FILESYSTEM_ERROR,
      ErrorSeverity.HIGH,
      technicalDetails
    );
  }

  /**
   * Create processing error
   */
  static processing(message: string, technicalDetails?: string): AppError {
    return new AppError(
      AppErrorCode.FILE_PROCESSING_FAILED,
      message,
      ErrorCategory.PROCESSING_ERROR,
      ErrorSeverity.MEDIUM,
      technicalDetails
    );
  }

  /**
   * Create external tool error
   */
  static externalTool(message: string, technicalDetails?: string): AppError {
    return new AppError(
      AppErrorCode.EXTERNAL_TOOL_NOT_FOUND,
      message,
      ErrorCategory.EXTERNAL_TOOL_ERROR,
      ErrorSeverity.CRITICAL,
      technicalDetails
    );
  }

  /**
   * Create configuration error
   */
  static configuration(message: string, technicalDetails?: string): AppError {
    return new AppError(
      AppErrorCode.CONFIGURATION_ERROR,
      message,
      ErrorCategory.CONFIGURATION_ERROR,
      ErrorSeverity.CRITICAL,
      technicalDetails
    );
  }
}