import { useEffect, useState } from 'react';
import { useStore } from '../stores/useStore';
import { api } from '../services/api';
import type { GeneratedArticle } from '../services/api';

export function ArticlesPage() {
  const { articles, setArticles, removeArticle, setLoading, setError } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.articles.getAll();
      setArticles(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此文章？')) return;
    try {
      await api.articles.delete(id);
      removeArticle(id);
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">生成的文章</h1>
        <button onClick={loadArticles} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
          刷新
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          暂无生成的文章
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article: GeneratedArticle) => (
            <div key={article.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">{article.asset_title}</h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        {article.style_name}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      创建于: {new Date(article.created_at).toLocaleString('zh-CN')}
                    </p>
                    <p className="text-xs text-gray-400">模型: {article.model}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(expandedId === article.id ? null : article.id);
                      }}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      {expandedId === article.id ? '收起' : '展开'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(article.id);
                      }}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === article.id && (
                <div className="border-t p-6 bg-gray-50">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {article.content}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
