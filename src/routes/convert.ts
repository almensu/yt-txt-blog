/**
 * Convert Routes
 * API endpoints for TXT asset to styled article conversion
 */

import { Router } from 'express';
import { convertService } from '../services/convertService.js';
import type { ConvertRequest } from '../types/index.js';

const router = Router();

/**
 * POST /api/convert
 * Convert TXT asset to styled article
 */
router.post('/', async (req, res) => {
  try {
    const data: ConvertRequest = req.body;
    const article = await convertService.convert(data);
    res.status(201).json(article);
  } catch (error) {
    const errorMessage = (error as Error).message;
    const statusCode = errorMessage.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      error: 'Conversion failed',
      message: errorMessage,
    });
  }
});

export default router;
