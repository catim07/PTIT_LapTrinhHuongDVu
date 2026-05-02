import type { Coupon } from '../types';
import { dataService } from './dataService';

export const cartService = {
  listAllCarts: () => dataService.getCarts(),
  getByUserId: (userId: number, branchId?: string) => dataService.getCart(userId, branchId),
  getAllBranchCarts: () => dataService.getAllBranchCarts(),
  addItem: (userId: number, branchProductId: string, qty: number, branchId?: string, price?: number) =>
    dataService.addToCart(userId, branchProductId, qty, branchId, price),
  updateItem: (branchProductId: string, quantity: number, branchId: string) =>
    dataService.updateCartItem(branchProductId, quantity, branchId),
  removeItem: (branchProductId: string, branchId: string) =>
    dataService.removeCartItem(branchProductId, branchId),
  clearByBranch: (userId: number, branchId: string) =>
    dataService.clearCartByBranch(userId, branchId),
  applyCoupon: (couponCode: string, userId?: number) => dataService.applyCoupon(couponCode, userId),
  removeCoupon: async (_coupon?: Coupon | null) => dataService.removeCoupon(),
};
