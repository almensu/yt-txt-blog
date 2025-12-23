import OpenAI from 'openai';

/**
 * Zhipu AI Configuration
 * Uses OpenAI SDK with Zhipu API endpoint
 */

// Get API key from environment
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

if (!ZHIPU_API_KEY) {
  console.warn('WARNING: ZHIPU_API_KEY not set in environment variables');
}

// Create OpenAI client configured for Zhipu AI
export const zhipuClient = new OpenAI({
  apiKey: ZHIPU_API_KEY,
  baseURL: ZHIPU_API_BASE,
});

// Default model configuration
export const DEFAULT_MODEL = process.env.ZHIPU_MODEL || 'glm-4';
export const DEFAULT_MAX_TOKENS = parseInt(process.env.ZHIPU_MAX_TOKENS || '4096', 10);
export const DEFAULT_TEMPERATURE = parseFloat(process.env.ZHIPU_TEMPERATURE || '0.7');
