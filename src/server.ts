/**
 * Express Server Entry Point
 * Main server configuration and startup
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { assetService } from './services/assetService.js';
import { styleService } from './services/styleService.js';
import { articleStorage } from './storage/articleStorage.js';
import assetsRouter from './routes/assets.js';
import stylesRouter from './routes/styles.js';
import convertRouter from './routes/convert.js';
import articlesRouter from './routes/articles.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: process.env.API_BODY_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/assets', assetsRouter);
app.use('/api/styles', stylesRouter);
app.use('/api/convert', convertRouter);
app.use('/api/articles', articlesRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested resource was not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

/**
 * Initialize and start server
 */
async function startServer() {
  try {
    // Initialize services
    await assetService.initialize();
    await styleService.initialize();
    await articleStorage.initialize();

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`Health check: http://${HOST}:${PORT}/health`);
      console.log(`API base: http://${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer };
