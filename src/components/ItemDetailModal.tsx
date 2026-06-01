import { useState, useEffect } from 'react';
import type { FoodItem, QuantityUnit } from '../types';

interface Props {
  item: FoodItem;
  onUpdate: (id: string, updates: Partial<FoodItem>) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

const INGREDIENT_EMOJIS = ['🥩', '🐟', '🥚', '🧀', '🥛', '🥦', '🥕', '🍅', '🧅', '🍋', '🍎', '🍞', '🧈', '🫙', '🌿', '🥬'];
const DISH_EMOJIS = ['🍲', '🥘', '🍝', '🍛', '🍜', '🥗', '🫕', '🍱', '🥙', '🌯', '🥫', '🍣'];
const UNITS: QuantityUnit[] = ['g', 'kg', 'mL', 'L', 'pièce(s)'];

type Screen = 'actions' | 'edit';

export function ItemDetailModal({ item, onUpdate, onRemove, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const [screen, setScreen] = useState<Screen>('actions');
  const [usedDone, setUsedDone] = useState(false);

  // Edit fields
  const [name, setName] = useState(item.name);
  const [emoji, setEmoji] = useState(item.emoji || '');
  const [expiryDate, setExpiryDate] = useState(item.expiryDate);
  const [quantityStr, setQuantityStr] = useState(item.quantity != null ? String(item.quantity) : '');
  const [unit, setUnit] = useState<QuantityUnit>(item.unit ?? 'g');
  const [notes, setNotes] = useState(item.notes ?? '');

  const emojis = item.type === 'ingredient' ? INGREDIENT_EMOJIS : DISH_EMOJIS;
  const selectedEmoji = emoji || emojis[0];

  const handleUsed = () => {
    setUsedDone(true);
    setTimeout(() => { onRemove(item.id); onClose(); }, 700);
  };

  const handleSave = () => {
    const qty = quantityStr ? parseFloat(quantityStr) : undefined;
    onUpdate(item.id, {
      name: name.trim() || item.name,
      emoji: selectedEmoji,
      expiryDate,
      notes: notes.trim() || undefined,
      quantity: item.type === 'ingredient' && qty && !isNaN(qty) ? qty : undefined,
      unit: item.type === 'ingredient' && qty ? unit : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[92vh]" style={{ overscrollBehavior: 'contain' }} onTouchMove={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {screen === 'actions' ? (
          <div className="px-5 pt-2 pb-8 space-y-3">
            {/* Item header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{item.emoji || (item.type === 'ingredient' ? '🥩' : '🍲')}</span>
              <div>
                <p className="font-bold text-gray-800 text-base">{item.name}</p>
                {item.quantity != null && item.unit && (
                  <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                )}
              </div>
            </div>

            {/* Used */}
            <button
              onClick={handleUsed}
              disabled={usedDone}
              className={`w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${
                usedDone
                  ? 'bg-green-400 text-white'
                  : 'bg-green-50 text-green-700 border border-green-200 active:scale-[0.98]'
              }`}
            >
              {usedDone ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Marqué comme utilisé !
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Marquer comme utilisé
                </>
              )}
            </button>

            {/* Edit */}
            <button
              onClick={() => setScreen('edit')}
              className="w-full py-4 rounded-2xl text-base font-semibold bg-gray-50 text-gray-700 border border-gray-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>

            {/* Delete */}
            <button
              onClick={() => { onRemove(item.id); onClose(); }}
              className="w-full py-4 rounded-2xl text-base font-semibold bg-red-50 text-red-600 border border-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          </div>
        ) : (
          <div className="px-5 pt-2 pb-8 space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setScreen('actions')} className="text-gray-400 p-1 -ml-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-gray-800">Modifier</h2>
            </div>

            {/* Emoji */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Icône</p>
              <div className="flex flex-wrap gap-2">
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      selectedEmoji === e
                        ? 'bg-green-100 ring-2 ring-green-500 scale-110'
                        : 'bg-gray-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Nom</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>

            {/* Quantity — ingredients only */}
            {item.type === 'ingredient' && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Quantité <span className="normal-case text-gray-400">(optionnel)</span>
                </p>
                <input
                  type="number"
                  value={quantityStr}
                  onChange={(e) => setQuantityStr(e.target.value)}
                  placeholder="Ex: 500"
                  min="0"
                  step="any"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {UNITS.map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        unit === u ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Expiry date */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                {item.type === 'ingredient' ? 'Date de péremption' : "Date d'expiration"}
              </p>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Notes</p>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Ouvert, frigo haut..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-4 rounded-2xl text-base font-semibold bg-green-500 text-white active:scale-[0.98] shadow-lg shadow-green-200 transition-all"
            >
              Enregistrer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
