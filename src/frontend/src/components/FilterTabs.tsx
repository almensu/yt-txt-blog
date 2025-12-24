interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterTabsProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

export function FilterTabs({ value, onChange, options }: FilterTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            value === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
            value === option.value
              ? 'bg-blue-500'
              : 'bg-gray-200'
          }`}>
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}
