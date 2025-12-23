/**
 * Article Storage Service
 * Manages generated articles stored as JSON files in project_data/articles/
 */

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { GeneratedArticle } from '../types/index.js';

const ARTICLES_DIR = path.join(process.cwd(), 'project_data', 'articles');
const INDEX_FILE = path.join(process.cwd(), 'project_data', 'indexes', 'articles.json');

/**
 * ArticleStorage - handles CRUD operations for generated articles
 */
export class ArticleStorage {
  private articles: Map<string, GeneratedArticle> = new Map();

  /**
   * Initialize storage - load existing articles
   */
  async initialize(): Promise<void> {
    await this.ensureDirectories();
    await this.loadIndex();
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(ARTICLES_DIR, { recursive: true });
    await fs.mkdir(path.dirname(INDEX_FILE), { recursive: true });
  }

  /**
   * Load article index from disk
   */
  private async loadIndex(): Promise<void> {
    try {
      const data = await fs.readFile(INDEX_FILE, 'utf-8');
      const articles: GeneratedArticle[] = JSON.parse(data);
      this.articles.clear();
      articles.forEach((article) => this.articles.set(article.id, article));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Save article index to disk
   */
  private async saveIndex(): Promise<void> {
    const articles = Array.from(this.articles.values());
    await fs.writeFile(INDEX_FILE, JSON.stringify(articles, null, 2), 'utf-8');
  }

  /**
   * Get all articles
   */
  async getAll(): Promise<GeneratedArticle[]> {
    return Array.from(this.articles.values());
  }

  /**
   * Get article by ID
   */
  async getById(id: string): Promise<GeneratedArticle | null> {
    return this.articles.get(id) || null;
  }

  /**
   * Get articles by asset ID
   */
  async getByAssetId(assetId: string): Promise<GeneratedArticle[]> {
    return Array.from(this.articles.values()).filter(
      (article) => article.asset_id === assetId
    );
  }

  /**
   * Create new article
   */
  async create(data: Omit<GeneratedArticle, 'id' | 'created_at'>): Promise<GeneratedArticle> {
    const article: GeneratedArticle = {
      id: uuidv4(),
      ...data,
      created_at: new Date().toISOString(),
    };

    // Save to individual file
    const filepath = path.join(ARTICLES_DIR, `${article.id}.json`);
    await fs.writeFile(filepath, JSON.stringify(article, null, 2), 'utf-8');

    // Update index
    this.articles.set(article.id, article);
    await this.saveIndex();

    return article;
  }

  /**
   * Delete article
   */
  async delete(id: string): Promise<boolean> {
    const exists = this.articles.has(id);
    if (!exists) {
      return false;
    }

    // Delete individual file
    const filepath = path.join(ARTICLES_DIR, `${id}.json`);
    await fs.unlink(filepath).catch(() => {
      // Ignore if file doesn't exist
    });

    // Update index
    this.articles.delete(id);
    await this.saveIndex();

    return true;
  }
}

// Export singleton instance
export const articleStorage = new ArticleStorage();
