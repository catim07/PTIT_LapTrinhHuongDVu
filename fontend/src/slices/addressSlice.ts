import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserAddress } from '../types';
import { dataService } from '../services/dataService';

export const loadAddresses = createAsyncThunk(
  'address/loadAddresses',
  async () => {
    return await dataService.getAddresses();
  }
);

interface AddressState {
  data: UserAddress[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AddressState = { data: [], status: 'idle', error: null };

export const addAddressThunk = createAsyncThunk(
  'address/addAddress',
  async (payload: any) => {
    return await dataService.createAddress(payload);
  }
);

export const updateAddressThunk = createAsyncThunk(
  'address/updateAddress',
  async ({ id, payload }: { id: string, payload: any }) => {
    return await dataService.updateAddress(id, payload);
  }
);

export const removeAddressThunk = createAsyncThunk(
  'address/removeAddress',
  async (id: string) => {
    return await dataService.deleteAddress(id);
  }
);

export const setDefaultAddressThunk = createAsyncThunk(
  'address/setDefaultAddress',
  async (id: string) => {
    return await dataService.setDefaultAddress(id);
  }
);

export const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    resetAddresses: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAddresses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(loadAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addAddressThunk.fulfilled, (state, action) => {
        if (action.payload.is_default) {
          state.data.forEach(a => a.is_default = false);
        }
        state.data.push(action.payload);
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        const index = state.data.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          if (action.payload.is_default) {
            state.data.forEach(a => a.is_default = false);
          }
          state.data[index] = action.payload;
        }
      })
      .addCase(removeAddressThunk.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        state.data.forEach(a => {
          a.is_default = String(a.id) === String(action.payload.id);
        });
      });
  },
});

export const { resetAddresses } = addressSlice.actions;
export default addressSlice.reducer;
