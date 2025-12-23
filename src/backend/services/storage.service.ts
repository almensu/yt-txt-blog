/**
 * Storage management service
 * Handles file operations, directory management, and storage quotas
 */

import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config/app.config';
import { AppError, ErrorCategory, ErrorSeverity } from '@shared/types';
import { createLoggerWithContext } from '../utils/logger';

const logger = createLoggerWithContext('StorageService');

export class StorageService {
  private readonly basePath: string;
  private readonly downloadsPath: string;
  private readonly processedPath: string;
  private readonly tempPath: string;
  private readonly logsPath: string;

  constructor() {
    this.basePath = config.storage.basePath;
    this.downloadsPath = path.join(this.basePath, config.storage.downloadsDir);
    this.processedPath = path.join(this.basePath, config.storage.processedDir);
    this.tempPath = path.join(this.basePath, config.storage.tempDir);
    this.logsPath = path.join(this.basePath, config.storage.logsDir);
  }

  /**
   * Initialize storage directories
   */
  async initializeStorage(): Promise<void> {
    try {
      logger.info('Initializing storage directories');

      const directories = [
        this.basePath,
        this.downloadsPath,
        this.processedPath,
        this.tempPath,
        this.logsPath,
      ];

      for (const dir of directories) {
        await this.ensureDirectoryExists(dir);
      }

      logger.info('Storage directories initialized successfully', {
        basePath: this.basePath,
        directories: directories.length,
      });
    } catch (error) {
      logger.error('Failed to initialize storage directories', error);
      throw new AppError(
        'STORAGE_INITIALIZATION_FAILED',
        'Failed to initialize storage directories',
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.CRITICAL,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      logger.debug(`Created directory: ${dirPath}`);
    }
  }

  /**
   * Get video storage directory
   */
  getVideoDirectory(videoId: string): string {
    return path.join(this.downloadsPath, videoId);
  }

  /**
   * Get subtitle file path
   */
  getSubtitlePath(videoId: string, language: string): string {
    const videoDir = this.getVideoDirectory(videoId);
    const subtitleDir = path.join(videoDir, 'subtitles');
    return path.join(subtitleDir, `${language}.json3`);
  }

  /**
   * Get processed text file path
   */
  getProcessedTextPath(videoId: string, language: string): string {
    const processedVideoDir = path.join(this.processedPath, videoId);
    return path.join(processedVideoDir, `${language}.txt`);
  }

  /**
   * Get video metadata file path
   */
  getVideoMetadataPath(videoId: string): string {
    const videoDir = this.getVideoDirectory(videoId);
    return path.join(videoDir, 'info.json');
  }

  /**
   * Get processing metadata file path
   */
  getProcessingMetadataPath(videoId: string): string {
    const processedVideoDir = path.join(this.processedPath, videoId);
    return path.join(processedVideoDir, 'metadata.json');
  }

  /**
   * Get temporary file path
   */
  getTempPath(filename: string): string {
    return path.join(this.tempPath, filename);
  }

  /**
   * Write file to storage (alias for saveFile)
   */
  async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    return this.saveFile(filePath, content);
  }

