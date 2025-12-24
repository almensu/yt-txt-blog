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
  // P02: YouTube metadata
  source_video_id?: string;
  source_video_title?: string;
  source_language?: string;
  source_type?: 'youtube' | 'manual';
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
  provider?: 'zhipu' | 'gemini' | 'openai' | 'deepseek' | 'ollama';
  model?: string;
}

export interface CreateAssetRequest {
  title: string;
  content: string;
}

export interface ConvertRequest {
  asset_id: string;
  style_id: string;
  provider?: 'zhipu' | 'gemini' | 'openai' | 'deepseek' | 'ollama';
  model?: string;
  thinking_enabled?: boolean; // Enable thinking mode (Zhipu GLM-4.7 only)
  temperature?: number; // 0-1, default 0.7
}

// AI Provider types
export type AIProvider = 'zhipu' | 'gemini' | 'openai' | 'deepseek' | 'ollama';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  models: string[];
  defaultModel: string;
  supportsThinking: boolean; // Supports thinking mode
}

// Available AI providers
export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'zhipu',
    name: '智谱 AI (Zhipu)',
    description: '国产大模型，支持 GLM-4 系列',
    models: ['glm-4.7', 'glm-4.6'],
    defaultModel: 'glm-4.7',
    supportsThinking: true, // GLM-4.7 supports thinking mode
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google Gemini 2.5 系列模型',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    defaultModel: 'gemini-2.5-flash',
    supportsThinking: false,
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    description: 'OpenAI GPT 系列模型',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    supportsThinking: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek V3 开源模型',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    supportsThinking: false,
  },
  {
    id: 'ollama',
    name: 'Ollama (本地模型)',
    description: '本地运行的开源模型，需要 Ollama 服务',
    models: ['qwen2.5:7b', 'deepseek-r1:8b', 'deepseek-r1:14b', 'qwen3:14b', 'gemma3n:latest'],
    defaultModel: 'qwen2.5:7b',
    supportsThinking: false,
  },
];

// P02: YouTube Integration Types
export interface VideoProcess {
  videoId: string;
  title: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'failed';
  downloadedLanguages: string[];
  processedLanguages: string[];
  importedAssetIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeDownloadRequest {
  url: string;
  languages?: string[];
}

export interface YouTubeDownloadResponse {
  videoId: string;
  title: string;
  duration: number;
  uploader: string;
  uploadDate: string;
  thumbnailUrl: string;
  availableSubtitles: string[];
  downloadedLanguages: string[];
  downloadPath: string;
}

export interface YouTubeProcessRequest {
  videoId: string;
  language: string;
}

export interface ProcessWithImportResponse {
  videoId: string;
  title: string;
  language: string;
  processedTextPath: string;
  importedAssetId: string;
  asset: TxtAsset;
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

  // P02: YouTube Integration
  youtube: {
    async download(request: YouTubeDownloadRequest): Promise<YouTubeDownloadResponse> {
      const res = await fetch(`${API_BASE}/youtube/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Download failed');
      }
      return res.json();
    },

    async process(request: YouTubeProcessRequest): Promise<ProcessWithImportResponse> {
      const res = await fetch(`${API_BASE}/youtube/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Processing failed');
      }
      return res.json();
    },

    async listVideos(): Promise<{ videos: VideoProcess[]; total: number }> {
      const res = await fetch(`${API_BASE}/youtube/videos`);
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
  },
};