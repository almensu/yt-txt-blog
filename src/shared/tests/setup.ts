/**
 * Shared module test setup
 * Configuration for shared utilities and types tests
 */

// Basic test setup for shared modules
beforeAll(() => {
  console.log('🔧 Setting up shared module tests');
});

afterAll(() => {
  console.log('✅ Shared module tests completed');
});

// Export shared test utilities for use across the project
export const mockYouTubeVideoId = 'dQw4w9WgXcQ';
export const mockYouTubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
export const mockInvalidYouTubeUrl = 'https://invalid-url.com/video';

export const mockLanguageCodes = {
  english: 'en',
  chinese: 'zh',
  japanese: 'ja',
  korean: 'ko',
};

export const mockFileSizes = {
  small: 1024,        // 1KB
  medium: 1024 * 1024, // 1MB
  large: 50 * 1024 * 1024, // 50MB
};