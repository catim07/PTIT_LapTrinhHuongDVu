import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

const STORAGE_KEY = 'lotte_compare_state';
const MAX_COMPARE_ITEMS = 4;

export interface CompareSelectionItem {
  product_id: string;
  branch_product_id?: string;
  name: string;
  image?: string;
  price?: number;
  original_price?: number;
  discount_percent?: number;
  brand?: string;
}

interface CompareState {
  items: CompareSelectionItem[];
}

const loadState = (): CompareState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return { items: [] };
    const safe = parsed.items
      .map((item: any) => ({
        product_id: String(item?.product_id || ''),
        branch_product_id: item?.branch_product_id ? String(item.branch_product_id) : undefined,
        name: String(item?.name || 'Sản phẩm'),
        image: item?.image ? String(item.image) : '',
        price: Number.isFinite(Number(item?.price)) ? Number(item.price) : undefined,
        original_price: Number.isFinite(Number(item?.original_price)) ? Number(item.original_price) : undefined,
        discount_percent: Number.isFinite(Number(item?.discount_percent)) ? Number(item.discount_percent) : undefined,
        brand: item?.brand ? String(item.brand) : '',
      }))
      .filter((item: CompareSelectionItem) => item.product_id);

    return { items: safe.slice(0, MAX_COMPARE_ITEMS) };
  } catch {
    return { items: [] };
  }
};

const saveState = (state: CompareState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
  } catch {
    // ignore storage errors
  }
};

const initialState: CompareState = loadState();

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addCompareItem: (state, action: PayloadAction<CompareSelectionItem>) => {
      const incoming = {
        ...action.payload,
        product_id: String(action.payload.product_id || ''),
      };

      if (!incoming.product_id) return;
      if (state.items.some((item) => item.product_id === incoming.product_id)) return;
      if (state.items.length >= MAX_COMPARE_ITEMS) return;

      state.items.push(incoming);
      saveState(state);
    },

    removeCompareItem: (state, action: PayloadAction<string>) => {
      const productId = String(action.payload || '');
      state.items = state.items.filter((item) => item.product_id !== productId);
      saveState(state);
    },

    clearCompareItems: (state) => {
      state.items = [];
      saveState(state);
    },
  },
});

export const { addCompareItem, removeCompareItem, clearCompareItems } = compareSlice.actions;

export const selectCompareItems = (state: any): CompareSelectionItem[] => state.compare?.items || [];
export const selectCompareIds = createSelector([selectCompareItems], (items) => items.map((item) => item.product_id));
export const selectCompareCount = createSelector([selectCompareItems], (items) => items.length);
export const selectCompareIsFull = createSelector([selectCompareCount], (count) => count >= MAX_COMPARE_ITEMS);
export const compareMaxItems = MAX_COMPARE_ITEMS;

export default compareSlice.reducer;
