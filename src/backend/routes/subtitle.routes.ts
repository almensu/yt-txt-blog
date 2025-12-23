/**
 * Subtitle Routes
 * Subtitle download and processing endpoints
 */

import { Router } from 'express';
import { SubtitleController } from '../controllers/subtitle.controller';
import {
  validateDownloadRequest,
  validateProcessingRequest
} from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const subtitleController = new SubtitleController();

/**
 * POST /api/subtitles/download
 * Download subtitles for a YouTube video
 */
router.post('/download',
  validateDownloadRequest,
  asyncHandler(subtitleController.downloadSubtitles.bind(subtitleController))
);

/**
 * POST /api/subtitles/process
 * Process downloaded subtitles into clean text
 */
router.post('/process',
  validateProcessingRequest,
  asyncHandler(subtitleController.processSubtitles.bind(subtitleController))
);

export default router;