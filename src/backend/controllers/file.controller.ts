/**
 * File Controller
 * Handles file preview and download operations
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { FileService } from '../services/file.service';
import { ApiResponse } from '../../shared/types/api.types';

export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  /**
   * Preview file content
   * GET /api/files/preview/:fileId
   */
  async previewFile(req: Request, res: Response): Promise<void> {
    const { fileId } = req.params;

    try {
      logger.info('Previewing file', { fileId });

      const filePreview = await this.fileService.previewFile(fileId);

      const response: ApiResponse<typeof filePreview> = {
        success: true,
        data: filePreview
      };

      logger.info('File preview retrieved successfully', {
        fileId,
        filename: filePreview.filename,
        size: filePreview.size
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to preview file', { fileId, error });

      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'FILE_PREVIEW_ERROR',
          category: 'FILESYSTEM_ERROR',
          severity: 'MEDIUM',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date()
        }
      };

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json(response);
      } else {
        res.status(500).json(response);
      }
    }
  }

  /**
   * Download file
   * GET /api/files/download/:fileId
   */
  async downloadFile(req: Request, res: Response): Promise<void> {
    const { fileId } = req.params;

    try {
      logger.info('Downloading file', { fileId });

      const fileDownload = await this.fileService.downloadFile(fileId);

      logger.info('File download started', {
        fileId,
        filename: fileDownload.filename,
        contentType: fileDownload.contentType
      });

      // Set headers for file download
      res.setHeader('Content-Type', fileDownload.contentType);
      res.setHeader('Content-Length', fileDownload.contentLength);
      res.setHeader('Content-Disposition', `attachment; filename="${fileDownload.filename}"`);

      // Stream file content
      fileDownload.stream.pipe(res);

      fileDownload.stream.on('error', (error) => {
        logger.error('File stream error', { fileId, error });
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: {
              code: 'FILE_STREAM_ERROR',
              category: 'FILESYSTEM_ERROR',
              severity: 'HIGH',
              message: 'Error streaming file content',
              timestamp: new Date()
            }
          });
        }
      });

      fileDownload.stream.on('end', () => {
        logger.info('File download completed', { fileId });
      });
    } catch (error) {
      logger.error('Failed to download file', { fileId, error });

      if (!res.headersSent) {
        const response: ApiResponse<null> = {
          success: false,
          error: {
            code: 'FILE_DOWNLOAD_ERROR',
            category: 'FILESYSTEM_ERROR',
            severity: 'MEDIUM',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date()
          }
        };

        if (error instanceof Error && error.message.includes('not found')) {
          res.status(404).json(response);
        } else {
          res.status(500).json(response);
        }
      }
    }
  }
}