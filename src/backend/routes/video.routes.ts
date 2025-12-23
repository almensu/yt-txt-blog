/**
 * Video Routes
 * YouTube video information retrieval endpoints
 */

import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { validateVideoInfoRequest } from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const videoController = new VideoController();

/**
 * GET /api/video/info
 * Get YouTube video information including available subtitles
 */
router.get('/info',
  validateVideoInfoRequest,
  asyncHandler(videoController.getVideoInfo.bind(videoController))
);

export default router;