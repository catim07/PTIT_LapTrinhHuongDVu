import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Coupon } from '../types';
import { dataService } from '../services/dataService';

export const loadCoupons = createAsyncThunk(
  'coupon/loadCoupons',
  async () => {
    return await dataService.getCoupons();
  }
);

interface CouponState {
  data: Coupon[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CouponState = {
  data: [],
  status: 'idle',
  error: null,
};

export const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCoupons.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadCoupons.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(loadCoupons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export default couponSlice.reducer;
