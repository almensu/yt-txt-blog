/**
 * Style Storage Service
 * Manages writing style prompts stored as markdown files in configs/writing_styles/
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { StyleConfig, StyleFileRef } from '../types/index.js';

const STYLES_DIR = path.join(process.cwd(), 'configs', 'writing_styles');

/**
 * StyleStorage - handles loading writing style prompts from markdown files
 */
export class StyleStorage {
  private styles: Map<string, StyleConfig> = new Map();

  /**
   * Initialize storage - load all available styles
   */
  async initialize(): Promise<void> {
    await this.loadStyles();
  }

  /**
   * Load all style files from disk
   */
  private async loadStyles(): Promise<void> {
    try {
      const files = await fs.readdir(STYLES_DIR);
      const mdFiles = files.filter((f) => f.endsWith('.md') && f.startsWith('prompt_'));

      this.styles.clear();

      for (const file of mdFiles) {
        const filepath = path.join(STYLES_DIR, file);
        const content = await fs.readFile(filepath, 'utf-8');

        // Extract style ID from filename (e.g., "prompt_wsj.md" -> "wsj")
        const styleId = file.replace('prompt_', '').replace('.md', '');

        // Create display name from ID
        const name = this.styleIdToDisplayName(styleId);

        this.styles.set(styleId, {
          id: styleId,
          name,
          description: `${name}风格`,
          prompt_template: content,
        });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Convert style ID to display name
   */
  private styleIdToDisplayName(id: string): string {
    const names: Record<string, string> = {
      wsj: 'WSJ',
      diamond: '钻石型',
    };
    return names[id] || id.charAt(0).toUpperCase() + id.slice(1);
  }

  /**
   * Get all available styles
   */
  async getAll(): Promise<StyleConfig[]> {
    return Array.from(this.styles.values());
  }

  /**
   * Get style by ID
   */
  async getById(id: string): Promise<StyleConfig | null> {
    return this.styles.get(id) || null;
  }

  /**
   * Get style file references
   */
  async getStyleFiles(): Promise<StyleFileRef[]> {
    const files = await fs.readdir(STYLES_DIR);
    const mdFiles = files.filter((f) => f.endsWith('.md') && f.startsWith('prompt_'));

    return mdFiles.map((file) => {
      const styleId = file.replace('prompt_', '').replace('.md', '');
      return {
        id: styleId,
        filepath: path.join(STYLES_DIR, file),
        name: this.styleIdToDisplayName(styleId),
      };
    });
  }

  /**
   * Reload styles from disk
   */
  async reload(): Promise<void> {
    await this.loadStyles();
  }
}

// Export singleton instance
export const styleStorage = new StyleStorage();
