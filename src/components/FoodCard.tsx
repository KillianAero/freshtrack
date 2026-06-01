import type { FoodItem } from '../types';
import { getFreshnessStatus, formatExpiryLabel, STATUS_COLORS, DEFAULT_EMOJIS } from '../utils/freshness';

interface Props {
  item: FoodItem;
  onClick: (item: FoodItem) => void;
}

export function FoodCard({ item, onClick }: Props) {
  const status = getFreshnessStatus(item.expiryDate);
  const colors = STATUS_COLORS[status];
  const emoji = item.emoji || DEFAULT_EMOJIS[item.type];
  const label = formatExpiryLabel(item.expiryDate);

  return (
    <button
      onClick={() => onClick(item)}
      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border ${colors.bg} ${colors.border} transition-all active:scale-[0.98] text-left`}
    >
      <div className="text-3xl w-10 h-10 flex items-center justify-center flex-shrink-0">
        {emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-800 truncate text-sm leading-tight">
            {item.name}
          </p>
          {item.quantity != null && item.unit && (
            <span className="flex-shrink-0 text-xs font-medium bg-white/80 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
              {item.quantity} {item.unit}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
          <span className={`text-xs font-medium ${colors.text}`}>{label}</span>
          {item.type === 'dish' && (
            <span className="text-xs text-gray-400 ml-1">· Plat</span>
          )}
        </div>
        {item.notes && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{item.notes}</p>
        )}
      </div>

      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
