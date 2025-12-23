/**
 * Video URL Input Component
 * Handles YouTube video URL input and validation
 */

import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Loader2, Youtube } from 'lucide-react';
import { apiClient, YouTubeVideo } from '../services/api';

interface VideoUrlInputProps {
  onVideoLoaded: (video: YouTubeVideo) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function VideoUrlInput({ onVideoLoaded, onError, disabled = false }: VideoUrlInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [videoInfo, setVideoInfo] = useState<YouTubeVideo | null>(null);

  // YouTube URL validation regex
  const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}(&.*)?$/;

  const validateUrl = useCallback((inputUrl: string): boolean => {
    return youtubeUrlRegex.test(inputUrl.trim());
  }, []);

  const extractVideoId = useCallback((inputUrl: string): string | null => {
    const match = inputUrl.match(/[?&]v=([^&]+)/) || inputUrl.match(/youtu\.be\/([^?]+)/);
    return match ? match[1] : null;
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      onError('Please enter a YouTube URL');
      setIsValid(false);
      return;
    }

    if (!validateUrl(url)) {
      onError('Please enter a valid YouTube URL');
      setIsValid(false);
      return;
    }

    setIsLoading(true);
    setIsValid(null);

    try {
      const response = await apiClient.getVideoInfo(url.trim());

      if (response.success && response.data) {
        setVideoInfo(response.data);
        setIsValid(true);
        onVideoLoaded(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to get video information');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      onError(errorMessage);
      setIsValid(false);
      setVideoInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [url, validateUrl, onVideoLoaded, onError]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    if (newUrl.trim()) {
      setIsValid(validateUrl(newUrl));
    } else {
      setIsValid(null);
    }

    if (videoInfo) {
      setVideoInfo(null);
    }
  }, [validateUrl, videoInfo]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <Youtube className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 relative">
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={disabled || isLoading}
              />

              {/* Status indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isLoading && (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                {isValid === true && !isLoading && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {isValid === false && !isLoading && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video info preview */}
        {videoInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Video Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Title:</span>
                <span className="ml-2 text-gray-900">{videoInfo.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="ml-2 text-gray-900">
                  {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Available Subtitles:</span>
                <span className="ml-2 text-gray-900">{videoInfo.availableSubtitles.length} languages</span>
              </div>
              {videoInfo.availableSubtitles.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Languages:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {videoInfo.availableSubtitles.map((subtitle, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subtitle.isAutoGenerated
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {subtitle.languageName}
                        {subtitle.isAutoGenerated && ' (Auto)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={disabled || isLoading || !url.trim() || isValid === false}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Get Video Information'}
        </button>

        {/* Help text */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Supported YouTube URL formats:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
            <li>https://youtu.be/VIDEO_ID</li>
            <li>https://www.youtube.com/embed/VIDEO_ID</li>
          </ul>
          <p>• The video must have subtitles available for processing</p>
        </div>
      </form>
    </div>
  );
}