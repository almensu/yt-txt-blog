/**
 * Import Service - P02: Automatic import from processed subtitle files
 *
 * This service handles importing processed text files from the YouTube
 * subtitle processing pipeline into TXT assets with metadata.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { TxtAsset } from '../types/index.js';

const ASSETS_DIR = path.join(process.cwd(), 'project_data', 'assets');
const INDEX_FILE = path.join(process.cwd(), 'project_data', 'indexes', 'assets.json');
const PROCESSED_DIR = path.join(process.cwd(), 'storage', 'processed');

/**
 * Extended create request that includes P02 metadata fields
 */
interface ExtendedCreateAssetRequest {
  title: string;
  content: string;
  source_video_id?: string;
  source_video_title?: string;
  source_language?: string;
  source_type?: 'youtube' | 'manual';
}

/**
 * Import Service - handles automatic asset import from processed files
 */
export class ImportService {
  private processedDir: string;
  private assetsDir: string;
  private indexFile: string;
  private assetsCache: Map<string, TxtAsset> = new Map();

  constructor() {
    this.processedDir = PROCESSED_DIR;
    this.assetsDir = ASSETS_DIR;
    this.indexFile = INDEX_FILE;
  }

  /**
   * Load all assets into cache for deduplication
   */
  private async loadAssetsCache(): Promise<void> {
    if (this.assetsCache.size > 0) {
      return; // Already loaded
    }

    try {
      const content = await fs.readFile(this.indexFile, 'utf-8');
      const index = JSON.parse(content);
      const assets: Array<{ id: string; title: string; created_at: string; updated_at: string }> =
        Array.isArray(index) ? index : (index.assets || []);

      for (const summary of assets) {
        try {
          const filepath = path.join(this.assetsDir, `${summary.id}.json`);
          const fileContent = await fs.readFile(filepath, 'utf-8');
          const asset: TxtAsset = JSON.parse(fileContent);
          this.assetsCache.set(asset.id, asset);
        } catch {
          // Skip files that can't be read
        }
      }
    } catch {
      // Index doesn't exist yet
    }
  }

  /**
   * Find existing asset by video ID and language
   */
  private async findExistingAsset(videoId: string, language: string): Promise<TxtAsset | null> {
    await this.loadAssetsCache();

    for (const asset of this.assetsCache.values()) {
      if (asset.source_video_id === videoId && asset.source_language === language) {
        return asset;
      }
    }
    return null;
  }

  /**
   * Import a single processed file as a TXT asset
   * @param videoId - YouTube video ID
   * @param videoTitle - Original video title
   * @param language - Language code (e.g., 'en', 'zh')
   * @returns The created or existing TxtAsset
   */
  async importFromProcessedFile(
    videoId: string,
    videoTitle: string,
    language: string
  ): Promise<TxtAsset> {
    const filePath = path.join(this.processedDir, videoId, `${language}.txt`);

    // 0. Check for existing asset (deduplication)
    const existingAsset = await this.findExistingAsset(videoId, language);
    if (existingAsset) {
      console.log(`Asset already exists for video=${videoId}, language=${language}, returning existing asset ${existingAsset.id}`);
      return existingAsset;
    }

    // 1. Read processed text file
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Processed file not found: ${filePath}. ` +
        `Ensure the subtitle processing has completed.`
      );
    }

    // 2. Validate content
    if (!content || content.trim().length === 0) {
      throw new Error(`Processed file is empty: ${filePath}`);
    }

    // 3. Create asset with metadata
    const now = new Date().toISOString();
    const id = uuidv4();

    const asset: TxtAsset = {
      id,
      title: videoTitle,
      content,
      created_at: now,
      updated_at: now,
      // P02 metadata
      source_video_id: videoId,
      source_video_title: videoTitle,
      source_language: language,
      source_type: 'youtube',
    };

    // 4. Save asset file
    await fs.mkdir(this.assetsDir, { recursive: true });
    await fs.writeFile(
      path.join(this.assetsDir, `${id}.json`),
      JSON.stringify(asset, null, 2)
    );

    // 5. Update index
    await this.updateIndex(asset);

    // 6. Add to cache
    this.assetsCache.set(id, asset);

    return asset;
  }

  /**
   * Batch import multiple languages for a single video
   * @param videoId - YouTube video ID
   * @param videoTitle - Original video title
   * @param languages - Array of language codes to import
   * @returns Array of created TxtAssets (may contain failures)
   */
  async batchImport(
    videoId: string,
    videoTitle: string,
    languages: string[]
  ): Promise<{ success: TxtAsset[]; failed: Array<{ language: string; error: string }> }> {
    const results: TxtAsset[] = [];
    const failures: Array<{ language: string; error: string }> = [];

    for (const lang of languages) {
      try {
        const asset = await this.importFromProcessedFile(videoId, videoTitle, lang);
        results.push(asset);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        failures.push({ language: lang, error: errorMessage });
        console.error(`Failed to import language ${lang}:`, errorMessage);
      }
    }

    return { success: results, failed: failures };
  }

  /**
   * Check if a processed file exists for a video and language
   * @param videoId - YouTube video ID
   * @param language - Language code
   * @returns true if file exists
   */
  async hasProcessedFile(videoId: string, language: string): Promise<boolean> {
    const filePath = path.join(this.processedDir, videoId, `${language}.txt`);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the content of a processed file without creating an asset
   * @param videoId - YouTube video ID
   * @param language - Language code
   * @returns File content or null if not found
   */
  async getProcessedContent(videoId: string, language: string): Promise<string | null> {
    const filePath = path.join(this.processedDir, videoId, `${language}.txt`);
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Update the assets index file
   * @param asset - Asset to add/update in index
   */
  private async updateIndex(asset: TxtAsset): Promise<void> {
    let index: { assets: Array<Pick<TxtAsset, 'id' | 'title' | 'created_at' | 'updated_at'>> };

    try {
      const content = await fs.readFile(this.indexFile, 'utf-8');
      index = JSON.parse(content);
    } catch {
      // File doesn't exist or is invalid, create new index
      index = { assets: [] };
    }

    // Check if asset already exists in index
    const existingIndex = index.assets.findIndex(a => a.id === asset.id);

    if (existingIndex >= 0) {
      // Update existing entry
      index.assets[existingIndex] = {
        id: asset.id,
        title: asset.title,
        created_at: asset.created_at,
        updated_at: asset.updated_at,
      };
    } else {
      // Add new entry
      index.assets.push({
        id: asset.id,
        title: asset.title,
        created_at: asset.created_at,
        updated_at: asset.updated_at,
      });
    }

    // Write updated index
    await fs.mkdir(path.dirname(this.indexFile), { recursive: true });
    await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
  }
}

// Export singleton instance
export const importService = new ImportService();
