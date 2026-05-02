import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Promotion, HotDeal } from '../types';
import { dataService } from '../services/dataService';

export const fetchPromotions = createAsyncThunk(
  'promotions/fetchPromotions',
  async () => {
    const data = await dataService.getPromotions();
    return data;
  }
);

export const fetchHotDeals = createAsyncThunk(
  'promotions/fetchHotDeals',
  async () => {
    const data = await dataService.getHotDeals();
    return data;
  }
);

export interface PromotionsFilters {
  category?: string;
  sort?: string;
  search?: string;
  onlyEco?: boolean;
}

interface PromotionsState {
  data: Promotion[];
  hotDeals: HotDeal[];
  filters: PromotionsFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedBranchId: string;
}

const initialState: PromotionsState = {
  data: [],
  hotDeals: [],
  filters: {
    sort: 'Mới nhất'
  },
  status: 'idle',
  error: null,
  selectedBranchId: '', // Will be set from branch slice or user context
};

export const promotionsSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PromotionsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedBranchId: (state, action: PayloadAction<string>) => {
      state.selectedBranchId = action.payload;
    },
    applyLocalUpdate: (state, action: PayloadAction<{ id: number, expired: boolean }>) => {
      // Could be used to locally mark as expired without refetching
      const target = state.data.find(p => p.id === action.payload.id);
      if (target && action.payload.expired) {
        // Example: mark expired
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromotions.pending, (state) => {
        if (state.status === 'idle') state.status = 'loading';
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(fetchHotDeals.fulfilled, (state, action) => {
        state.hotDeals = action.payload;
      });
  },
});

export const { setFilters, setSelectedBranchId, applyLocalUpdate } = promotionsSlice.actions;
export default promotionsSlice.reducer;
