/**
 * System Controller
 * Handles system status and health check operations
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { SystemService } from '../services/system.service';
import { ApiResponse } from '../../shared/types/api.types';

export class SystemController {
  private systemService: SystemService;

  constructor() {
    this.systemService = new SystemService();
  }

  /**
   * Get system status and configuration information
   * GET /api/system/status
   */
  async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Getting system status');

      const systemStatus = await this.systemService.getSystemStatus();

      const response: ApiResponse<typeof systemStatus> = {
        success: true,
        data: systemStatus
      };

      logger.info('System status retrieved successfully', {
        ytDlpVersion: systemStatus.ytDlpVersion,
        totalFiles: systemStatus.totalFiles
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to get system status', error);

      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'SYSTEM_STATUS_ERROR',
          category: 'SYSTEM_ERROR',
          severity: 'MEDIUM',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date()
        }
      };

      res.status(500).json(response);
    }
  }

  /**
   * Detailed health check including external dependencies
   * GET /api/system/health
   */
  async getHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Performing health check');

      const healthCheck = await this.systemService.performHealthCheck();

      const response: ApiResponse<typeof healthCheck> = {
        success: healthCheck.healthy,
        data: healthCheck
      };

      if (healthCheck.healthy) {
        logger.info('Health check passed', {
          checks: healthCheck.checks.length,
          duration: healthCheck.duration
        });
        res.status(200).json(response);
      } else {
        logger.warn('Health check failed', {
          failedChecks: healthCheck.checks.filter(c => !c.passed).length
        });
        res.status(503).json(response);
      }
    } catch (error) {
      logger.error('Failed to perform health check', error);

      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          category: 'SYSTEM_ERROR',
          severity: 'HIGH',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date()
        }
      };

      res.status(503).json(response);
    }
  }
}