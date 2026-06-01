import { useState } from 'react';
import type { AddItemForm, ItemType, QuantityUnit } from '../types';

interface Props {
  onAdd: (form: AddItemForm) => void;
  onClose: () => void;
}

const INGREDIENT_EMOJIS = ['🥩', '🐟', '🥚', '🧀', '🥛', '🥦', '🥕', '🍅', '🧅', '🍋', '🍎', '🍞', '🧈', '🫙', '🌿', '🥬'];
const DISH_EMOJIS = ['🍲', '🥘', '🍝', '🍛', '🍜', '🥗', '🫕', '🍱', '🥙', '🌯', '🥫', '🍣'];

const SHELF_LIFE_OPTIONS = [
  { label: '1 jour', value: 1 },
  { label: '2 jours', value: 2 },
  { label: '3 jours', value: 3 },
  { label: '4 jours', value: 4 },
  { label: '5 jours', value: 5 },
  { label: '7 jours', value: 7 },
];

const UNITS: QuantityUnit[] = ['g', 'kg', 'mL', 'L', 'pièce(s)'];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function AddItemModal({ onAdd, onClose }: Props) {
  const [type, setType] = useState<ItemType>('ingredient');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cookDate, setCookDate] = useState(todayStr());
  const [shelfLifeDays, setShelfLifeDays] = useState(3);
  const [quantityStr, setQuantityStr] = useState('');
  const [unit, setUnit] = useState<QuantityUnit>('g');

  const emojis = type === 'ingredient' ? INGREDIENT_EMOJIS : DISH_EMOJIS;
  const selectedEmoji = emoji || emojis[0];

  const canSubmit = name.trim().length > 0 && (
    type === 'ingredient' ? expiryDate.length > 0 : cookDate.length > 0
  );

  const handleSubmit = () => {
    if (!canSubmit) return;
    const qty = quantityStr ? parseFloat(quantityStr) : undefined;
    onAdd({
      name: name.trim(),
      type,
      expiryDate,
      emoji: selectedEmoji,
      notes: notes.trim() || undefined,
      quantity: type === 'ingredient' && qty && !isNaN(qty) ? qty : undefined,
      unit: type === 'ingredient' && qty ? unit : undefined,
      cookDate: type === 'dish' ? cookDate : undefined,
      shelfLifeDays: type === 'dish' ? shelfLifeDays : undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl pb-safe-bottom shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pt-2 pb-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-800">Ajouter un élément</h2>

          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            {(['ingredient', 'dish'] as ItemType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setEmoji(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  type === t
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                {t === 'ingredient' ? '🛒 Ingrédient' : '🍳 Plat cuisiné'}
              </button>
            ))}
          </div>

          {/* Emoji picker */}
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
                      : 'bg-gray-100 hover:bg-gray-200'
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
              placeholder={type === 'ingredient' ? 'Ex: Lait demi-écrémé' : 'Ex: Poulet rôti'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Quantity — ingredients only */}
          {type === 'ingredient' && (
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

          {/* Date fields */}
          {type === 'ingredient' ? (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Date de péremption</p>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={todayStr()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Date de cuisson</p>
                <input
                  type="date"
                  value={cookDate}
                  onChange={(e) => setCookDate(e.target.value)}
                  max={todayStr()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Conservation au frigo
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SHELF_LIFE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setShelfLifeDays(opt.value)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        shelfLifeDays === opt.value
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {cookDate && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    → Expire le{' '}
                    {(() => {
                      const d = new Date(cookDate);
                      d.setDate(d.getDate() + shelfLifeDays);
                      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                    })()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Notes (optionnel)</p>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Ouvert, frigo haut..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-2xl text-base font-semibold transition-all ${
              canSubmit
                ? 'bg-green-500 text-white active:scale-[0.98] shadow-lg shadow-green-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
