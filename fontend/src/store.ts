import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import addressReducer from './slices/addressSlice';
import couponReducer from './slices/couponSlice';
import notificationReducer from './slices/notificationSlice';
import reviewReducer from './slices/reviewSlice';
import supportReducer from './slices/supportSlice';
import promotionsReducer from './slices/promotionsSlice';
import paymentReducer from './slices/paymentSlice';
import loyaltyReducer from './slices/loyaltySlice';
import adminAuthReducer from './admin/slices/adminAuthSlice';
import branchReducer from './slices/branchSlice';
import compareReducer from './slices/compareSlice.ts';

const appReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  product: productReducer,
  order: orderReducer,
  address: addressReducer,
  coupon: couponReducer,
  notification: notificationReducer,
  review: reviewReducer,
  support: supportReducer,
  promotions: promotionsReducer,
  payment: paymentReducer,
  loyalty: loyaltyReducer,
  adminAuth: adminAuthReducer,
  branch: branchReducer,
  compare: compareReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logout') {
    // Clear all user state to prevent data leakage between users,
    // but preserve adminAuth — admin session is independent of user session
    const preservedAdminAuth = state?.adminAuth;
    state = preservedAdminAuth ? { adminAuth: preservedAdminAuth } : undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;