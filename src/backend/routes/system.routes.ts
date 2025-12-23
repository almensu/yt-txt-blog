/**
 * System Routes
 * System status and health check endpoints
 */

import { Router } from 'express';
import { SystemController } from '../controllers/system.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const systemController = new SystemController();

/**
 * GET /api/system/status
 * Get system status and configuration information
 */
router.get('/status',
  asyncHandler(systemController.getSystemStatus.bind(systemController))
);

/**
 * GET /api/system/health
 * Detailed health check including external dependencies
 */
router.get('/health',
  asyncHandler(systemController.getHealthCheck.bind(systemController))
);

export default router;