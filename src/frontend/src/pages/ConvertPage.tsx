import { useEffect, useState } from 'react';
import { useStore } from '../stores/useStore';
import { api } from '../services/api';
import type { StyleConfig } from '../services/api';

export function ConvertPage() {
  const { assets, styles, selectedAssetId, selectedStyleId, setSelectedAsset, setSelectedStyle, setLoading, setError, addArticle } = useStore();
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [assetsData, stylesData] = await Promise.all([
        api.assets.getAll(),
        api.styles.getAll(),
      ]);
      useStore.setState({ assets: assetsData, styles: stylesData });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConvert() {
    if (!selectedAssetId || !selectedStyleId) return;
    try {
      setIsConverting(true);
      setResult(null);
      const article = await api.convert({ asset_id: selectedAssetId, style_id: selectedStyleId });
      addArticle(article);
      setResult(article.content);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsConverting(false);
    }
  }

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const selectedStyle = styles.find((s) => s.id === selectedStyleId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">风格转换</h1>

      {/* Conversion Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">转换设置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择资产</label>
            <select
              value={selectedAssetId || ''}
              onChange={(e) => setSelectedAsset(e.target.value || null)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择资产</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择风格</label>
            <div className="grid grid-cols-2 gap-4">
              {styles.map((style: StyleConfig) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedStyleId === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{style.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={!selectedAssetId || !selectedStyleId || isConverting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isConverting ? '转换中...' : '开始转换'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">转换结果</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {result}
            </pre>
          </div>
        </div>
      )}

      {/* Selected Asset Preview */}
      {selectedAsset && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">资产预览</h2>
          <h3 className="font-medium text-gray-900">{selectedAsset.title}</h3>
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{selectedAsset.content}</p>
        </div>
      )}
    </div>
  );
}
