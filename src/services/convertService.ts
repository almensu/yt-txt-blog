/**
 * Convert Service
 * Business logic layer for converting TXT assets to styled articles
 * Uses OpenAI SDK for multiple AI providers: Zhipu AI, Gemini, and OpenAI
 * Supports thinking mode for Zhipu GLM-4.7
 */

import type OpenAI from 'openai';
import { aiClientManager, DEFAULT_MAX_TOKENS } from '../config/ai.js';
import type { AIProvider } from '../config/ai.js';
import { assetStorage } from '../storage/assetStorage.js';
import { articleStorage } from '../storage/articleStorage.js';
import { styleService } from './styleService.js';
import type { ConvertRequest, GeneratedArticle } from '../types/index.js';

/**
 * ConvertService - handles TXT asset to styled article conversion
 */
export class ConvertService {
  private initialized = false;

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await assetStorage.initialize();
      await articleStorage.initialize();
      await styleService.initialize();
      this.initialized = true;
    }
  }

  /**
   * Convert asset to styled article
   */
  async convert(request: ConvertRequest): Promise<GeneratedArticle> {
    await this.ensureInitialized();

    // Validate input
    if (!request.asset_id?.trim()) {
      throw new Error('Asset ID is required');
    }
    if (!request.style_id?.trim()) {
      throw new Error('Style ID is required');
    }

    // Get asset
    const asset = await assetStorage.getById(request.asset_id);
    if (!asset) {
      throw new Error(`Asset not found: ${request.asset_id}`);
    }

    // Get style
    const style = await styleService.getById(request.style_id);
    if (!style) {
      throw new Error(`Style not found: ${request.style_id}`);
    }

    // Build prompt from template
    const prompt = style.prompt_template.replace('{content}', asset.content);

    // Determine provider
    const provider = this.determineProvider(request);

    // Build messages array (supports multi-turn conversation)
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    // Create chat completion using aiClientManager
    const response = await aiClientManager.createChatCompletion(
      provider,
      messages,
      {
        model: request.model,
        max_tokens: DEFAULT_MAX_TOKENS,
        temperature: request.temperature ?? 0.7,
        thinking_enabled: request.thinking_enabled,
      }
    );

    const generatedContent = response.choices[0]?.message?.content || '';
    if (!generatedContent) {
      throw new Error('Failed to generate article content');
    }

    // Create article record with provider info
    const article = await articleStorage.create({
      asset_id: asset.id,
      asset_title: asset.title,
      style_id: style.id,
      style_name: style.name,
      content: generatedContent,
      provider,
      model: response.model,
      prompt_tokens: response.usage?.prompt_tokens,
      completion_tokens: response.usage?.completion_tokens,
    });

    return article;
  }

  /**
   * Determine which provider to use
   */
  private determineProvider(request: ConvertRequest): AIProvider {
    // If provider is specified in request, use it
    if (request.provider) {
      return request.provider as AIProvider;
    }

    // Auto-determine: prefer Zhipu, then Gemini, then OpenAI
    const available = aiClientManager.getAvailableProviders();
    if (available.includes('zhipu')) {
      return 'zhipu';
    } else if (available.includes('gemini')) {
      return 'gemini';
    } else if (available.includes('openai')) {
      return 'openai';
    }

    throw new Error('No AI provider available. Please set ZHIPU_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY environment variable.');
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Export singleton instance
export const convertService = new ConvertService();
