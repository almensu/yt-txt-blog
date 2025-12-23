/**
 * API Service
 * Frontend API client for TXT Asset Style Conversion System
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Types
export interface TxtAsset {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface StyleConfig {
  id: string;
  name: string;
  description: string;
}

export interface GeneratedArticle {
  id: string;
  asset_id: string;
  asset_title: string;
  style_id: string;
  style_name: string;
  content: string;
  created_at: string;
  model: string;
}

export interface CreateAssetRequest {
  title: string;
  content: string;
}

export interface ConvertRequest {
  asset_id: string;
  style_id: string;
  model?: string;
}

/**
 * API client
 */
export const api = {
  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE.replace('/api', '')}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  // Assets
  assets: {
    async getAll(): Promise<TxtAsset[]> {
      const res = await fetch(`${API_BASE}/assets`);
      if (!res.ok) throw new Error('Failed to fetch assets');
      return res.json();
    },

    async getById(id: string): Promise<TxtAsset> {
      const res = await fetch(`${API_BASE}/assets/${id}`);
      if (!res.ok) throw new Error('Failed to fetch asset');
      return res.json();
    },

    async create(data: CreateAssetRequest): Promise<TxtAsset> {
      const res = await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create asset');
      return res.json();
    },

    async update(id: string, data: Partial<CreateAssetRequest>): Promise<TxtAsset> {
      const res = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update asset');
      return res.json();
    },

    async delete(id: string): Promise<void> {
      const res = await fetch(`${API_BASE}/assets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete asset');
    },
  },

  // Styles
  styles: {
    async getAll(): Promise<StyleConfig[]> {
      const res = await fetch(`${API_BASE}/styles`);
      if (!res.ok) throw new Error('Failed to fetch styles');
      return res.json();
    },

    async getById(id: string): Promise<StyleConfig> {
      const res = await fetch(`${API_BASE}/styles/${id}`);
      if (!res.ok) throw new Error('Failed to fetch style');
      return res.json();
    },

    async reload(): Promise<StyleConfig[]> {
      const res = await fetch(`${API_BASE}/styles/reload`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reload styles');
      const data = await res.json();
      return data.styles;
    },
  },

  // Convert
  async convert(request: ConvertRequest): Promise<GeneratedArticle> {
    const res = await fetch(`${API_BASE}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Conversion failed');
    }
    return res.json();
  },

  // Articles
  articles: {
    async getAll(): Promise<GeneratedArticle[]> {
      const res = await fetch(`${API_BASE}/articles`);
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    },

    async getById(id: string): Promise<GeneratedArticle> {
      const res = await fetch(`${API_BASE}/articles/${id}`);
      if (!res.ok) throw new Error('Failed to fetch article');
      return res.json();
    },

    async getByAssetId(assetId: string): Promise<GeneratedArticle[]> {
      const res = await fetch(`${API_BASE}/articles/asset/${assetId}`);
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    },

    async delete(id: string): Promise<void> {
      const res = await fetch(`${API_BASE}/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete article');
    },
  },
};

export type { TxtAsset, StyleConfig, GeneratedArticle, CreateAssetRequest, ConvertRequest };