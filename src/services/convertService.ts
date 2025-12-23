/**
 * Convert Service
 * Business logic layer for converting TXT assets to styled articles using Zhipu AI
 */

import { zhipuClient, DEFAULT_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../config/zhipu.js';
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

    // Call Zhipu AI
    const response = await zhipuClient.chat.completions.create({
      model: request.model || DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature: DEFAULT_TEMPERATURE,
    });

    const generatedContent = response.choices[0]?.message?.content || '';
    if (!generatedContent) {
      throw new Error('Failed to generate article content');
    }

    // Create article record
    const article = await articleStorage.create({
      asset_id: asset.id,
      asset_title: asset.title,
      style_id: style.id,
      style_name: style.name,
      content: generatedContent,
      model: request.model || DEFAULT_MODEL,
      prompt_tokens: response.usage?.prompt_tokens,
      completion_tokens: response.usage?.completion_tokens,
    });

    return article;
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
