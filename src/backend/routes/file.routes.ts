/**
 * File Routes
 * File preview and management endpoints
 */

import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { validateFileId } from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const fileController = new FileController();

/**
 * GET /api/files/preview/:fileId
 * Preview file content
 */
router.get('/preview/:fileId',
  validateFileId,
  asyncHandler(fileController.previewFile.bind(fileController))
);

/**
 * GET /api/files/download/:fileId
 * Download file
 */
router.get('/download/:fileId',
  validateFileId,
  asyncHandler(fileController.downloadFile.bind(fileController))
);

export default router;