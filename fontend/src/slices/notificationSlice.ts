import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Notification } from '../types';
import { dataService } from '../services/dataService';

export const loadNotifications = createAsyncThunk(
  'notification/loadNotifications',
  async () => {
    return await dataService.getNotifications();
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async ({ notificationId }: { notificationId: number | string }, { dispatch }) => {
    await dataService.markNotificationRead(notificationId);
    dispatch(loadNotifications());
    return notificationId;
  }
);

export const markAllRead = createAsyncThunk(
  'notification/markAllRead',
  async (_, { dispatch }) => {
    await dataService.markAllNotificationsRead();
    dispatch(loadNotifications());
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async ({ notificationId }: { notificationId: number | string }, { dispatch }) => {
    await dataService.deleteNotification(notificationId);
    dispatch(loadNotifications());
    return notificationId;
  }
);

interface NotificationState {
  data: Notification[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotificationState = {
  data: [],
  status: 'idle',
  error: null
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    resetNotifications: () => initialState,
    addNotification: (state, action) => {
      // Add the new notification to the beginning of the list
      state.data.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const { resetNotifications, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
