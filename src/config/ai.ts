/**
 * Unified AI Client Configuration
 * Uses OpenAI SDK for multiple providers: Zhipu AI, Gemini, OpenAI, DeepSeek
 * Also supports Ollama for local models
 *
 * Provider Base URLs:
 * - Zhipu AI: https://open.bigmodel.cn/api/paas/v4
 * - Gemini: https://generativelanguage.googleapis.com/v1beta/openai/
 * - DeepSeek: https://api.deepseek.com
 * - Ollama: http://localhost:11434 (local)
 */

import OpenAI from 'openai';
import { ollamaClient, type OllamaMessage } from './ollama.js';

// Get API keys from environment
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

/**
 * AI Provider type
 */
export type AIProvider = 'zhipu' | 'gemini' | 'openai' | 'deepseek' | 'ollama';

/**
 * Provider configuration
 */
interface ProviderConfig {
  apiKey: string;
  baseURL: string;
  defaultModel: string;
  supportsThinking: boolean;
  requiresApiKey: boolean;
}

/**
 * Provider configurations
 */
const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  zhipu: {
    apiKey: ZHIPU_API_KEY,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4.7',
    supportsThinking: true,
    requiresApiKey: true,
  },
  gemini: {
    apiKey: GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-2.5-flash',
    supportsThinking: false,
    requiresApiKey: true,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    supportsThinking: false,
    requiresApiKey: true,
  },
  deepseek: {
    apiKey: DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    supportsThinking: false,
    requiresApiKey: true,
  },
  ollama: {
    apiKey: '', // Ollama doesn't use API key
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: 'qwen2.5:7b',
    supportsThinking: false,
    requiresApiKey: false,
  },
};

/**
 * Chat completion request options
 */
export interface ChatCompletionOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  thinking_enabled?: boolean; // Enable thinking mode (Zhipu only)
}

/**
 * AI Client Manager - manages OpenAI clients for different providers
 */
export class AIClientManager {
  private clients: Map<AIProvider, OpenAI | null> = new Map();

  constructor() {
    // Initialize clients
    this.clients.set('zhipu', this.createClient('zhipu'));
    this.clients.set('gemini', this.createClient('gemini'));
    this.clients.set('openai', this.createClient('openai'));
    this.clients.set('deepseek', this.createClient('deepseek'));
  }

  /**
   * Create an OpenAI client for a specific provider
   */
  private createClient(provider: AIProvider): OpenAI | null {
    const config = PROVIDER_CONFIGS[provider];
    if (!config.apiKey) {
      console.warn(`WARNING: ${provider.toUpperCase()}_API_KEY not set`);
      return null;
    }
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  /**
   * Get client for a specific provider
   */
  getClient(provider: AIProvider): OpenAI {
    const client = this.clients.get(provider);
    if (!client) {
      throw new Error(`Provider '${provider}' is not available. Please set ${provider.toUpperCase()}_API_KEY environment variable.`);
    }
    return client;
  }

  /**
   * Check if a provider is available
   */
  isAvailable(provider: AIProvider): boolean {
    return this.clients.get(provider) !== null;
  }

  /**
   * Get default model for a provider
   */
  getDefaultModel(provider: AIProvider): string {
    return PROVIDER_CONFIGS[provider].defaultModel;
  }

  /**
   * Check if provider supports thinking mode
   */
  supportsThinking(provider: AIProvider): boolean {
    return PROVIDER_CONFIGS[provider].supportsThinking;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = Array.from(this.clients.entries())
      .filter(([_, client]) => client !== null)
      .map(([provider, _]) => provider);

    // Add Ollama if it doesn't require API key (always "available" but may not be running)
    providers.push('ollama');

    return providers;
  }

  /**
   * Create chat completion with options
   */
  async createChatCompletion(
    provider: AIProvider,
    messages: OpenAI.ChatCompletionMessageParam[],
    options: ChatCompletionOptions = {}
  ): Promise<OpenAI.ChatCompletion> {
    const config = PROVIDER_CONFIGS[provider];
    const model = options.model || config.defaultModel;

    // Handle Ollama separately (uses native API)
    if (provider === 'ollama') {
      return this.createOllamaCompletion(messages, options);
    }

    // Handle OpenAI-compatible providers (Zhipu, Gemini, OpenAI)
    const client = this.getClient(provider);

    // Build request body
    const requestBody: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages,
      max_tokens: options.max_tokens || 65536,
      temperature: options.temperature ?? 0.7,
    };

    // Add thinking parameter for Zhipu if enabled
    if (options.thinking_enabled && config.supportsThinking) {
      (requestBody as any).thinking = { type: 'enabled' };
    }

    return await client.chat.completions.create(requestBody);
  }

  /**
   * Create Ollama completion using native API
   */
  private async createOllamaCompletion(
    messages: OpenAI.ChatCompletionMessageParam[],
    options: ChatCompletionOptions = {}
  ): Promise<OpenAI.ChatCompletion> {
    const model = options.model || PROVIDER_CONFIGS.ollama.defaultModel;

    // Convert OpenAI messages to Ollama format
    const ollamaMessages: OllamaMessage[] = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
    }));

    // Call Ollama with retry
    const content = await ollamaClient.chatWithRetry(model, ollamaMessages, {
      temperature: options.temperature ?? 0.8,
      num_predict: options.max_tokens || 2048,
    });

    // Format response to match OpenAI ChatCompletion structure
    return {
      id: `ollama-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content,
          refusal: null,
        },
        finish_reason: 'stop',
        logprobs: null,
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }
}

// Export singleton instance
export const aiClientManager = new AIClientManager();

/**
 * Convenience function to get a client
 */
export function getAIClient(provider: AIProvider = 'zhipu'): OpenAI {
  return aiClientManager.getClient(provider);
}

/**
 * Default configuration values
 */
export const DEFAULT_MAX_TOKENS = 65536;
export const DEFAULT_TEMPERATURE = 0.7;
