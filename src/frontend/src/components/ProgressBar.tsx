/**
 * Progress Bar Component
 * Displays progress for long-running operations
 */

interface ProgressBarProps {
  progress: number; // 0-100
  message: string;
  showPercentage?: boolean;
  showETA?: boolean;
  estimatedTime?: number; // in seconds
  className?: string;
}

export function ProgressBar({
  progress,
  message,
  showPercentage = true,
  showETA = false,
  estimatedTime,
  className = ''
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const isLoading = progress > 0 && progress < 100;

  // Calculate ETA
  const eta = showETA && estimatedTime && progress > 0
    ? Math.round((estimatedTime / progress) * (100 - progress))
    : null;

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
          <span className="text-sm font-medium text-gray-700">{message}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {showPercentage && (
            <span>{Math.round(clampedProgress)}%</span>
          )}
          {eta !== null && (
            <span>~{eta}s remaining</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Animated shimmer effect when loading */}
          {isLoading && (
            <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
          )}
        </div>
      </div>

      {/* Status indicators */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div>
          {!isLoading && progress === 100 && (
            <span className="text-green-600 font-medium">✓ Complete</span>
          )}
        </div>
        {estimatedTime && (
          <span>Total: ~{estimatedTime}s</span>
        )}
      </div>
    </div>
  );
}