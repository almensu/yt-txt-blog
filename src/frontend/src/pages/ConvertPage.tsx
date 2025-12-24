import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useStore } from '../stores/useStore';
import { api, AI_PROVIDERS, type AIProvider, type TxtAsset } from '../services/api';
import { createToast } from '../components/Toast';
import type { StyleConfig } from '../services/api';

/**
 * Helper function to get the display title for an asset
 * Preferentially shows source_video_title for YouTube assets
 */
function getAssetDisplayTitle(asset: TxtAsset): string {
  if (asset.source_type === 'youtube' && asset.source_video_title) {
    return asset.source_video_title;
  }
  return asset.title;
}

export function ConvertPage() {
  const location = useLocation();
  const { assets, styles, selectedAssetId, selectedStyleId, setSelectedAsset, setSelectedStyle, addArticle, addToast } = useStore();
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // AI Provider selection state
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('zhipu');
  const [selectedModel, setSelectedModel] = useState<string>('glm-4.7');

  // Advanced options
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // 接收预选资产ID (P03: 从首页跳转)
  useEffect(() => {
    const preselectedId = location.state?.preselectedAssetId;
    if (preselectedId && !selectedAssetId) {
      // 验证资产是否存在
      const assetExists = assets.some(a => a.id === preselectedId);
      if (assetExists) {
        setSelectedAsset(preselectedId);
      }
    }
  }, [location.state, assets, selectedAssetId, setSelectedAsset]);

  // Update model when provider changes
  useEffect(() => {
    const provider = AI_PROVIDERS.find(p => p.id === selectedProvider);
    if (provider) {
      setSelectedModel(provider.defaultModel);
      // Reset thinking if provider doesn't support it
      if (!provider.supportsThinking) {
        setThinkingEnabled(false);
      }
    }
  }, [selectedProvider]);

  async function loadData() {
    try {
      const [assetsData, stylesData] = await Promise.all([
        api.assets.getAll(),
        api.styles.getAll(),
      ]);
      useStore.setState({ assets: assetsData, styles: stylesData });
    } catch (err) {
      addToast(createToast(err instanceof Error ? err.message : 'Failed to load data', 'error'));
    }
  }

  async function handleConvert() {
    if (!selectedAssetId || !selectedStyleId) {
      addToast(createToast('Please select both an asset and a style', 'error'));
      return;
    }
    try {
      setIsConverting(true);
      setResult(null);
      const article = await api.convert({
        asset_id: selectedAssetId,
        style_id: selectedStyleId,
        provider: selectedProvider,
        model: selectedModel,
        thinking_enabled: thinkingEnabled,
        temperature: temperature,
      });
      addArticle(article);
      setResult(article.content);
      addToast(createToast('Article converted successfully', 'success'));
    } catch (err) {
      addToast(createToast(err instanceof Error ? err.message : 'Conversion failed', 'error'));
    } finally {
      setIsConverting(false);
    }
  }

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">风格转换</h1>

      {/* Conversion Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">转换设置</h2>
        <div className="space-y-4">
          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择资产</label>
            <select
              value={selectedAssetId || ''}
              onChange={(e) => setSelectedAsset(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">请选择资产</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {getAssetDisplayTitle(asset)}
                </option>
              ))}
            </select>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择风格</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {styles.map((style: StyleConfig) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedStyleId === style.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{style.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI 提供商</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AI_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedProvider === provider.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                  {provider.supportsThinking && (
                    <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      支持思考模式
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          {currentProvider && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">模型选择</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                {currentProvider.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                当前选择: <span className="font-medium text-gray-700">{selectedModel}</span>
              </p>
            </div>
          )}

          {/* Advanced Options Toggle */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showAdvanced ? '▼' : '▶'} 高级选项
            </button>
          </div>

          {/* Advanced Options Panel */}
          {showAdvanced && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Thinking Mode Toggle */}
              {currentProvider?.supportsThinking && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">思考模式</label>
                    <p className="text-xs text-gray-500">启用后模型会先思考再回答，适合复杂任务</p>
                  </div>
                  <button
                    onClick={() => setThinkingEnabled(!thinkingEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      thinkingEnabled ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        thinkingEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Temperature Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">温度 (Temperature)</label>
                  <span className="text-sm text-gray-600">{temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>保守 (0.0)</span>
                  <span>平衡 (0.5)</span>
                  <span>创意 (1.0)</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  较低的温度使输出更确定性，较高的温度使输出更随机创意
                </p>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={!selectedAssetId || !selectedStyleId || isConverting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
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
          <h3 className="font-medium text-gray-900">{getAssetDisplayTitle(selectedAsset)}</h3>
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{selectedAsset.content}</p>
        </div>
      )}
    </div>
  );
}
