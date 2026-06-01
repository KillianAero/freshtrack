import { useState } from 'react';
import type { FoodItem, QuantityUnit } from '../types';
import { getFreshnessStatus, DEFAULT_EMOJIS } from '../utils/freshness';

interface Props {
  items: FoodItem[];
  onUpdate: (id: string, updates: Partial<FoodItem>) => void;
}

const UNITS: QuantityUnit[] = ['g', 'kg', 'mL', 'L', 'pièce(s)'];

function QuantityEditor({ item, onUpdate }: { item: FoodItem; onUpdate: (id: string, updates: Partial<FoodItem>) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.quantity != null ? String(item.quantity) : '');
  const [unit, setUnit] = useState<QuantityUnit>(item.unit ?? 'g');

  const save = () => {
    const qty = parseFloat(val);
    if (!isNaN(qty) && qty >= 0) {
      onUpdate(item.id, { quantity: qty, unit });
    } else if (val === '') {
      onUpdate(item.id, { quantity: undefined, unit: undefined });
    }
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1 group"
      >
        {item.quantity != null && item.unit ? (
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full group-active:bg-green-100 group-active:text-green-700 transition-colors">
            {item.quantity} {item.unit}
          </span>
        ) : (
          <span className="text-xs text-gray-300 group-active:text-green-500 transition-colors">
            + quantité
          </span>
        )}
        <svg className="w-3 h-3 text-gray-300 group-active:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        autoFocus
        min="0"
        step="any"
        placeholder="Quantité"
        className="w-full px-3 py-2 rounded-xl border border-green-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div className="flex flex-wrap gap-1.5">
        {UNITS.map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              unit === u ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {u}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold"
        >
          OK
        </button>
        <button
          onClick={() => { setVal(item.quantity != null ? String(item.quantity) : ''); setEditing(false); }}
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

function InventoryCard({ item, onUpdate }: { item: FoodItem; onUpdate: (id: string, updates: Partial<FoodItem>) => void }) {
  const status = getFreshnessStatus(item.expiryDate);
  const emoji = item.emoji || DEFAULT_EMOJIS[item.type];

  return (
    <div className="p-3.5 rounded-2xl border bg-white border-gray-100">
      <div className="flex items-start gap-3">
        <div className="text-2xl w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
            {status === 'soon' && (
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400" title="Bientôt périmé" />
            )}
          </div>
          {item.type === 'ingredient' && (
            <QuantityEditor item={item} onUpdate={onUpdate} />
          )}
          {item.notes && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{item.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

type SortOrder = 'added' | 'alpha';

interface SectionProps {
  title: string;
  icon: string;
  items: FoodItem[];
  sort: SortOrder;
  onUpdate: (id: string, updates: Partial<FoodItem>) => void;
}

function Section({ title, icon, items, sort, onUpdate }: SectionProps) {
  if (items.length === 0) return null;

  const sorted = sort === 'alpha'
    ? [...items].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    : items;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-base">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h2>
        <span className="text-xs text-gray-400 ml-auto">{items.length}</span>
      </div>
      <div className="space-y-2">
        {sorted.map((item) => (
          <InventoryCard key={item.id} item={item} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

export function InventoryPage({ items, onUpdate }: Props) {
  const [sort, setSort] = useState<SortOrder>('added');
  const available = items.filter((i) => getFreshnessStatus(i.expiryDate) !== 'expired');
  const ingredients = available.filter((i) => i.type === 'ingredient');
  const dishes = available.filter((i) => i.type === 'dish');

  if (available.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-8">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-lg font-semibold text-gray-700 mb-1">Inventaire vide</p>
        <p className="text-sm text-gray-400">
          Ajoute des ingrédients et des plats pour les voir ici
        </p>
      </div>
    );
  }

  const totalWithQty = ingredients.filter((i) => i.quantity != null).length;

  return (
    <div className="px-4 pb-28">
      {/* Summary */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{ingredients.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ingrédient{ingredients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{dishes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Plat{dishes.length !== 1 ? 's' : ''} cuisiné{dishes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{totalWithQty}</p>
          <p className="text-xs text-gray-500 mt-0.5">Avec quantité</p>
        </div>
      </div>

      {/* Sort toggle */}
      <div className="flex justify-end mb-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setSort('added')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sort === 'added' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400'
            }`}
          >
            Récent
          </button>
          <button
            onClick={() => setSort('alpha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sort === 'alpha' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400'
            }`}
          >
            A → Z
          </button>
        </div>
      </div>

      <Section title="Ingrédients" icon="🛒" items={ingredients} sort={sort} onUpdate={onUpdate} />
      <Section title="Plats cuisinés" icon="🍳" items={dishes} sort={sort} onUpdate={onUpdate} />
    </div>
  );
}
