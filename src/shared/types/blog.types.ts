/**
 * Blog article related type definitions
 * Based on P02-Spec.md: Txt-to-Blog Conversion Feature
 */

/**
 * Blog article style types
 */
export enum BlogStyle {
  /** Wall Street Journal style - concise, data-driven */
  WSJ = 'wsj',
  /** Diamond/Inverted Pyramid style - conclusion first */
  DIAMOND = 'diamond',
  /** Narrative style - storytelling approach */
  NARRATIVE = 'narrative',
  /** Technical tutorial style */
  TUTORIAL = 'tutorial',
  /** Listicle style */
  LISTICLE = 'listicle'
}

/**
 * Article generation status
 */
export enum ArticleStatus {
  /** Waiting to be generated */
  PENDING = 'pending',
  /** Currently being generated */
  GENERATING = 'generating',
  /** Generation completed successfully */
  COMPLETED = 'completed',
  /** Generation failed */
  FAILED = 'failed'
}

/**
 * Txt Asset - represents a source text file
 */
export interface TxtAsset {
  /** Unique asset identifier (UUID v4) */
  id: string;
  /** Associated video ID (from YouTube) */
  videoId: string;
  /** Source language code */
  language: string;
  /** Local file path */
  filePath: string;
  /** File size in bytes */
  fileSize: number;
  /** Word count */
  wordCount: number;
  /** Asset creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
  /** Asset metadata */
  metadata?: {
    /** Original video title */
    videoTitle?: string;
    /** Original video URL */
    videoUrl?: string;
    /** Content preview (first 200 chars) */
    preview?: string;
  };
}

/**
 * Prompt configuration for blog style
 */
export interface PromptConfig {
  /** Unique prompt identifier */
  id: string;
  /** Style type */
  style: BlogStyle;
  /** Style display name */
  name: string;
  /** Style description */
  description: string;
  /** System prompt template */
  systemPrompt: string;
  /** User prompt template with {content} placeholder */
  userPromptTemplate: string;
  /** Maximum output tokens */
  maxTokens?: number;
  /** Temperature for generation (0-1) */
  temperature?: number;
  /** Expected output length multiplier (relative to input) */
  lengthMultiplier?: number;
  /** Is this a custom user prompt? */
  isCustom: boolean;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Blog article - generated article
 */
export interface BlogArticle {
  /** Unique article identifier (UUID v4) */
  id: string;
  /** Source asset ID */
  sourceAssetId: string;
  /** Style used for generation */
  style: BlogStyle;
  /** Prompt config ID used */
  promptConfigId: string;
  /** Article title (generated or custom) */
  title: string;
  /** Article content in Markdown format */
  content: string;
  /** Article generation status */
  status: ArticleStatus;
  /** Generation timestamp */
  createdAt: Date;
  /** Completion timestamp (null if pending/generating) */
  completedAt?: Date;
  /** File path where article is stored */
  filePath: string;
  /** Word count of generated article */
  wordCount: number;
  /** Metadata */
  metadata: {
    /** Model used for generation */
    model: string;
    /** Number of prompt tokens */
    promptTokens?: number;
    /** Number of completion tokens */
    completionTokens?: number;
    /** Total tokens */
    totalTokens?: number;
    /** Generation duration in milliseconds */
    generationDuration?: number;
    /** Error message if failed */
    errorMessage?: string;
  };
}

/**
 * Conversion request
 */
export interface ConversionRequest {
  /** Source asset ID */
  assetId: string;
  /** Blog style to use */
  style?: BlogStyle;
  /** Custom prompt config ID (optional, overrides style) */
  promptConfigId?: string;
  /** Custom title (optional) */
  customTitle?: string;
  /** Model to use for generation */
  model?: string;
  /** Temperature for generation (0-1) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Whether to use streaming response */
  stream?: boolean;
}

/**
 * Conversion result
 */
export interface ConversionResult {
  /** Generated article */
  article: BlogArticle;
  /** Conversion duration in milliseconds */
  duration: number;
}

/**
 * Prompt create/update request
 */
export interface PromptConfigRequest {
  /** Style type (for built-in styles, reference existing) */
  style?: BlogStyle;
  /** Custom name */
  name: string;
  /** Description */
  description: string;
  /** System prompt */
  systemPrompt: string;
  /** User prompt template */
  userPromptTemplate: string;
  /** Max tokens */
  maxTokens?: number;
  /** Temperature */
  temperature?: number;
  /** Length multiplier */
  lengthMultiplier?: number;
}

/**
 * Asset list query options
 */
export interface AssetListOptions {
  /** Filter by video ID */
  videoId?: string;
  /** Filter by language */
  language?: string;
  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt' | 'wordCount' | 'fileSize';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Pagination offset */
  offset?: number;
  /** Pagination limit */
  limit?: number;
}

/**
 * Article list query options
 */
export interface ArticleListOptions {
  /** Filter by source asset ID */
  sourceAssetId?: string;
  /** Filter by style */
  style?: BlogStyle;
  /** Filter by status */
  status?: ArticleStatus;
  /** Sort field */
  sortBy?: 'createdAt' | 'completedAt' | 'wordCount';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Pagination offset */
  offset?: number;
  /** Pagination limit */
  limit?: number;
}
