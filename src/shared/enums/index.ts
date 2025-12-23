/**
 * Enum definitions
 * Centralized enum exports
 */

export * from '../types/error.types';

/**
 * Language codes enum
 */
export enum LanguageCode {
  CHINESE = 'zh',
  ENGLISH = 'en',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  RUSSIAN = 'ru',
  PORTUGUESE = 'pt',
  ITALIAN = 'it',
  ARABIC = 'ar',
  HINDI = 'hi'
}

/**
 * Language names enum
 */
export enum LanguageName {
  CHINESE = 'Chinese',
  ENGLISH = 'English',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  RUSSIAN = 'Russian',
  PORTUGUESE = 'Portuguese',
  ITALIAN = 'Italian',
  ARABIC = 'Arabic',
  HINDI = 'Hindi'
}

/**
 * File format enum
 */
export enum FileFormat {
  JSON3 = 'json3',
  TXT = 'txt',
  JSON = 'json'
}

/**
 * Processing status enum
 */
export enum ProcessingStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Environment enum
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test'
}