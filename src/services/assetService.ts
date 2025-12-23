/**
 * Asset Service
 * Business logic layer for TXT asset management
 */

import { assetStorage } from '../storage/assetStorage.js';
import type { TxtAsset, CreateAssetRequest, UpdateAssetRequest } from '../types/index.js';

/**
 * AssetService - service layer for asset operations
 */
export class AssetService {
  private initialized = false;

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await assetStorage.initialize();
      this.initialized = true;
    }
  }

  /**
   * Get all assets
   */
  async getAll(): Promise<TxtAsset[]> {
    await this.ensureInitialized();
    return assetStorage.getAll();
  }

  /**
   * Get asset by ID
   */
  async getById(id: string): Promise<TxtAsset | null> {
    await this.ensureInitialized();
    return assetStorage.getById(id);
  }

  /**
   * Create new asset
   */
  async create(data: CreateAssetRequest): Promise<TxtAsset> {
    await this.ensureInitialized();

    // Validate input
    if (!data.title?.trim()) {
      throw new Error('Asset title is required');
    }
    if (!data.content?.trim()) {
      throw new Error('Asset content is required');
    }

    return assetStorage.create(data);
  }

  /**
   * Update existing asset
   */
  async update(id: string, data: UpdateAssetRequest): Promise<TxtAsset | null> {
    await this.ensureInitialized();

    // Validate input
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error('Asset title cannot be empty');
    }
    if (data.content !== undefined && !data.content.trim()) {
      throw new Error('Asset content cannot be empty');
    }

    return assetStorage.update(id, data);
  }

  /**
   * Delete asset
   */
  async delete(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return assetStorage.delete(id);
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
export const assetService = new AssetService();
