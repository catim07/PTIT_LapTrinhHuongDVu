import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Review } from '../types';
import { dataService } from '../services/dataService';

export const fetchReviewsForProduct = createAsyncThunk(
  'review/fetchReviews',
  async (productId: number | string) => {
    return await dataService.getReviewsForProduct(productId);
  }
);

export const loadUserReviews = createAsyncThunk(
  'review/loadUserReviews',
  async (_?: any) => {
    return await dataService.getReviews();
  }
);

export const addReview = createAsyncThunk(
  'review/addReview',
  async ({ productId, payload }: { productId: number | string, payload: any }) => {
    return await dataService.postReview(productId, payload);
  }
);

export const replyToReview = createAsyncThunk(
  'review/replyToReview',
  async ({ reviewId, payload }: { reviewId: string | number, payload: any }) => {
    const reply = await dataService.replyToReview(reviewId, payload);
    return { reviewId, reply };
  }
);

interface ReviewState {
  data: Record<string, Review[]>;
  userReviews: Review[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReviewState = {
  data: {},
  userReviews: [],
  status: 'idle',
  error: null,
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    resetReviews: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsForProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviewsForProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const pid = String(action.meta.arg);
        const reviews = Array.isArray(action.payload) ? action.payload : [];
        state.data[pid] = reviews;
      })
      .addCase(fetchReviewsForProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        const pid = String(action.meta.arg.productId);
        if (!state.data[pid]) state.data[pid] = [];
        if (action.payload) state.data[pid].push(action.payload);
      })
      .addCase(replyToReview.fulfilled, (state, action) => {
        const reviewId = action.payload.reviewId;
        Object.values(state.data).forEach(reviewList => {
          const index = reviewList.findIndex(r => r.id === reviewId);
          if (index !== -1) {
            // action.payload.reply is the updated review object
            reviewList[index] = action.payload.reply as any;
          }
        });
      })
      .addCase(loadUserReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadUserReviews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userReviews = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(loadUserReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const { resetReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
