/**
 * Style Service
 * Business logic layer for writing style management
 */

import { styleStorage } from '../storage/styleStorage.js';
import type { StyleConfig } from '../types/index.js';

/**
 * StyleService - service layer for style operations
 */
export class StyleService {
  private initialized = false;

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await styleStorage.initialize();
      this.initialized = true;
    }
  }

  /**
   * Get all available styles
   */
  async getAll(): Promise<StyleConfig[]> {
    await this.ensureInitialized();
    return styleStorage.getAll();
  }

  /**
   * Get style by ID
   */
  async getById(id: string): Promise<StyleConfig | null> {
    await this.ensureInitialized();
    return styleStorage.getById(id);
  }

  /**
   * Reload styles from disk
   */
  async reload(): Promise<void> {
    await this.ensureInitialized();
    await styleStorage.reload();
  }

  /**
   * Get style prompt template by ID
   */
  async getPromptTemplate(id: string): Promise<string | null> {
    await this.ensureInitialized();
    const style = await styleStorage.getById(id);
    return style?.prompt_template || null;
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
export const styleService = new StyleService();
