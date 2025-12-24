/**
 * Gemini AI Configuration
 * Uses Google's Generative AI SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY not set in environment variables');
}

// Create Google Generative AI client
export const geminiClient = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

// Default model configuration
// Gemini 1.5 models are deprecated as of 2025
// Use gemini-2.0-flash, gemini-2.5-flash, or gemini-3-pro
export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
export const DEFAULT_MAX_TOKENS = parseInt(process.env.GEMINI_MAX_TOKENS || '4096', 10);
export const DEFAULT_TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');

/**
 * Get Gemini model instance
 */
export function getGeminiModel(model: string = DEFAULT_MODEL) {
  if (!geminiClient) {
    throw new Error('Gemini client not initialized. Please set GEMINI_API_KEY environment variable.');
  }
  return geminiClient.getGenerativeModel({ model });
}
