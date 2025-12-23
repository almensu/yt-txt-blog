/**
 * Styles Routes
 * API endpoints for writing style management
 */

import { Router } from 'express';
import { styleService } from '../services/styleService.js';

const router = Router();

/**
 * GET /api/styles
 * Get all available writing styles
 */
router.get('/', async (_req, res) => {
  try {
    const styles = await styleService.getAll();
    res.json(styles);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get styles',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/styles/:id
 * Get style by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const style = await styleService.getById(req.params.id);
    if (!style) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Style not found: ${req.params.id}`,
      });
    }
    res.json(style);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get style',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/styles/reload
 * Reload styles from disk
 */
router.post('/reload', async (_req, res) => {
  try {
    await styleService.reload();
    const styles = await styleService.getAll();
    res.json({
      message: 'Styles reloaded successfully',
      styles,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to reload styles',
      message: (error as Error).message,
    });
  }
});

export default router;
