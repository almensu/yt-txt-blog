/**
 * Ollama API Client
 * For local models: llama, qwen, deepseek-r1, etc.
 * Default endpoint: http://localhost:11434
 */

// Ollama configuration
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
export const OLLAMA_ENDPOINT = `${OLLAMA_BASE_URL}/api/chat`;

/**
 * Ollama message format
 */
export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Ollama request options
 */
export interface OllamaRequestOptions {
  temperature?: number;
  top_p?: number;
  num_ctx?: number;      // Context window size
  num_predict?: number;  // Max tokens to generate
}

/**
 * Ollama request payload
 */
export interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: OllamaRequestOptions;
}

/**
 * Ollama response format
 */
export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Ollama API Client
 */
export class OllamaClient {
  private baseURL: string;

  constructor(baseURL: string = OLLAMA_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Check if Ollama service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get list of available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      const data = await response.json() as { models?: Array<{ name: string }> };
      return data.models?.map((m: { name: string }) => m.name) || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  /**
   * Generate chat completion
   */
  async chat(
    model: string,
    messages: OllamaMessage[],
    options: OllamaRequestOptions = {}
  ): Promise<string> {
    // Default options
    const defaultOptions: OllamaRequestOptions = {
      temperature: 0.8,
      top_p: 0.95,
      num_ctx: 8192,
      num_predict: 2048,
    };

    const payload: OllamaRequest = {
      model,
      messages,
      stream: false,
      options: { ...defaultOptions, ...options },
    };

    try {
      const response = await fetch(OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error ${response.status}: ${errorText}`);
      }

      const data = await response.json() as OllamaResponse;
      return data.message?.content || '';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama request failed: ${error.message}`);
      }
      throw new Error('Ollama request failed');
    }
  }

  /**
   * Generate chat completion with retry
   */
  async chatWithRetry(
    model: string,
    messages: OllamaMessage[],
    options: OllamaRequestOptions = {},
    maxRetries: number = 3
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.chat(model, messages, options);
      } catch (error) {
        const isLastAttempt = attempt === maxRetries - 1;
        const errorStr = error instanceof Error ? error.message : String(error);

        // Check for connection errors (service might be starting)
        if (errorStr.includes('ECONNREFUSED') || errorStr.includes('fetch failed')) {
          if (isLastAttempt) {
            throw new Error('Ollama service is not available. Please ensure Ollama is running with: ollama serve');
          }
          // Wait before retry (exponential backoff)
          await this.delay((2 ** attempt) * 1000);
          continue;
        }

        // Other errors, throw immediately
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const ollamaClient = new OllamaClient();

/**
 * Convenience function for chat completion
 */
export async function ollamaChat(
  model: string,
  messages: OllamaMessage[],
  options?: OllamaRequestOptions
): Promise<string> {
  return ollamaClient.chat(model, messages, options);
}
