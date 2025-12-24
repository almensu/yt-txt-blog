import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../stores/useStore';
import { AssetGrid } from '../components/AssetGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterTabs } from '../components/FilterTabs';
import { NewAssetCard } from '../components/NewAssetCard';

type FilterType = 'all' | 'youtube' | 'manual';

export function HomePage() {
  const navigate = useNavigate();
  const { assets } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  // 过滤逻辑
  const filteredAssets = assets.filter(asset => {
    const matchSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterType === 'all' || asset.source_type === filterType;
    return matchSearch && matchFilter;
  });

  // 新建资产处理
  const handleNewAsset = () => {
    navigate('/youtube');
  };

  // 卡片点击处理
  const handleCardClick = (assetId: string) => {
    navigate('/convert', {
      state: { preselectedAssetId: assetId, source: 'home' }
    });
  };

  // 初始化加载
  useEffect(() => {
    // 模拟加载完成
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SkeletonGrid />;
  }

  return (
    <div className="container mx-auto p-6">
      {/* 页面标题 */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold">我的资产</h1>
        <p className="text-gray-600 mt-2">
          共 {assets.length} 个资产，{filteredAssets.length} 个可见
        </p>
      </header>

      {/* 搜索和过滤 */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="搜索资产标题..."
        />
        <FilterTabs
          value={filterType}
          onChange={(value) => setFilterType(value as FilterType)}
          options={[
            { value: 'all', label: '全部', count: assets.length },
            { value: 'youtube', label: 'YouTube', count: assets.filter(a => a.source_type === 'youtube').length },
            { value: 'manual', label: '手动', count: assets.filter(a => a.source_type === 'manual').length },
          ]}
        />
      </div>

      {/* 资产网格 */}
      {filteredAssets.length === 0 && assets.length === 0 ? (
        <EmptyState onCreate={handleNewAsset} />
      ) : (
        <AssetGrid
          assets={filteredAssets}
          onCardClick={handleCardClick}
          leadingCard={<NewAssetCard onClick={handleNewAsset} />}
        />
      )}
    </div>
  );
}

// 空状态组件
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4"></div>
      <h2 className="text-xl font-semibold mb-2">还没有资产</h2>
      <p className="text-gray-600 mb-6">去创建你的第一个资产吧</p>
      <button
        onClick={onCreate}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        立即创建
      </button>
    </div>
  );
}

// 骨架屏
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4" />
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
