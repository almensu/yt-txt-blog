/**
 * Configuration validation and management service
 * Validates configuration, checks external tools, and ensures system readiness
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config/app.config';
import { AppError, ErrorCategory, ErrorSeverity, ConfigValidationResult } from '@shared/types';
import { storageService } from './storage.service';
import { createLoggerWithContext } from '../utils/logger';

const logger = createLoggerWithContext('ConfigService');
const execAsync = promisify(exec);

export class ConfigService {
  /**
   * Validate all configuration settings
   */
  async validateConfiguration(): Promise<ConfigValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    logger.info('Starting configuration validation');

    try {
      // Validate basic configuration
      await this.validateBasicConfig(errors, warnings);

      // Validate yt-dlp configuration
      await this.validateYtdlpConfig(errors, warnings);

      // Validate Python configuration
      await this.validatePythonConfig(errors, warnings);

      // Validate storage configuration
      await this.validateStorageConfig(errors, warnings);

      // Validate API configuration
      await this.validateApiConfig(errors, warnings);

      // Validate logging configuration
      await this.validateLoggingConfig(errors, warnings);

      const isValid = errors.length === 0;
      const result: ConfigValidationResult = {
        isValid,
        errors,
        warnings,
      };

      if (isValid) {
        logger.info('Configuration validation passed', { warnings: warnings.length });
      } else {
        logger.error('Configuration validation failed', { errors: errors.length, warnings: warnings.length });
      }

      return result;
    } catch (error) {
      logger.error('Configuration validation threw an error', error);
      return {
        isValid: false,
        errors: [`Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`],
        warnings,
      };
    }
  }

  /**
   * Validate basic configuration
   */
  private async validateBasicConfig(errors: string[], warnings: string[]): Promise<void> {
    // Validate environment
    if (!['development', 'production', 'test'].includes(config.environment)) {
      errors.push('Invalid NODE_ENV: must be development, production, or test');
    }

    // Validate app version format
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(config.appVersion)) {
      errors.push('Invalid app version format: must be x.y.z');
    }

    // Warn if running in development mode
    if (config.environment === 'development') {
      warnings.push('Running in development mode - not optimized for production');
    }
  }

  /**
   * Validate yt-dlp configuration
   */
  private async validateYtdlpConfig(errors: string[], warnings: string[]): Promise<void> {
    try {
      // Check if yt-dlp executable exists
      const { stdout } = await execAsync(`${config.ytdlp.executablePath} --version`);
      const version = stdout.trim();

      logger.info('yt-dlp found', { version });

      // Validate timeout
      if (config.ytdlp.timeout < 30 || config.ytdlp.timeout > 3600) {
        warnings.push('yt-dlp timeout should be between 30 seconds and 1 hour');
      }

      // Validate retry count
      if (config.ytdlp.retryCount < 0 || config.ytdlp.retryCount > 10) {
        errors.push('yt-dlp retry count should be between 0 and 10');
      }

      // Validate preferred languages
      if (config.ytdlp.preferredLanguages.length === 0) {
        warnings.push('No preferred languages configured - will download all available subtitles');
      }

      const validLanguages = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'it', 'ar', 'hi'];
      const invalidLanguages = config.ytdlp.preferredLanguages.filter(
        lang => !validLanguages.includes(lang)
      );

      if (invalidLanguages.length > 0) {
        warnings.push(`Unknown language codes: ${invalidLanguages.join(', ')}`);
      }
    } catch (error) {
      errors.push(`yt-dlp not found or not working: ${config.ytdlp.executablePath} - ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate Python configuration
   */
  private async validatePythonConfig(errors: string[], warnings: string[]): Promise<void> {
    try {
      // Check if Python executable exists
      const { stdout } = await execAsync(`${config.processing.pythonPath} --version`);
      const version = stdout.trim();

      logger.info('Python found', { version });

      // Validate Python version (should be 3.7+)
      const versionMatch = version.match(/Python (\d+)\.(\d+)/);
      if (versionMatch) {
        const majorVersion = parseInt(versionMatch[1], 10);
        const minorVersion = parseInt(versionMatch[2], 10);

        if (majorVersion < 3 || (majorVersion === 3 && minorVersion < 7)) {
          errors.push('Python version should be 3.7 or higher');
        }
      }

      // Check if cleaning script exists
      try {
        await execAsync(`test -f ${config.processing.cleaningScriptPath}`);
        logger.info('Python cleaning script found', { path: config.processing.cleaningScriptPath });
      } catch {
        warnings.push(`Python cleaning script not found: ${config.processing.cleaningScriptPath}`);
      }

      // Validate processing timeout (in milliseconds)
      if (config.processing.processingTimeout < 10000 || config.processing.processingTimeout > 600000) {
        warnings.push('Processing timeout should be between 10 seconds and 10 minutes');
      }

      // Validate max file size
      if (config.processing.maxFileSize < 1024 * 1024 || config.processing.maxFileSize > 1024 * 1024 * 1024) {
        warnings.push('Max file size should be between 1MB and 1GB');
      }
    } catch (error) {
      errors.push(`Python not found or not working: ${config.processing.pythonPath} - ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate storage configuration
   */
  private async validateStorageConfig(errors: string[], warnings: string[]): Promise<void> {
    try {
      // Test storage directory creation and access
      await storageService.initializeStorage();

      // Validate storage size limits
      if (config.storage.maxStorageSize < 100 * 1024 * 1024) {
        warnings.push('Max storage size is very small (< 100MB)');
      }

      if (config.storage.maxStorageSize > 100 * 1024 * 1024 * 1024) {
        warnings.push('Max storage size is very large (> 100GB)');
      }

      // Validate file count limits
      if (config.storage.maxFileCount < 100) {
        warnings.push('Max file count is very small (< 100)');
      }

      if (config.storage.maxFileCount > 1000000) {
        warnings.push('Max file count is very large (> 1M)');
      }

      // Validate cleanup interval
      if (config.storage.cleanupInterval < 1 || config.storage.cleanupInterval > 168) {
        warnings.push('Cleanup interval should be between 1 and 168 hours');
      }

      logger.info('Storage configuration validated');
    } catch (error) {
      errors.push(`Storage configuration error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate API configuration
   */
  private async validateApiConfig(errors: string[], warnings: string[]): Promise<void> {
    // Validate port
    if (config.api.port < 1024 || config.api.port > 65535) {
      errors.push('API port should be between 1024 and 65535');
    }

    // Validate host
    if (config.api.host !== 'localhost' && config.api.host !== '0.0.0.0') {
      warnings.push(`Unusual host configuration: ${config.api.host}`);
    }

    // Validate CORS origins
    if (config.api.corsEnabled && config.api.corsOrigins.length === 0) {
      warnings.push('CORS is enabled but no origins are specified');
    }

    // Validate body limit
    const bodyLimitMatch = config.api.bodyLimit.match(/^(\d+)(mb|gb|kb)?$/i);
    if (!bodyLimitMatch) {
      errors.push('Invalid body limit format - should be like "10mb", "1gb", etc.');
    }

    // Validate request timeout
    if (config.api.requestTimeout < 1000 || config.api.requestTimeout > 300000) {
      warnings.push('Request timeout should be between 1 second and 5 minutes');
    }

    // Validate rate limiting
    if (config.api.rateLimitEnabled) {
      if (config.api.rateLimitWindow < 1 || config.api.rateLimitWindow > 1440) {
        errors.push('Rate limit window should be between 1 and 1440 minutes');
      }

      if (config.api.rateLimitMax < 1 || config.api.rateLimitMax > 10000) {
        errors.push('Rate limit max should be between 1 and 10000 requests');
      }
    }
  }

  /**
   * Validate logging configuration
   */
  private async validateLoggingConfig(errors: string[], warnings: string[]): Promise<void> {
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(config.logging.level)) {
      errors.push(`Invalid log level: ${config.logging.level}. Must be one of: ${validLogLevels.join(', ')}`);
    }

    // Validate log file path if logging to file
    if (config.logging.logToFile) {
      const logDir = require('path').dirname(config.logging.logFilePath);
      try {
        await execAsync(`test -d "${logDir}" || mkdir -p "${logDir}"`);
      } catch (error) {
        errors.push(`Cannot create log directory: ${logDir}`);
      }
    }

    // Validate log file size
    if (config.logging.logToFile && config.logging.maxFileSize < 1024 * 1024) {
      warnings.push('Log file size is very small (< 1MB)');
    }

    if (config.logging.logToFile && config.logging.maxFileSize > 1024 * 1024 * 1024) {
      warnings.push('Log file size is very large (> 1GB)');
    }

    // Validate log file count
    if (config.logging.logToFile && (config.logging.maxFiles < 1 || config.logging.maxFiles > 100)) {
      warnings.push('Log file count should be between 1 and 100');
    }

    // Warn about debug logging in production
    if (config.environment === 'production' && config.logging.level === 'debug') {
      warnings.push('Debug logging enabled in production - may impact performance');
    }
  }

  /**
   * Check system readiness
   */
  async checkSystemReadiness(): Promise<{
    ready: boolean;
    checks: {
      ytdlp: boolean;
      python: boolean;
      storage: boolean;
      configuration: boolean;
    };
    errors: string[];
  }> {
    const checks = {
      ytdlp: false,
      python: false,
      storage: false,
      configuration: false,
    };

    const errors: string[] = [];

    logger.info('Checking system readiness');

    try {
      // Check yt-dlp
      try {
        await execAsync(`${config.ytdlp.executablePath} --version`);
        checks.ytdlp = true;
      } catch (error) {
        errors.push(`yt-dlp not available: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Check Python
      try {
        await execAsync(`${config.processing.pythonPath} --version`);
        checks.python = true;
      } catch (error) {
        errors.push(`Python not available: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Check storage
      try {
        await storageService.initializeStorage();
        checks.storage = true;
      } catch (error) {
        errors.push(`Storage not ready: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Check configuration
      try {
        const validation = await this.validateConfiguration();
        checks.configuration = validation.isValid;
        if (!validation.isValid) {
          errors.push(...validation.errors);
        }
      } catch (error) {
        errors.push(`Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      const ready = Object.values(checks).every(check => check);

      if (ready) {
        logger.info('System is ready for operation');
      } else {
        logger.error('System is not ready', { checks, errors: errors.length });
      }

      return { ready, checks, errors };
    } catch (error) {
      logger.error('System readiness check failed', error);
      return {
        ready: false,
        checks,
        errors: [`System readiness check failed: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  }

  /**
   * Get yt-dlp configuration
   */
  getYtdlpConfig() {
    return config.ytdlp;
  }

  /**
   * Get storage configuration
   */
  getStorageConfig() {
    return config.storage;
  }

  /**
   * Get API configuration
   */
  getApiConfig() {
    return config.api;
  }

  /**
   * Get processing configuration
   */
  getProcessingConfig() {
    return config.processing;
  }

  /**
   * Get storage base path
   */
  getStoragePath(): string {
    return config.storage.basePath;
  }

  /**
   * Get configuration summary
   */
  getConfigurationSummary(): Record<string, any> {
    return {
      app: {
        name: config.appName,
        version: config.appVersion,
        environment: config.environment,
      },
      ytdlp: {
        executable: config.ytdlp.executablePath,
        timeout: config.ytdlp.timeout,
        retryCount: config.ytdlp.retryCount,
        preferredLanguages: config.ytdlp.preferredLanguages,
      },
      storage: {
        basePath: config.storage.basePath,
        maxSize: config.storage.maxStorageSize,
        maxFiles: config.storage.maxFileCount,
        autoCleanup: config.storage.autoCleanup,
      },
      api: {
        port: config.api.port,
        host: config.api.host,
        corsEnabled: config.api.corsEnabled,
        rateLimitEnabled: config.api.rateLimitEnabled,
      },
      processing: {
        pythonPath: config.processing.pythonPath,
        scriptPath: config.processing.cleaningScriptPath,
        timeout: config.processing.processingTimeout,
      },
    };
  }
}

// Export singleton instance
export const configService = new ConfigService();