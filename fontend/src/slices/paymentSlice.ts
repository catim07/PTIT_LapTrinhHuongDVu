import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PaymentMethod, PaymentTransaction } from '../types';
import { dataService } from '../services/dataService';

export const loadPaymentMethods = createAsyncThunk(
  'payment/loadMethods',
  async (_?: any) => {
    return await dataService.getPaymentMethods();
  }
);

export const loadPaymentTransactions = createAsyncThunk(
  'payment/loadTransactions',
  async (orderId?: string) => {
    return await dataService.getPaymentTransactions(orderId);
  }
);

export const setDefaultPayment = createAsyncThunk(
  'payment/setDefault',
  async ({ methodId }: { methodId: string; userId?: number }) => {
    return await dataService.setDefaultPaymentMethod(methodId);
  }
);

export const addPaymentMethod = createAsyncThunk(
  'payment/add',
  async (payload: Partial<PaymentMethod>) => {
    return await dataService.addPaymentMethod(payload);
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'payment/delete',
  async (methodId: string) => {
    await dataService.deletePaymentMethod(methodId);
    return methodId;
  }
);

interface PaymentState {
  methods: PaymentMethod[];
  transactions: PaymentTransaction[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PaymentState = { methods: [], transactions: [], status: 'idle', error: null };

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPayment: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPaymentMethods.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadPaymentMethods.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.methods = action.payload;
      })
      .addCase(loadPaymentMethods.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(loadPaymentTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(setDefaultPayment.fulfilled, (state, action) => {
        state.methods = action.payload;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.methods.push(action.payload);
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.methods = state.methods.filter(m => m.id !== action.payload);
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
