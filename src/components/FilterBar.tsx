type Filter = 'all' | 'ingredient' | 'dish' | 'expired';

interface Props {
  active: Filter;
  onChange: (f: Filter) => void;
  counts: { all: number; ingredient: number; dish: number; expired: number };
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'ingredient', label: '🛒 Ingrédients' },
  { key: 'dish', label: '🍳 Plats' },
  { key: 'expired', label: '⚠️ Périmés' },
];

export type { Filter };

export function FilterBar({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide">
      {FILTERS.map(({ key, label }) => {
        const count = counts[key];
        if (key !== 'all' && count === 0) return null;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              active === key
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {label}
            {count > 0 && (
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 ${
                  active === key ? 'bg-green-400' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
