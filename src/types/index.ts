/**
 * Type Definitions for TXT Asset Style Conversion System
 */

// ============================================================================
// Domain Types (T16: TxtAsset interface)
// ============================================================================

/**
 * TXT Asset - represents a text content asset that can be converted
 */
export interface TxtAsset {
  id: string; // UUID v4
  title: string;
  content: string;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp

  // P02: YouTube integration metadata fields (optional for backward compatibility)
  source_video_id?: string; // YouTube video ID
  source_video_title?: string; // Original video title
  source_language?: string; // Language code (en, zh, etc.)
  source_type?: 'youtube' | 'manual'; // Asset origin
}

// ============================================================================
// P02: YouTube Integration Types
// ============================================================================

/**
 * Video Process - tracks YouTube video processing status
 */
export interface VideoProcess {
  videoId: string; // YouTube video ID
  title: string; // Video title
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'failed';
  downloadedLanguages: string[]; // Downloaded subtitle languages
  processedLanguages: string[]; // Processed languages
  importedAssetIds: string[]; // IDs of imported assets (per language)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Process with Import Response - returned by /api/youtube/process
 */
export interface ProcessWithImportResponse {
  videoId: string;
  title: string;
  language: string;
  processedTextPath: string;
  importedAssetId: string;
  asset: TxtAsset;
}

/**
 * YouTube Download Request
 */
export interface YouTubeDownloadRequest {
  url: string;
  languages?: string[];
}

/**
 * YouTube Download Response
 */
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

/**
 * YouTube Process Request
 */
export interface YouTubeProcessRequest {
  videoId: string;
  language: string;
}

/**
 * YouTube Video Info
 */
export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  duration: number;
  uploader: string;
  uploadDate: string;
  thumbnailUrl: string;
  availableSubtitles: string[];
}

// ============================================================================
// Style Configuration Types (T17: StyleConfig interface)
// ============================================================================

/**
 * Style Configuration - represents a writing style template
 */
export interface StyleConfig {
  id: string; // Style ID (e.g., "wsj", "diamond")
  name: string; // Display name
  description: string; // Style description
  prompt_template: string; // The prompt template with {content} placeholder
}

/**
 * Style File Reference - reference to a style file on disk
 */
export interface StyleFileRef {
  id: string; // Style ID derived from filename
  filepath: string; // Full path to the .md file
  name: string; // Display name extracted from file
}

// ============================================================================
// Article Types (T18: GeneratedArticle interface)
// ============================================================================

/**
 * Generated Article - represents a converted article
 */
export interface GeneratedArticle {
  id: string; // UUID v4
  asset_id: string; // Reference to source TxtAsset
  asset_title: string; // Original asset title
  style_id: string; // Style used for conversion
  style_name: string; // Display name of style
  content: string; // Generated article content
  created_at: string; // ISO 8601 timestamp
  provider: 'zhipu' | 'gemini' | 'openai' | 'deepseek' | 'ollama'; // AI provider used
  model: string; // AI model used (e.g., "glm-4.7", "qwen2.5:7b")
  prompt_tokens?: number; // Optional: token usage stats
  completion_tokens?: number; // Optional: token usage stats
}

// ============================================================================
// Request/Response Types (T19: API types)
// ============================================================================

/**
 * Request to create a new TXT asset
 */
export interface CreateAssetRequest {
  title: string;
  content: string;
  // P02: Optional metadata fields for YouTube integration
  source_video_id?: string;
  source_video_title?: string;
  source_language?: string;
  source_type?: 'youtube' | 'manual';
}

/**
 * Request to update an existing TXT asset
 */
export interface UpdateAssetRequest {
  title?: string;
  content?: string;
}

/**
 * Request to convert an asset to a styled article
 */
export interface ConvertRequest {
  asset_id: string;
  style_id: string;
  model?: string; // Optional: override default model
  provider?: 'zhipu' | 'gemini' | 'openai' | 'deepseek' | 'ollama'; // Optional: AI provider (default: auto-detect)
  thinking_enabled?: boolean; // Optional: enable thinking mode (Zhipu only)
  temperature?: number; // Optional: temperature (0-1)
}

/**
 * Response for asset operations
 */
export interface AssetResponse {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Response for convert operation
 */
export interface ConvertResponse {
  id: string;
  asset_id: string;
  style_id: string;
  content: string;
  created_at: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// Chat Types (Zhipu AI Chat)
// ============================================================================

/**
 * 聊天请求类型
 */
export interface ChatRequest {
  /** 用户消息内容 */
  content: string;
  /** 系统提示词 (可选) */
  system_prompt?: string;
  /** 模型名称 (可选，默认使用 glm-4.7) */
  model?: string;
  /** 最大输出 token 数 (可选) */
  max_tokens?: number;
  /** 温度参数 (0-1) (可选) */
  temperature?: number;
  /** 是否启用思考模式 (可选) */
  thinking_enabled?: boolean;
}

/**
 * 带内容处理的聊天请求
 * 用于根据txt内容，加入提示词进行处理
 */
export interface ChatWithContentRequest {
  /** 要处理的文本内容 */
  txt_content: string;
  /** 系统提示词 */
  system_prompt: string;
  /** 模型名称 (可选，默认使用 glm-4.7) */
  model?: string;
  /** 最大输出 token 数 (可选) */
  max_tokens?: number;
  /** 温度参数 (0-1) (可选) */
  temperature?: number;
  /** 是否启用思考模式 (可选) */
  thinking_enabled?: boolean;
}

/**
 * 聊天响应类型
 */
export interface ChatResponse {
  /** AI 生成的回复内容 */
  content: string;
  /** 使用的模型名称 */
  model: string;
  /** 思考模式内容 (如果启用) */
  reasoning_content?: string;
  /** Token 使用统计 */
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
