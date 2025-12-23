import { useEffect, useState } from 'react';
import { useStore } from '../stores/useStore';
import { api } from '../services/api';
import type { TxtAsset } from '../services/api';

export function AssetsPage() {
  const { assets, setAssets, addAsset, removeAsset, setLoading, setError } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newAsset, setNewAsset] = useState({ title: '', content: '' });

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.assets.getAll();
      setAssets(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newAsset.title.trim() || !newAsset.content.trim()) return;
    try {
      setIsCreating(true);
      const asset = await api.assets.create(newAsset);
      addAsset(asset);
      setNewAsset({ title: '', content: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此资产？')) return;
    try {
      await api.assets.delete(id);
      removeAsset(id);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">TXT 资产管理</h1>
      </div>

      {/* Create Asset Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">创建新资产</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="标题"
            value={newAsset.title}
            onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="内容"
            rows={6}
            value={newAsset.content}
            onChange={(e) => setNewAsset({ ...newAsset, content: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleCreate}
            disabled={isCreating || !newAsset.title.trim() || !newAsset.content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isCreating ? '创建中...' : '创建资产'}
          </button>
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">资产列表 ({assets.length})</h2>
        </div>
        {assets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">暂无资产</div>
        ) : (
          <div className="divide-y">
            {assets.map((asset: TxtAsset) => (
              <div key={asset.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{asset.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{asset.content.slice(0, 200)}...</p>
                    <p className="mt-2 text-xs text-gray-400">创建于: {new Date(asset.created_at).toLocaleString('zh-CN')}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
