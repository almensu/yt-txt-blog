/**
 * System Service
 * Handles system status and health check operations
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import { configService } from './config.service';
import { PythonService } from './python.service';

const execAsync = promisify(exec);

export interface SystemStatus {
  ytDlpVersion: string;
  pythonVersion: string;
  pythonScriptVersion?: string;
  nodeVersion: string;
  storagePath: string;
  totalFiles: number;
  totalSize: number;
  uptime: number;
}

export interface HealthCheckResult {
  healthy: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    message?: string;
    duration: number;
  }>;
  duration: number;
}

export class SystemService {
  private pythonService: PythonService;

  constructor() {
    this.pythonService = new PythonService();
  }

  /**
   * Get system status information
   * @returns Promise<SystemStatus> - System status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    logger.info('Getting system status');

    try {
      // Get yt-dlp version
      let ytDlpVersion = 'Not installed';
      try {
        const { stdout } = await execAsync('yt-dlp --version');
        ytDlpVersion = stdout.trim();
      } catch (error) {
        logger.warn('yt-dlp not available', { error });
      }

      // Get Python version
      let pythonVersion = 'Not installed';
      try {
        const { stdout } = await execAsync('python3 --version');
        pythonVersion = stdout.trim();
      } catch (error) {
        logger.warn('Python3 not available', { error });
      }

      // Get Python script status
      let pythonScriptVersion: string | undefined;
      try {
        if (await this.pythonService.isAvailable()) {
          pythonScriptVersion = 'Available';
        }
      } catch (error) {
        logger.warn('Python script not available', { error });
      }

      // Get Node.js version
      const nodeVersion = process.version;

      // Get storage path
      const storagePath = configService.getStoragePath();

      // TODO: Implement actual file counting and size calculation
      const totalFiles = 0;
      const totalSize = 0;

      // Get uptime
      const uptime = process.uptime();

      const systemStatus: SystemStatus = {
        ytDlpVersion,
        pythonVersion,
        pythonScriptVersion,
        nodeVersion,
        storagePath,
        totalFiles,
        totalSize,
        uptime
      };

      logger.info('System status retrieved', {
        ytDlpVersion,
        pythonVersion,
        pythonScriptVersion,
        nodeVersion,
        totalFiles
      });

      return systemStatus;
    } catch (error) {
      logger.error('Failed to get system status', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive health check
   * @returns Promise<HealthCheckResult> - Health check results
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    logger.info('Performing health check');
    const startTime = Date.now();

    const checks: Array<{
      name: string;
      passed: boolean;
      message?: string;
      duration: number;
    }> = [];

    // Check yt-dlp availability
    const ytDlpStart = Date.now();
    try {
      await execAsync('yt-dlp --version');
      checks.push({
        name: 'yt-dlp',
        passed: true,
        duration: Date.now() - ytDlpStart
      });
    } catch (error) {
      checks.push({
        name: 'yt-dlp',
        passed: false,
        message: 'yt-dlp not available',
        duration: Date.now() - ytDlpStart
      });
    }

    // Check Python availability
    const pythonStart = Date.now();
    try {
      await execAsync('python3 --version');
      checks.push({
        name: 'python3',
        passed: true,
        duration: Date.now() - pythonStart
      });
    } catch (error) {
      checks.push({
        name: 'python3',
        passed: false,
        message: 'Python3 not available',
        duration: Date.now() - pythonStart
      });
    }

    // Check Python script availability
    const pythonScriptStart = Date.now();
    try {
      const scriptAvailable = await this.pythonService.isAvailable();
      checks.push({
        name: 'python-script',
        passed: scriptAvailable,
        message: scriptAvailable ? 'Python cleaning script available' : 'Python cleaning script not available',
        duration: Date.now() - pythonScriptStart
      });
    } catch (error) {
      checks.push({
        name: 'python-script',
        passed: false,
        message: 'Python script check failed',
        duration: Date.now() - pythonScriptStart
      });
    }

    // Check storage directory
    const storageStart = Date.now();
    try {
      const storagePath = configService.getStoragePath();
      // TODO: Check if storage directory is writable
      checks.push({
        name: 'storage',
        passed: true,
        duration: Date.now() - storageStart
      });
    } catch (error) {
      checks.push({
        name: 'storage',
        passed: false,
        message: 'Storage directory not accessible',
        duration: Date.now() - storageStart
      });
    }

    // Check memory usage
    const memoryStart = Date.now();
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    checks.push({
      name: 'memory',
      passed: memUsageMB < 512, // Less than 512MB
      message: `Memory usage: ${memUsageMB.toFixed(2)}MB`,
      duration: Date.now() - memoryStart
    });

    const allPassed = checks.every(check => check.passed);
    const duration = Date.now() - startTime;

    const healthCheckResult: HealthCheckResult = {
      healthy: allPassed,
      checks,
      duration
    };

    logger.info('Health check completed', {
      healthy: allPassed,
      checksCount: checks.length,
      passedCount: checks.filter(c => c.passed).length,
      duration
    });

    return healthCheckResult;
  }
}