/**
 * SubtitleSelector Component - P02: YouTube Integration
 *
 * Language selection dropdown for YouTube subtitles
 */

interface SubtitleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  availableLanguages?: string[];
  disabled?: boolean;
}

const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'zh-Hans', name: '中文（简体）' },
  { code: 'zh-Hant', name: '中文（繁體）' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
];

export function SubtitleSelector({
  value,
  onChange,
  availableLanguages,
  disabled = false,
}: SubtitleSelectorProps) {
  // Use available languages if provided, otherwise use defaults
  const languages = availableLanguages
    ? DEFAULT_LANGUAGES.filter((lang) => availableLanguages.includes(lang.code))
    : DEFAULT_LANGUAGES;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          px-4 py-2 pr-10 border rounded-lg appearance-none
          focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
          transition-colors
          ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900'}
        `}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      {/* Custom arrow icon */}
      <div
        className={`
          absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none
          ${disabled ? 'text-gray-400' : 'text-gray-600'}
        `}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
