/**
 * Text Preview Component
 * Displays processed text with options to edit, copy, and download
 */

import { useState, useCallback } from 'react';
import { FileText, Copy, Download, Edit3, Loader2, CheckCircle, Settings } from 'lucide-react';
import { apiClient, ProcessedText } from '../services/api';

interface TextPreviewProps {
  processedText: ProcessedText;
  onReprocess?: (options: ProcessingOptions) => void;
  editable?: boolean;
}

interface ProcessingOptions {
  removeTimestamps: boolean;
  mergeDuplicates: boolean;
  formatParagraphs: boolean;
}

export function TextPreview({ processedText, onReprocess, editable = false }: TextPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(processedText.content);
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    removeTimestamps: true,
    mergeDuplicates: true,
    formatParagraphs: true
  });

  const handleCopy = useCallback(async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(editedContent);
      setTimeout(() => setIsCopying(false), 1000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      setIsCopying(false);
    }
  }, [editedContent]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const blob = new Blob([editedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${processedText.videoId}_${processedText.sourceLanguage}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [editedContent, processedText]);

  const handleEdit = useCallback(() => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Save edited content
      // This could trigger an API call to update the file
    }
  }, [isEditing]);

  const handleReprocess = useCallback(() => {
    if (onReprocess) {
      onReprocess(processingOptions);
      setShowSettings(false);
    }
  }, [onReprocess, processingOptions]);

  const wordCount = editedContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Processed Text</h2>
          </div>
          <div className="flex items-center space-x-2">
            {editable && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Processing options"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleEdit}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={isEditing ? 'Save' : 'Edit'}
            >
              {isEditing ? <CheckCircle className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </button>
            <button
              onClick={handleCopy}
              disabled={isCopying}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed"
              title="Copy to clipboard"
            >
              {isCopying ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed"
              title="Download as text file"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Processing Options */}
        {showSettings && editable && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Processing Options</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={processingOptions.removeTimestamps}
                  onChange={(e) => setProcessingOptions(prev => ({ ...prev, removeTimestamps: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remove timestamps</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={processingOptions.mergeDuplicates}
                  onChange={(e) => setProcessingOptions(prev => ({ ...prev, mergeDuplicates: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Merge duplicate segments</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={processingOptions.formatParagraphs}
                  onChange={(e) => setProcessingOptions(prev => ({ ...prev, formatParagraphs: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Format into paragraphs</span>
              </label>
            </div>
            <button
              onClick={handleReprocess}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Reprocess with new settings
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium">Words</p>
            <p className="text-lg font-semibold text-blue-900">{wordCount.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">Characters</p>
            <p className="text-lg font-semibold text-green-900">{editedContent.length.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium">Reading Time</p>
            <p className="text-lg font-semibold text-purple-900">~{estimatedReadingTime} min</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-600 font-medium">Language</p>
            <p className="text-lg font-semibold text-orange-900">{processedText.sourceLanguage.toUpperCase()}</p>
          </div>
        </div>

        {/* Text Content */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your text here..."
            />
          ) : (
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              <pre className="whitespace-pre-wrap font-serif text-gray-900 leading-relaxed text-sm">
                {editedContent}
              </pre>
            </div>
          )}
        </div>

        {/* Processing Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Video ID: {processedText.videoId}</p>
          <p>Source file: {processedText.sourceFile}</p>
          <p>Output file: {processedText.outputFile}</p>
          <p>Processing time: {(processedText.processingDuration / 1000).toFixed(2)}s</p>
          <p>Processed at: {new Date(processedText.processedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}