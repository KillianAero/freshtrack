export type ItemType = 'ingredient' | 'dish';

export type FreshnessStatus = 'fresh' | 'soon' | 'expired';

export type QuantityUnit = 'g' | 'kg' | 'mL' | 'L' | 'pièce(s)';

export interface FoodItem {
  id: string;
  name: string;
  type: ItemType;
  expiryDate: string; // ISO date string YYYY-MM-DD
  addedAt: string;    // ISO datetime
  emoji?: string;
  notes?: string;
  quantity?: number;
  unit?: QuantityUnit;
}

export interface AddItemForm {
  name: string;
  type: ItemType;
  expiryDate: string;
  emoji?: string;
  notes?: string;
  quantity?: number;
  unit?: QuantityUnit;
  // For dishes: cook date + shelf life days
  cookDate?: string;
  shelfLifeDays?: number;
}