  /**
   * Save file to storage
   */
  async saveFile(filePath: string, content: string | Buffer): Promise<void> {
    try {
      // Ensure parent directory exists
      const dir = path.dirname(filePath);
      await this.ensureDirectoryExists(dir);

      // Write file
      if (typeof content === 'string') {
        await fs.writeFile(filePath, content, 'utf8');
      } else {
        await fs.writeFile(filePath, content);
      }

      logger.debug(`File saved: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to save file: ${filePath}`, error);
      throw new AppError(
        'FILE_SAVE_FAILED',
        `Failed to save file: ${filePath}`,
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.HIGH,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Read file from storage
   */
  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      logger.debug(`File read: ${filePath}`);
      return content;
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error);
      throw new AppError(
        'FILE_READ_FAILED',
        `Failed to read file: ${filePath}`,
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.HIGH,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Read binary file from storage
   */
  async readBinaryFile(filePath: string): Promise<Buffer> {
    try {
      const content = await fs.readFile(filePath);
      logger.debug(`Binary file read: ${filePath}`);
      return content;
    } catch (error) {
      logger.error(`Failed to read binary file: ${filePath}`, error);
      throw new AppError(
        'FILE_READ_FAILED',
        `Failed to read binary file: ${filePath}`,
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.HIGH,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure directory exists (public method)
   */
  async ensureDirectory(dirPath: string): Promise<void> {
    return this.ensureDirectoryExists(dirPath);
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<{ size: number; modified: Date; created: Date }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
      };
    } catch (error) {
      logger.error(`Failed to get file stats: ${filePath}`, error);
      throw new AppError(
        'FILE_STATS_FAILED',
        `Failed to get file stats: ${filePath}`,
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.MEDIUM,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.debug(`File deleted: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to delete file: ${filePath}`, error);
      throw new AppError(
        'FILE_DELETE_FAILED',
        `Failed to delete file: ${filePath}`,
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.MEDIUM,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Delete directory recursively
   */
  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rmdir(dirPath, { recursive: true });
      logger.debug(`Directory deleted: ${dirPath}`);
    } catch (error) {
      // Don't throw error if directory doesn't exist
      if ((error as any).code !== 'ENOENT') {
        logger.error(`Failed to delete directory: ${dirPath}`, error);
        throw new AppError(
          'DIRECTORY_DELETE_FAILED',
          `Failed to delete directory: ${dirPath}`,
          ErrorCategory.FILESYSTEM_ERROR,
          ErrorSeverity.MEDIUM,
          error instanceof Error ? error.stack : String(error)
        );
      }
    }
  }

  /**
   * List files in directory
   */
  async listFiles(dirPath: string, extension?: string): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath);
      let filteredFiles = files;

      if (extension) {
        filteredFiles = files.filter(file => file.endsWith(extension));
      }

      return filteredFiles.map(file => path.join(dirPath, file));
    } catch (error) {
      logger.error(`Failed to list files in directory: ${dirPath}`, error);
      throw new AppError(
        'DIRECTORY_LIST_FAILED',
        `Failed to list files in directory: ${dirPath}`,
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.MEDIUM,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    totalFiles: number;
    downloadsSize: number;
    processedSize: number;
    tempSize: number;
  }> {
    try {
      const calculateDirectorySize = async (dirPath: string): Promise<{ size: number; files: number }> => {
        let totalSize = 0;
        let fileCount = 0;

        const traverse = async (currentPath: string): Promise<void> => {
          try {
            const items = await fs.readdir(currentPath);

            for (const item of items) {
              const itemPath = path.join(currentPath, item);
              const stats = await fs.stat(itemPath);

              if (stats.isDirectory()) {
                await traverse(itemPath);
              } else {
                totalSize += stats.size;
                fileCount++;
              }
            }
          } catch {
            // Skip directories that can't be accessed
          }
        };

        await traverse(dirPath);
        return { size: totalSize, files: fileCount };
      };

      const [downloads, processed, temp] = await Promise.all([
        calculateDirectorySize(this.downloadsPath),
        calculateDirectorySize(this.processedPath),
        calculateDirectorySize(this.tempPath),
      ]);

      const totalSize = downloads.size + processed.size + temp.size;
      const totalFiles = downloads.files + processed.files + temp.files;

      return {
        totalSize,
        totalFiles,
        downloadsSize: downloads.size,
        processedSize: processed.size,
        tempSize: temp.size,
      };
    } catch (error) {
      logger.error('Failed to get storage statistics', error);
      throw new AppError(
        'STORAGE_STATS_FAILED',
        'Failed to get storage statistics',
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.MEDIUM,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Clean up old files
   */
  async cleanup(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> { // Default 24 hours
    try {
      logger.info('Starting storage cleanup', { maxAge });

      const now = Date.now();
      const cleanDirectory = async (dirPath: string): Promise<void> => {
        try {
          const items = await fs.readdir(dirPath);

          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = await fs.stat(itemPath);

            if (stats.isDirectory()) {
              await cleanDirectory(itemPath);

              // Remove empty directories
              try {
                const remainingItems = await fs.readdir(itemPath);
                if (remainingItems.length === 0) {
                  await fs.rmdir(itemPath);
                  logger.debug(`Removed empty directory: ${itemPath}`);
                }
              } catch {
                // Directory might have been removed already
              }
            } else if (now - stats.mtime.getTime() > maxAge) {
              await fs.unlink(itemPath);
              logger.debug(`Removed old file: ${itemPath}`);
            }
          }
        } catch {
          // Skip directories that can't be accessed
        }
      };

      // Only clean temp directory by default
      await cleanDirectory(this.tempPath);

      logger.info('Storage cleanup completed');
    } catch (error) {
      logger.error('Storage cleanup failed', error);
      throw new AppError(
        'STORAGE_CLEANUP_FAILED',
        'Storage cleanup failed',
        ErrorCategory.FILESYSTEM_ERROR,
        ErrorSeverity.LOW,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }

  /**
   * Check if storage quota is exceeded
   */
  async checkStorageQuota(): Promise<boolean> {
    try {
      const stats = await this.getStorageStats();

      const sizeExceeded = stats.totalSize > config.storage.maxStorageSize;
      const filesExceeded = stats.totalFiles > config.storage.maxFileCount;

      if (sizeExceeded) {
        logger.warn('Storage size quota exceeded', {
          current: stats.totalSize,
          max: config.storage.maxStorageSize,
        });
      }

      if (filesExceeded) {
        logger.warn('Storage file count quota exceeded', {
          current: stats.totalFiles,
          max: config.storage.maxFileCount,
        });
      }

      return sizeExceeded || filesExceeded;
    } catch (error) {
      logger.error('Failed to check storage quota', error);
      return true; // Assume quota exceeded on error
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();