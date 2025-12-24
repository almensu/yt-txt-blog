/**
 * YouTube Page - P02: YouTube Integration Workflow
 *
 * 4-step workflow:
 * 1. Input YouTube URL
 * 2. Download subtitles (progress indicator)
 * 3. Process + auto-import (shows imported asset)
 * 4. Style conversion
 */

import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { api } from '../services/api';
import { YouTubeWorkflow } from '../components/YouTubeWorkflow';
import { SubtitleSelector } from '../components/SubtitleSelector';
import { VideoCard } from '../components/VideoCard';
import { createToast } from '../components/Toast';
import type { ProcessWithImportResponse } from '../services/api';

export function YouTubePage() {
  const {
    isLoading,
    currentStep,
    selectedVideo,
    selectedLanguage,
    setCurrentStep,
    setSelectedVideo,
    setSelectedLanguage,
    addToast,
  } = useStore();

  const [url, setUrl] = useState('');
  const [processResult, setProcessResult] = useState<ProcessWithImportResponse | null>(null);

  // Step 1: Download subtitles
  const handleDownload = async () => {
    if (!url.trim()) {
      addToast(createToast('Please enter a YouTube URL', 'error'));
      return;
    }

    try {
      const result = await api.youtube.download({
        url,
        languages: [selectedLanguage || 'en'],
      });

      // Create a video process object
      const video = {
        videoId: result.videoId,
        title: result.title,
        status: 'completed' as const,
        downloadedLanguages: result.downloadedLanguages,
        processedLanguages: [],
        importedAssetIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSelectedVideo(video);
      setCurrentStep(2);
      addToast(createToast('Subtitles downloaded successfully', 'success'));
    } catch (error) {
      addToast(createToast(error instanceof Error ? error.message : 'Download failed', 'error'));
    }
  };

  // Step 3: Process and import
  const handleProcess = async () => {
    if (!selectedVideo) return;

    try {
      const result = await api.youtube.process({
        videoId: selectedVideo.videoId,
        language: selectedLanguage || 'en',
      });

      setProcessResult(result);
      setCurrentStep(3);

      // Update video with imported asset
      setSelectedVideo({
        ...selectedVideo,
        processedLanguages: [selectedLanguage || 'en'],
        importedAssetIds: [result.importedAssetId],
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });

      addToast(createToast('Asset imported successfully', 'success'));
    } catch (error) {
      addToast(createToast(error instanceof Error ? error.message : 'Processing failed', 'error'));
    }
  };

  // Reset to step 1
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedVideo(null);
    setProcessResult(null);
    setUrl('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">YouTube to Blog</h1>
        <p className="text-gray-600 mt-2">Convert YouTube videos to styled blog articles</p>
      </div>

      {/* Step Indicator */}
      <YouTubeWorkflow currentStep={currentStep} />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700">Processing...</p>
          </div>
        </div>
      )}

      {/* Step 1: URL Input */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Enter YouTube URL</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={isLoading}
            />
            <SubtitleSelector
              value={selectedLanguage || 'en'}
              onChange={setSelectedLanguage}
              disabled={isLoading}
            />
            <button
              onClick={handleDownload}
              disabled={!url.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Download
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Download Progress/Result */}
      {currentStep === 2 && selectedVideo && (
        <VideoCard
          video={selectedVideo}
          onProcess={handleProcess}
          onReset={handleReset}
          showActions
        />
      )}

      {/* Step 3: Import Result */}
      {currentStep === 3 && processResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Asset Imported Successfully</h2>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Asset created successfully</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Asset ID:</span>
                <span className="ml-2 font-mono text-gray-900">{processResult.importedAssetId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Language:</span>
                <span className="ml-2 text-gray-900">{processResult.language}</span>
              </div>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Asset Preview:</p>
            <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {processResult.asset.content.slice(0, 500)}...
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue to Convert
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Convert */}
      {currentStep === 4 && processResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Convert to Styled Article</h2>
          <p className="text-gray-600 mb-4">
            Asset <span className="font-medium">"{processResult.asset.title}"</span> is ready for style conversion.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              Go to the <strong>Convert</strong> page to select a writing style and generate your article.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/convert"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
            >
              Go to Convert Page
            </a>
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
