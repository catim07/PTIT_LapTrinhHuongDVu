import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../types';
import { dataService } from '../services/dataService';

export const loadOrders = createAsyncThunk(
  'orders/loadOrders',
  async (_: any) => {
    return await dataService.getOrders();
  }
);

interface OrderState {
  data: Order[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: OrderState = { data: [], status: 'idle', error: null };

export const cancelOrderThunk = createAsyncThunk(
  'orders/cancelOrderThunk',
  async ({id, reason}: {id: string, reason: string}) => {
    return await dataService.cancelOrder(id, reason);
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrders: () => initialState,
    createOrder: (state, action: PayloadAction<Order>) => {
      state.data.unshift(action.payload);
    },
    cancelOrder: (state, action: PayloadAction<string>) => {
      const order = state.data.find(o => String(o.id) === action.payload);
      if (order && ['PENDING', 'CONFIRMED'].includes(order.status)) {
        order.status = 'CANCELLED';
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        const orderIndex = state.data.findIndex(o => String(o.id) === String(action.payload.id));
        if (orderIndex !== -1) {
          state.data[orderIndex] = action.payload;
        }
      });
  },
});

export const { createOrder, cancelOrder, resetOrders } = orderSlice.actions;
export default orderSlice.reducer;
