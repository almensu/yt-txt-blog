/**
 * Backend application entry point
 * YouTube to Pure Text Generator - API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/app.config';
import { logger } from './utils/logger';
import { storageService } from './services/storage.service';
import { configService } from './services/config.service';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import videoRoutes from './routes/video.routes';
import subtitleRoutes from './routes/subtitle.routes';
import fileRoutes from './routes/file.routes';
import systemRoutes from './routes/system.routes';

class Application {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.api.port;
  }

  /**
   * Initialize application
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing YouTube to Pure Text Generator...');

      // Validate configuration
      logger.info('🔧 Validating configuration...');
      const configValidation = await configService.validateConfiguration();
      if (!configValidation.isValid) {
        throw new Error(`Configuration validation failed: ${configValidation.errors.join(', ')}`);
      }
      logger.info('✅ Configuration validation passed');

      // Check system readiness
      logger.info('🏥 Checking system readiness...');
      const readiness = await configService.checkSystemReadiness();
      if (!readiness.ready) {
        logger.error('❌ System readiness check failed', { errors: readiness.errors });
        throw new Error(`System not ready: ${readiness.errors.join(', ')}`);
      }
      logger.info('✅ System readiness check passed');

      // Initialize storage
      logger.info('💾 Initializing storage...');
      await storageService.initializeStorage();
      logger.info('✅ Storage initialized');

      // Initialize middleware
      this.initializeMiddlewares();

      // Initialize routes
      this.initializeRoutes();

      // Initialize error handling
      this.initializeErrorHandling();

      logger.info('🎉 Application initialization completed');
    } catch (error) {
      logger.error('❌ Application initialization failed', error);
      throw error;
    }
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    if (config.api.corsEnabled) {
      this.app.use(cors({
        origin: config.api.corsOrigins,
        credentials: true
      }));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: config.api.bodyLimit }));
    this.app.use(express.urlencoded({ extended: true, limit: config.api.bodyLimit }));

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    if (config.api.rateLimitEnabled) {
      const limiter = rateLimit({
        windowMs: config.api.rateLimitWindow * 60 * 1000, // Convert minutes to milliseconds
        max: config.api.rateLimitMax,
        message: {
          error: 'Too many requests from this IP, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
      this.app.use(limiter);
    }

    // Request logging
    this.app.use(requestLogger);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: config.appVersion,
          environment: config.environment
        }
      });
    });

    // API routes
    this.app.use('/api/video', videoRoutes);
    this.app.use('/api/subtitles', subtitleRoutes);
    this.app.use('/api/files', fileRoutes);
    this.app.use('/api/system', systemRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.originalUrl} not found`,
          timestamp: new Date()
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async listen(): Promise<void> {
    // Initialize application first
    await this.initialize();

    return new Promise((resolve, reject) => {
      const server = this.app.listen(this.port, () => {
        logger.info(`🚀 Server is running on port ${this.port}`);
        logger.info(`📝 Environment: ${config.environment}`);
        logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
        logger.info(`🌐 API Base: http://localhost:${this.port}/api`);
        resolve();
      });

      server.on('error', (error) => {
        logger.error('Failed to start server', error);
        reject(error);
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Create and start the application
const application = new Application();

// Only start server if this file is run directly
if (require.main === module) {
  application.listen().catch((error) => {
    logger.error('Failed to start application', error);
    process.exit(1);
  });
}

export default application.getApp();