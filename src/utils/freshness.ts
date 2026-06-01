import type { FreshnessStatus } from '../types';

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / 86400000);
}

export function getFreshnessStatus(expiryDate: string): FreshnessStatus {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 3) return 'soon';
  return 'fresh';
}

export function formatExpiryLabel(expiryDate: string): string {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return `Périmé depuis ${Math.abs(days)}j`;
  if (days === 0) return "Expire aujourd'hui";
  if (days === 1) return 'Expire demain';
  if (days <= 7) return `Dans ${days} jours`;
  const date = new Date(expiryDate);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export const STATUS_COLORS: Record<FreshnessStatus, { bg: string; text: string; dot: string; border: string }> = {
  fresh: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    border: 'border-green-200',
  },
  soon: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-400',
    border: 'border-orange-200',
  },
  expired: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    border: 'border-red-200',
  },
};

export const DEFAULT_EMOJIS: Record<string, string> = {
  ingredient: '🥩',
  dish: '🍲',
};
