/**
 * Type definitions index
 * Centralized type exports for the entire application
 */

// Core data types
export * from './video.types';
export * from './api.types';
export * from './config.types';
export * from './error.types';

// Enums
export * from '../enums';

// Re-export commonly used combinations
export type {
  YouTubeVideo,
  SubtitleData,
  ProcessedText,
  DownloadRequest,
  DownloadResult,
  ProcessingRequest
} from './video.types';

export type {
  ApiResponse
} from './api.types';

export type {
  AppConfig,
  YtdlpConfig,
  StorageConfig,
  ApiConfig,
  ProcessingConfig,
  LoggingConfig
} from './config.types';

export {
  AppError,
  ErrorCategory,
  ErrorSeverity,
  AppErrorCode,
  YtdlpError,
  type ErrorDetails,
  type ErrorResponse,
  type ErrorLog
} from './error.types';

export {
  LanguageCode,
  LanguageName,
  FileFormat,
  ProcessingStatus,
  LogLevel,
  Environment
} from '../enums';