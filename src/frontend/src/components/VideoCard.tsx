/**
 * VideoCard Component - P02: YouTube Integration
 *
 * Displays processed video information and status
 */

import type { VideoProcess } from '../services/api';

interface VideoCardProps {
  video: VideoProcess;
  onProcess?: () => void;
  onReset?: () => void;
  showActions?: boolean;
}

export function VideoCard({ video, onProcess, onReset, showActions = true }: VideoCardProps) {
  const getStatusColor = (status: VideoProcess['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'downloading':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: VideoProcess['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'downloading':
        return 'Downloading';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with status */}
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-semibold">{video.title}</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(video.status)}`}
        >
          {getStatusLabel(video.status)}
        </span>
      </div>

      {/* Video information */}
      <div className="space-y-2">
        <div className="flex items-baseline">
          <span className="font-medium text-gray-700 w-32">Video ID:</span>
          <span className="text-gray-900 font-mono text-sm">{video.videoId}</span>
        </div>

        {video.downloadedLanguages.length > 0 && (
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-32">Downloaded:</span>
            <div className="flex flex-wrap gap-1">
              {video.downloadedLanguages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {video.processedLanguages.length > 0 && (
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-32">Processed:</span>
            <div className="flex flex-wrap gap-1">
              {video.processedLanguages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {video.importedAssetIds.length > 0 && (
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-32">Assets:</span>
            <span className="text-gray-900">{video.importedAssetIds.length} created</span>
          </div>
        )}

        <div className="flex items-baseline">
          <span className="font-medium text-gray-700 w-32">Updated:</span>
          <span className="text-gray-600 text-sm">
            {new Date(video.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (onProcess || onReset) && (
        <div className="flex gap-4 mt-6 pt-4 border-t">
          {onProcess && video.status !== 'processing' && (
            <button
              onClick={onProcess}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {video.status === 'completed' ? 'Process Again' : 'Process'}
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
