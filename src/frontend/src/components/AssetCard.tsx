import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TxtAsset } from '../services/api';

interface AssetCardProps {
  asset: TxtAsset;
  onClick: () => void;
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const isYouTube = asset.source_type === 'youtube';
  const thumbnailUrl = isYouTube && asset.source_video_id
    ? `https://img.youtube.com/vi/${asset.source_video_id}/mqdefault.jpg`
    : null;

  const timeAgo = formatDistanceToNow(new Date(asset.created_at), {
    addSuffix: true,
    locale: zhCN,
  });

  const displayTitle = asset.source_video_title || asset.title;
  const contentPreview = asset.content?.slice(0, 100) || '';

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden text-left hover:-translate-y-1"
    >
      {/* 缩略图或占位 */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <DocumentIcon className="w-12 h-12" />
          </div>
        )}

        {/* 来源标签 */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isYouTube
              ? 'bg-red-500 text-white'
              : 'bg-gray-700 text-white'
          }`}>
            {isYouTube ? 'YouTube' : '手动'}
          </span>
        </div>

        {/* 语言标签 */}
        {asset.source_language && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded bg-black/50 text-white text-xs">
              {asset.source_language.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="p-4">
        {/* 标题 */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
          {displayTitle}
        </h3>

        {/* 预览 */}
        {contentPreview && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {contentPreview}
          </p>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{timeAgo}</span>
          <span className="text-blue-600 font-medium group-hover:underline">
            立即转换 →
          </span>
        </div>
      </div>
    </button>
  );
}

// 图标组件
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
