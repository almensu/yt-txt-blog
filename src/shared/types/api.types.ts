/**
 * API related type definitions
 * Based on P01-Spec.md API interface specifications
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  /** Whether successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error information */
  error?: {
    code: string;
    category: string;
    severity: string;
    message: string;
    timestamp: Date;
  };
}

/**
 * Video info API response
 */
export type VideoInfoResponse = ApiResponse<YouTubeVideo>;

/**
 * Subtitle download API response
 */
export type SubtitleDownloadResponse = ApiResponse<DownloadResult>;

/**
 * Subtitle processing API response
 */
export type SubtitleProcessingResponse = ApiResponse<ProcessingResult>;

/**
 * File preview API response
 */
export type FilePreviewResponse = ApiResponse<FilePreviewData>;

/**
 * System status API response
 */
export type SystemStatusResponse = ApiResponse<SystemStatusData>;