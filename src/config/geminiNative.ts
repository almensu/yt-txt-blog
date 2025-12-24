/**
 * Gemini API Client
 * For Google Gemini models: gemini-2.0-flash, gemini-2.5-pro, etc.
 *
 * NOTE: Uses Google's native SDK (@google/generative-ai)
 * For OpenAI-compatible access, use src/config/ai.ts instead
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Gemini message format
 */
export interface GeminiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Gemini request options
 */
export interface GeminiRequestOptions {
  temperature?: number;
  maxOutputTokens?: number;
  thinkingBudget?: number;  // For Gemini 2.5 Pro thinking mode
}

/**
 * Gemini API Client
 */
export class GeminiClient {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('WARNING: GEMINI_API_KEY not set');
    } else {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Get model instance
   */
  private getModel(model: string) {
    if (!this.client) {
      throw new Error('Gemini client not initialized. Please set GEMINI_API_KEY environment variable.');
    }
    return this.client.getGenerativeModel({ model });
  }

  /**
   * Generate content with messages
   */
  async generateContent(
    model: string,
    messages: GeminiMessage[],
    options: GeminiRequestOptions = {}
  ): Promise<string> {
    const geminiModel = this.getModel(model);

    // Convert messages to Gemini format
    const content = this.formatMessages(messages);

    // Build generation config
    const defaultOptions = {
      temperature: 0.7,
      maxOutputTokens: 6144,
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
    };

    // Add thinking config for Gemini 2.5 Pro
    const generationConfig: any = {
      temperature: requestOptions.temperature,
      maxOutputTokens: requestOptions.maxOutputTokens,
    };

    if (options.thinkingBudget !== undefined && model.includes('2.5') && model.includes('pro')) {
      generationConfig.thinkingConfig = { thinkingBudget: options.thinkingBudget };
    } else {
      // Disable thinking for other models
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    try {
      const result = await geminiModel.generateContent(content, generationConfig);
      return result.response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error('Gemini API error');
    }
  }

  /**
   * Generate content with retry (for 503 overloaded errors)
   */
  async generateContentWithRetry(
    model: string,
    messages: GeminiMessage[],
    options: GeminiRequestOptions = {},
    maxRetries: number = 3
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.generateContent(model, messages, options);
      } catch (error) {
        const errorStr = error instanceof Error ? error.message : String(error);
        const isLastAttempt = attempt === maxRetries - 1;

        // Check for overload/503 errors
        if (
          errorStr.includes('503') ||
          errorStr.toLowerCase().includes('overloaded') ||
          errorStr.includes('UNAVAILABLE') ||
          errorStr.toLowerCase().includes('quota')
        ) {
          if (isLastAttempt) {
            throw new Error(
              `Gemini service overloaded after ${maxRetries} attempts. ` +
              `Suggestions: 1) Try again later 2) Reduce document length 3) Switch to another model`
            );
          }

          // Exponential backoff: 2, 4, 8 seconds
          const waitTime = (2 ** attempt) * 2000;
          console.warn(`Gemini overloaded, waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
          await this.delay(waitTime);
          continue;
        }

        // Other errors - throw immediately
        throw error;
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Format messages for Gemini API
   * Gemini expects a single content string or parts array
   */
  private formatMessages(messages: GeminiMessage[]): string {
    const parts: string[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        parts.push(`System: ${msg.content}`);
      } else if (msg.role === 'user') {
        parts.push(`User: ${msg.content}`);
      } else if (msg.role === 'assistant') {
        parts.push(`Assistant: ${msg.content}`);
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Check content length and chunk if needed
   */
  async generateContentWithChunking(
    model: string,
    messages: GeminiMessage[],
    options: GeminiRequestOptions = {},
    maxChunkSize: number = 100000
  ): Promise<string> {
    const combinedContent = this.formatMessages(messages);

    if (combinedContent.length <= maxChunkSize) {
      return this.generateContentWithRetry(model, messages, options);
    }

    // Content too long - extract and summarize document
    console.warn(`Content too long (${combinedContent.length} chars), attempting document chunking`);

    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    if (systemMessages.length === 0) {
      // No system message, try direct
      return this.generateContentWithRetry(model, messages, options);
    }

    // Extract document from system message
    const systemContent = systemMessages[0]?.content;
    if (!systemContent) {
      return this.generateContentWithRetry(model, messages, options);
    }

    const docStart = systemContent.indexOf('--- 文档开始 ---');
    const docEnd = systemContent.indexOf('--- 文档结束 ---');

    if (docStart === -1 || docEnd === -1) {
      // No document markers, use as-is
      return this.generateContentWithRetry(model, messages, options);
    }

    const systemPromptPrefix = systemContent.slice(0, docStart);
    const documentContent = systemContent.slice(docStart + 12, docEnd);
    const systemPromptSuffix = systemContent.slice(docEnd + 13);

    // Create summary if document is too long
    if (documentContent.length > maxChunkSize * 0.7) {
      console.info('Document too long, creating summary...');

      const summaryPrompt = `请为以下文档创建一个详细摘要，保留关键信息和结构：

${documentContent.slice(0, maxChunkSize / 2)}

摘要要求：
1. 保留文档的主要内容和结构
2. 包含重要的细节和数据
3. 使用中文
4. 长度控制在原文档的1/3左右`;

      try {
        const summaryResponse = await this.generateContentWithRetry(
          model,
          [{ role: 'user', content: summaryPrompt }],
          { ...options, thinkingBudget: 0 }
        );
        const documentSummary = summaryResponse;
        console.info(`Created document summary (length: ${documentSummary.length})`);

        const modifiedSystemContent = `${systemPromptPrefix}
--- 文档开始 ---
${documentSummary}
--- 文档结束 ---
${systemPromptSuffix}`;

        const finalMessages: GeminiMessage[] = [{ role: 'system', content: modifiedSystemContent }, ...conversationMessages];
        return this.generateContentWithRetry(model, finalMessages, options);
      } catch (summaryError) {
        console.warn('Failed to create summary, using truncated document');
        const documentSummary = documentContent.slice(0, maxChunkSize / 2) + '\n\n[文档已截断...]';

        const modifiedSystemContent = `${systemPromptPrefix}
--- 文档开始 ---
${documentSummary}
--- 文档结束 ---
${systemPromptSuffix}`;

        const finalMessages: GeminiMessage[] = [{ role: 'system', content: modifiedSystemContent }, ...conversationMessages];
        return this.generateContentWithRetry(model, finalMessages, options);
      }
    }

    // Document fits, use as-is
    return this.generateContentWithRetry(model, messages, options);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const geminiNativeClient = new GeminiClient();

/**
 * Convenience function for content generation
 */
export async function geminiGenerate(
  model: string,
  messages: GeminiMessage[],
  options?: GeminiRequestOptions
): Promise<string> {
  return geminiNativeClient.generateContentWithRetry(model, messages, options);
}

/**
 * Available Gemini models
 */
export const GEMINI_MODELS = {
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash Experimental',
    supportsThinking: false,
  },
  'gemini-2.5-flash-exp': {
    name: 'Gemini 2.5 Flash Experimental',
    supportsThinking: false,
  },
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    supportsThinking: true,
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    supportsThinking: false,
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    supportsThinking: false,
  },
};
