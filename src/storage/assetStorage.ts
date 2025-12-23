/**
 * Asset Storage Service
 * Manages TXT assets stored as JSON files in project_data/assets/
 */

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { TxtAsset, CreateAssetRequest, UpdateAssetRequest } from '../types/index.js';

const ASSETS_DIR = path.join(process.cwd(), 'project_data', 'assets');
const INDEX_FILE = path.join(process.cwd(), 'project_data', 'indexes', 'assets.json');

/**
 * AssetStorage - handles CRUD operations for TXT assets
 */
export class AssetStorage {
  private assets: Map<string, TxtAsset> = new Map();

  /**
   * Initialize storage - load existing assets
   */
  async initialize(): Promise<void> {
    await this.ensureDirectories();
    await this.loadIndex();
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    await fs.mkdir(path.dirname(INDEX_FILE), { recursive: true });
  }

  /**
   * Load asset index from disk
   */
  private async loadIndex(): Promise<void> {
    try {
      const data = await fs.readFile(INDEX_FILE, 'utf-8');
      const assets: TxtAsset[] = JSON.parse(data);
      this.assets.clear();
      assets.forEach((asset) => this.assets.set(asset.id, asset));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      // Index doesn't exist yet, start fresh
    }
  }

  /**
   * Save asset index to disk
   */
  private async saveIndex(): Promise<void> {
    const assets = Array.from(this.assets.values());
    await fs.writeFile(INDEX_FILE, JSON.stringify(assets, null, 2), 'utf-8');
  }

  /**
   * Get all assets
   */
  async getAll(): Promise<TxtAsset[]> {
    return Array.from(this.assets.values());
  }

  /**
   * Get asset by ID
   */
  async getById(id: string): Promise<TxtAsset | null> {
    return this.assets.get(id) || null;
  }

  /**
   * Create new asset
   */
  async create(data: CreateAssetRequest): Promise<TxtAsset> {
    const now = new Date().toISOString();
    const asset: TxtAsset = {
      id: uuidv4(),
      title: data.title,
      content: data.content,
      created_at: now,
      updated_at: now,
    };

    // Save to individual file
    const filepath = path.join(ASSETS_DIR, `${asset.id}.json`);
    await fs.writeFile(filepath, JSON.stringify(asset, null, 2), 'utf-8');

    // Update index
    this.assets.set(asset.id, asset);
    await this.saveIndex();

    return asset;
  }

  /**
   * Update existing asset
   */
  async update(id: string, data: UpdateAssetRequest): Promise<TxtAsset | null> {
    const existing = this.assets.get(id);
    if (!existing) {
      return null;
    }

    const updated: TxtAsset = {
      ...existing,
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      updated_at: new Date().toISOString(),
    };

    // Update individual file
    const filepath = path.join(ASSETS_DIR, `${id}.json`);
    await fs.writeFile(filepath, JSON.stringify(updated, null, 2), 'utf-8');

    // Update index
    this.assets.set(id, updated);
    await this.saveIndex();

    return updated;
  }

  /**
   * Delete asset
   */
  async delete(id: string): Promise<boolean> {
    const exists = this.assets.has(id);
    if (!exists) {
      return false;
    }

    // Delete individual file
    const filepath = path.join(ASSETS_DIR, `${id}.json`);
    await fs.unlink(filepath).catch(() => {
      // Ignore if file doesn't exist
    });

    // Update index
    this.assets.delete(id);
    await this.saveIndex();

    return true;
  }
}

// Export singleton instance
export const assetStorage = new AssetStorage();
