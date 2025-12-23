/**
 * Articles Routes
 * API endpoints for generated article management
 */

import { Router } from 'express';
import { articleStorage } from '../storage/articleStorage.js';

const router = Router();

/**
 * GET /api/articles
 * Get all generated articles
 */
router.get('/', async (_req, res) => {
  try {
    const articles = await articleStorage.getAll();
    res.json(articles);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get articles',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/articles/:id
 * Get article by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const article = await articleStorage.getById(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Article not found: ${req.params.id}`,
      });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get article',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/articles/asset/:assetId
 * Get articles by asset ID
 */
router.get('/asset/:assetId', async (req, res) => {
  try {
    const articles = await articleStorage.getByAssetId(req.params.assetId);
    res.json(articles);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get articles by asset',
      message: (error as Error).message,
    });
  }
});

/**
 * DELETE /api/articles/:id
 * Delete article
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await articleStorage.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Article not found: ${req.params.id}`,
      });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete article',
      message: (error as Error).message,
    });
  }
});

export default router;
