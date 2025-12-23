/**
 * Video Controller
 * Handles YouTube video information retrieval
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { VideoService } from '../services/video.service';
import { ApiResponse } from '../../shared/types/api.types';

export class VideoController {
  private videoService: VideoService;

  constructor() {
    this.videoService = new VideoService();
  }

  /**
   * Get YouTube video information
   * GET /api/video/info?url={videoUrl}
   */
  async getVideoInfo(req: Request, res: Response): Promise<void> {
    const { url } = req.query;

    try {
      logger.info('Getting video information', { url });

      if (!url || typeof url !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          error: {
            code: 'INVALID_URL',
            category: 'VALIDATION_ERROR',
            severity: 'MEDIUM',
            message: 'URL parameter is required and must be a string',
            timestamp: new Date()
          }
        };
        res.status(400).json(response);
        return;
      }

      const videoInfo = await this.videoService.getVideoInfo(url);

      const response: ApiResponse<typeof videoInfo> = {
        success: true,
        data: videoInfo
      };

      logger.info('Video information retrieved successfully', {
        videoId: videoInfo.id,
        title: videoInfo.title
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to get video information', error);

      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'VIDEO_INFO_ERROR',
          category: 'EXTERNAL_TOOL_ERROR',
          severity: 'HIGH',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date()
        }
      };

      res.status(500).json(response);
    }
  }
}