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
  model: string; // AI model used (e.g., "glm-4")
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
