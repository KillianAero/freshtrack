import type { User } from '@supabase/supabase-js';

interface Props {
  totalItems: number;
  expiringSoon: number;
  expired: number;
  showSearchButton?: boolean;
  searchActive?: boolean;
  onSearchToggle?: () => void;
  user?: User | null;
  onSignOut?: () => void;
}

export function Header({ totalItems, expiringSoon, expired, showSearchButton, searchActive, onSearchToggle, user, onSignOut }: Props) {
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0];

  return (
    <div className="px-5 pt-4 pb-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">FreshTrack</h1>
          <p className="text-sm text-gray-500">{totalItems} élément{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {showSearchButton && (
            <button
              onClick={onSearchToggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                searchActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
              </svg>
            </button>
          )}

          {/* User avatar / logout */}
          {user && (
            <button
              onClick={onSignOut}
              title={`Déconnexion (${firstName ?? user.email})`}
              className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm active:scale-95 transition-transform"
            >
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                  {(firstName ?? user.email ?? 'U')[0].toUpperCase()}
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {(expiringSoon > 0 || expired > 0) && (
        <div className="flex gap-2">
          {expired > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-700">
                {expired} périmé{expired !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {expiringSoon > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 rounded-full">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-xs font-medium text-orange-700">
                {expiringSoon} bientôt
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
