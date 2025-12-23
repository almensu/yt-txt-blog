/**
 * HomePage Component
 * Main application interface that integrates all functionality
 */

import { useState } from 'react';
import { AlertCircle, CheckCircle, Sparkles, Youtube } from 'lucide-react';
import { VideoUrlInput } from '../components/VideoUrlInput';
import { SubtitleDownloader } from '../components/SubtitleDownloader';
import { TextPreview } from '../components/TextPreview';
import { ProgressBar } from '../components/ProgressBar';
import { apiClient, YouTubeVideo, DownloadResult, ProcessedText } from '../services/api';

interface ProcessingOptions {
  removeTimestamps: boolean;
  mergeDuplicates: boolean;
  formatParagraphs: boolean;
}

export function HomePage() {
  const [currentStep, setCurrentStep] = useState<'input' | 'download' | 'process' | 'complete'>('input');
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [processedText, setProcessedText] = useState<ProcessedText | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    removeTimestamps: true,
    mergeDuplicates: true,
    formatParagraphs: true
  });

  const handleVideoLoaded = (video: YouTubeVideo) => {
    setCurrentVideo(video);
    setCurrentStep('download');
    setError(null);
  };

  const handleDownloadComplete = (result: DownloadResult) => {
    setDownloadResult(result);
    setCurrentStep('process');
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Don't reset step on error, let user fix the issue
  };

  const handleProcessSubtitles = async () => {
    if (!downloadResult || downloadResult.subtitles.length === 0) {
      setError('No subtitles available for processing');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      // Simulate progress updates (in a real app, this would come from the API)
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Process the first subtitle
      const subtitle = downloadResult.subtitles[0];
      const processingRequest = {
        subtitleFile: subtitle.filePath,
        outputPath: undefined, // Let the API decide
        ...processingOptions
      };

      const response = await apiClient.processSubtitles(processingRequest);

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (response.success && response.data) {
        setProcessedText(response.data);
        setCurrentStep('complete');
      } else {
        throw new Error(response.error?.message || 'Processing failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during processing';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  };

  const handleReprocess = async (options: ProcessingOptions) => {
    setProcessingOptions(options);
    // Reset to processing step
    setProcessedText(null);
    setCurrentStep('process');
    await handleProcessSubtitles();
  };

  const resetWorkflow = () => {
    setCurrentStep('input');
    setCurrentVideo(null);
    setDownloadResult(null);
    setProcessedText(null);
    setError(null);
    setProcessingProgress(0);
    setIsProcessing(false);
  };

  const steps = [
    { id: 'input', label: 'Input URL', completed: currentStep !== 'input' },
    { id: 'download', label: 'Download', completed: currentStep === 'process' || currentStep === 'complete' },
    { id: 'process', label: 'Process', completed: currentStep === 'complete' },
    { id: 'complete', label: 'Complete', completed: currentStep === 'complete' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">YouTube to Text Converter</h1>
                <p className="text-sm text-gray-600">Convert YouTube video subtitles to clean, readable text</p>
              </div>
            </div>
            {currentStep !== 'input' && (
              <button
                onClick={resetWorkflow}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Start New Conversion
              </button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium ${
                    step.completed
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : currentStep === step.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    currentStep === step.id ? 'text-blue-600' : step.completed ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${
                      step.completed ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Error</h3>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-sm text-red-700 hover:text-red-900 mt-2 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Video URL Input */}
        {currentStep === 'input' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Convert YouTube Subtitles to Text</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enter a YouTube video URL to extract and clean subtitles for easy reading
              </p>
            </div>
            <VideoUrlInput
              onVideoLoaded={handleVideoLoaded}
              onError={handleError}
            />
          </div>
        )}

        {/* Step 2: Download Subtitles */}
        {currentStep === 'download' && currentVideo && (
          <div className="space-y-8">
            <SubtitleDownloader
              video={currentVideo}
              onDownloadComplete={handleDownloadComplete}
              onError={handleError}
            />
          </div>
        )}

        {/* Step 3: Process Subtitles */}
        {currentStep === 'process' && downloadResult && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Process Subtitles</h2>
              <p className="text-lg text-gray-600">
                Clean and format the downloaded subtitles into readable text
              </p>
            </div>

            {/* Processing Options */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Processing Options</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.removeTimestamps}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, removeTimestamps: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Remove timestamps and technical data</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.mergeDuplicates}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, mergeDuplicates: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Merge duplicate segments</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.formatParagraphs}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, formatParagraphs: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">Format into readable paragraphs</span>
                </label>
              </div>
            </div>

            {/* Process Button */}
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleProcessSubtitles}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>{isProcessing ? 'Processing...' : 'Process Subtitles'}</span>
              </button>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="max-w-2xl mx-auto">
                <ProgressBar
                  progress={processingProgress}
                  message="Processing subtitles..."
                  showPercentage={true}
                  showETA={true}
                  estimatedTime={30}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && processedText && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">Conversion Complete!</h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your subtitles have been processed and are ready for use
              </p>
            </div>

            <TextPreview
              processedText={processedText}
              onReprocess={handleReprocess}
              editable={true}
            />
          </div>
        )}

        {/* Quick Stats */}
        {(currentVideo || downloadResult || processedText) && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Session Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentVideo && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Video Duration</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.floor(currentVideo.duration / 60)}:{(currentVideo.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
                {downloadResult && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Subtitles Downloaded</p>
                    <p className="text-lg font-semibold text-gray-900">{downloadResult.subtitles.length}</p>
                  </div>
                )}
                {processedText && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Words Generated</p>
                    <p className="text-lg font-semibold text-gray-900">{processedText.wordCount.toLocaleString()}</p>
                  </div>
                )}
                {processedText && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Processing Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(processedText.processingDuration / 1000).toFixed(2)}s
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}