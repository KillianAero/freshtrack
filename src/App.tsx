import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';
import { getFreshnessStatus, getDaysUntilExpiry } from './utils/freshness';
import { requestNotificationPermission, checkExpiryNotifications, getNotificationPermission } from './utils/notifications';
import { FoodCard } from './components/FoodCard';
import { AddItemModal } from './components/AddItemModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { Header } from './components/Header';
import { FilterBar, type Filter } from './components/FilterBar';
import { InventoryPage } from './pages/InventoryPage';
import { LoginPage } from './pages/LoginPage';
import type { FoodItem } from './types';

type Tab = 'suivi' | 'inventaire';

function LoadingScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50 items-center justify-center gap-4">
      <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center shadow-lg shadow-green-300/50 animate-pulse">
        <span className="text-3xl">🥗</span>
      </div>
      <p className="text-sm text-gray-500">Chargement...</p>
    </div>
  );
}

function MainApp() {
  const { items, loading, addItem, removeItem, updateItem } = useStore();
  const { user, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [tab, setTab] = useState<Tab>('suivi');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) checkExpiryNotifications(items);
  }, [items, loading]);

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate)),
    [items]
  );

  const counts = useMemo(() => ({
    all: items.length,
    ingredient: items.filter((i) => i.type === 'ingredient').length,
    dish: items.filter((i) => i.type === 'dish').length,
    expired: items.filter((i) => getFreshnessStatus(i.expiryDate) === 'expired').length,
  }), [items]);

  const expiringSoon = useMemo(
    () => items.filter((i) => getFreshnessStatus(i.expiryDate) === 'soon').length,
    [items]
  );

  const filtered = useMemo(() => {
    let list = sorted;
    switch (filter) {
      case 'ingredient': list = sorted.filter((i) => i.type === 'ingredient'); break;
      case 'dish': list = sorted.filter((i) => i.type === 'dish'); break;
      case 'expired': list = sorted.filter((i) => getFreshnessStatus(i.expiryDate) === 'expired'); break;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [sorted, filter, search]);

  const handleRequestNotif = async () => {
    await requestNotificationPermission();
    setNotifPermission(getNotificationPermission());
    checkExpiryNotifications(items);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="safe-top" />

      <Header
        totalItems={items.length}
        expiringSoon={expiringSoon}
        expired={counts.expired}
        showSearchButton={tab === 'suivi' && items.length > 0}
        onSearchToggle={() => { setShowSearch((v) => !v); setSearch(''); }}
        searchActive={showSearch}
        user={user}
        onSignOut={signOut}
      />

      {notifPermission === 'default' && tab === 'suivi' && (
        <div className="mx-4 mb-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <span className="text-xl flex-shrink-0">🔔</span>
          <p className="flex-1 text-xs text-amber-800">
            Activer les notifications pour être alerté avant péremption
          </p>
          <button
            onClick={handleRequestNotif}
            className="flex-shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
          >
            Activer
          </button>
        </div>
      )}

      {showSearch && tab === 'suivi' && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un ingrédient..."
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {tab === 'suivi' && items.length > 0 && (
        <FilterBar active={filter} onChange={setFilter} counts={counts} />
      )}

      <div className="flex-1 overflow-y-auto">
        {tab === 'suivi' ? (
          <div className="px-4 pb-24 space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="text-6xl mb-4">{items.length === 0 ? '🛒' : '✅'}</div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  {search ? 'Aucun résultat' : items.length === 0 ? "Rien pour l'instant" : 'Rien ici'}
                </p>
                <p className="text-sm text-gray-400">
                  {search
                    ? `Aucun élément pour "${search}"`
                    : items.length === 0
                    ? 'Commence par ajouter un ingrédient ou un plat cuisiné'
                    : 'Aucun élément dans cette catégorie'}
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <FoodCard key={item.id} item={item} onClick={setSelectedItem} />
              ))
            )}
          </div>
        ) : (
          <InventoryPage items={items} onUpdate={updateItem} />
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom bg-white border-t border-gray-100 shadow-lg">
        <div className="flex">
          <button
            onClick={() => setTab('suivi')}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
              tab === 'suivi' ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-[10px] font-medium">Suivi</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex flex-col items-center justify-center py-1"
          >
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-300/50 active:scale-95 transition-transform -mt-5">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-gray-400 mt-0.5">Ajouter</span>
          </button>

          <button
            onClick={() => setTab('inventaire')}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
              tab === 'inventaire' ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[10px] font-medium">Inventaire</span>
          </button>
        </div>
      </div>

      {showModal && (
        <AddItemModal onAdd={addItem} onClose={() => setShowModal(false)} />
      )}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onUpdate={updateItem}
          onRemove={removeItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;
  return <MainApp />;
}

export default App;
