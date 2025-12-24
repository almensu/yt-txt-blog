interface NewAssetCardProps {
  onClick: () => void;
}

export function NewAssetCard({ onClick }: NewAssetCardProps) {
  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center min-h-[280px]"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <PlusIcon className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="font-semibold text-blue-900">新建资产</h3>
      <p className="text-sm text-blue-700 mt-1">从 YouTube 导入或手动创建</p>
    </button>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
