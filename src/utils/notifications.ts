import type { FoodItem } from '../types';
import { getDaysUntilExpiry } from './freshness';

const NOTIF_KEY = 'freshtrack_notified';

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getNotifiedToday(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return new Set();
    const { date, ids } = JSON.parse(raw);
    if (date !== getTodayKey()) return new Set();
    return new Set(ids as string[]);
  } catch {
    return new Set();
  }
}

function saveNotifiedToday(ids: Set<string>) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify({ date: getTodayKey(), ids: [...ids] }));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function checkExpiryNotifications(items: FoodItem[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const notified = getNotifiedToday();
  const toNotify = items.filter((item) => {
    if (notified.has(item.id)) return false;
    const days = getDaysUntilExpiry(item.expiryDate);
    return days >= 0 && days <= 2;
  });

  if (toNotify.length === 0) return;

  if (toNotify.length === 1) {
    const item = toNotify[0];
    const days = getDaysUntilExpiry(item.expiryDate);
    const body = days === 0
      ? "Expire aujourd'hui !"
      : days === 1
      ? 'Expire demain'
      : 'Expire dans 2 jours';
    new Notification(`${item.emoji || '⚠️'} ${item.name}`, { body, icon: '/icons/icon-192.png' });
  } else {
    new Notification(`FreshTrack — ${toNotify.length} éléments à consommer`, {
      body: toNotify.map((i) => i.name).join(', '),
      icon: '/icons/icon-192.png',
    });
  }

  toNotify.forEach((i) => notified.add(i.id));
  saveNotifiedToday(notified);
}
