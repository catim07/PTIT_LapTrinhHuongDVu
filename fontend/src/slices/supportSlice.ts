import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SupportTicket, Message } from '../types';
import { dataService } from '../services/dataService';

export const loadTickets = createAsyncThunk(
  'support/loadTickets',
  async (_?: any) => {
    return await dataService.getSupportTickets();
  }
);

export const loadMessages = createAsyncThunk(
  'support/loadMessages',
  async (ticketId: string) => {
    const messages = await dataService.getMessages(ticketId);
    return { ticketId, messages };
  }
);

interface SupportState {
  tickets: SupportTicket[];
  messages: { [ticketId: string]: Message[] };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SupportState = { tickets: [], messages: {}, status: 'idle', error: null };

export const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    resetSupport: () => initialState,
    createTicket: (state, action: PayloadAction<SupportTicket>) => {
      state.tickets.unshift(action.payload);
      const tid = action.payload.id || action.payload._id;
      if (tid) state.messages[tid] = [];
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const tid = action.payload.ticket_id || action.payload.id || (action.payload as any)._id;
      if (!tid) return;
      if (!state.messages[tid]) {
        state.messages[tid] = [];
      }
      
      const incomingId = action.payload.id || (action.payload as any)._id;
      const isTemp = String(incomingId).startsWith('temp_');
      
      if (!isTemp) {
        // Remove optimistic messages once a real message arrives
        state.messages[tid] = state.messages[tid].filter(m => {
           const mId = m.id || (m as any)._id;
           return !String(mId).startsWith('temp_');
        });
      }
      
      // Prevent duplicates
      const exists = state.messages[tid].some(m => (m.id || (m as any)._id) === incomingId);
      if (!exists) {
        state.messages[tid].push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTickets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadTickets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tickets = action.payload;
      })
      .addCase(loadTickets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.messages[action.payload.ticketId] = action.payload.messages;
      });
  },
});

export const { createTicket, addMessage, resetSupport } = supportSlice.actions;
export default supportSlice.reducer;
