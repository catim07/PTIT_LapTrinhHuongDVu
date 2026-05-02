import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LoyaltyTransaction } from '../types';
import { dataService } from '../services/dataService';

export const loadLoyaltyTransactions = createAsyncThunk(
  'loyalty/loadTransactions',
  async () => {
    // Backend uses token to determine user — no userId needed
    return await dataService.getLoyaltyTransactions();
  }
);

interface LoyaltyState {
  transactions: LoyaltyTransaction[];
  totalPoints: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LoyaltyState = { transactions: [], totalPoints: 0, status: 'idle', error: null };

export const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    resetLoyalty: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLoyaltyTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadLoyaltyTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.transactions = action.payload;
        state.totalPoints = action.payload.reduce((sum, t) => sum + t.points, 0);
      })
      .addCase(loadLoyaltyTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const { resetLoyalty } = loyaltySlice.actions;
export default loyaltySlice.reducer;
