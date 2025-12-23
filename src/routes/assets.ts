/**
 * Assets Routes
 * API endpoints for TXT asset management
 */

import { Router } from 'express';
import { assetService } from '../services/assetService.js';
import type { CreateAssetRequest, UpdateAssetRequest } from '../types/index.js';

const router = Router();

/**
 * GET /api/assets
 * Get all assets
 */
router.get('/', async (_req, res) => {
  try {
    const assets = await assetService.getAll();
    res.json(assets);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get assets',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/assets/:id
 * Get asset by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const asset = await assetService.getById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Asset not found: ${req.params.id}`,
      });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get asset',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/assets
 * Create new asset
 */
router.post('/', async (req, res) => {
  try {
    const data: CreateAssetRequest = req.body;
    const asset = await assetService.create(data);
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({
      error: 'Failed to create asset',
      message: (error as Error).message,
    });
  }
});

/**
 * PUT /api/assets/:id
 * Update existing asset
 */
router.put('/:id', async (req, res) => {
  try {
    const data: UpdateAssetRequest = req.body;
    const asset = await assetService.update(req.params.id, data);
    if (!asset) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Asset not found: ${req.params.id}`,
      });
    }
    res.json(asset);
  } catch (error) {
    res.status(400).json({
      error: 'Failed to update asset',
      message: (error as Error).message,
    });
  }
});

/**
 * DELETE /api/assets/:id
 * Delete asset
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await assetService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Asset not found: ${req.params.id}`,
      });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete asset',
      message: (error as Error).message,
    });
  }
});

export default router;
