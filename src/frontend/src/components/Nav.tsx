import { Link, useLocation } from 'react-router-dom';

export function Nav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              TXT转风格化文章
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/assets"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/assets')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              资产管理
            </Link>
            <Link
              to="/convert"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/convert')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              风格转换
            </Link>
            <Link
              to="/articles"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/articles')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              文章列表
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
