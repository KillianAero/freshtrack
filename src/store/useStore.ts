import { useState, useCallback, useEffect } from 'react';
import type { FoodItem, AddItemForm } from '../types';
import { supabase } from '../lib/supabase';

// Map DB snake_case row → FoodItem camelCase
function rowToItem(row: Record<string, unknown>): FoodItem {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as FoodItem['type'],
    expiryDate: row.expiry_date as string,
    addedAt: row.added_at as string,
    emoji: (row.emoji as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    quantity: (row.quantity as number) ?? undefined,
    unit: (row.unit as FoodItem['unit']) ?? undefined,
  };
}

export function useStore() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('food_items')
      .select('*')
      .order('added_at', { ascending: false });
    if (data) setItems(data.map(rowToItem));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') fetchItems();
      if (event === 'SIGNED_OUT') { setItems([]); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [fetchItems]);

  const addItem = useCallback(async (form: AddItemForm) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let expiryDate = form.expiryDate;
    if (form.type === 'dish' && form.cookDate && form.shelfLifeDays) {
      const cook = new Date(form.cookDate);
      cook.setDate(cook.getDate() + form.shelfLifeDays);
      expiryDate = cook.toISOString().split('T')[0];
    }

    const { data } = await supabase
      .from('food_items')
      .insert({
        user_id: user.id,
        name: form.name,
        type: form.type,
        expiry_date: expiryDate,
        emoji: form.emoji ?? null,
        notes: form.notes ?? null,
        quantity: form.quantity ?? null,
        unit: form.unit ?? null,
      })
      .select()
      .single();

    if (data) setItems((prev) => [rowToItem(data), ...prev]);
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await supabase.from('food_items').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<FoodItem>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji ?? null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null;
    if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity ?? null;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit ?? null;

    await supabase.from('food_items').update(dbUpdates).eq('id', id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  return { items, loading, addItem, removeItem, updateItem };
}
