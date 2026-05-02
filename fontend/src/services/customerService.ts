import type { User } from '../types';
import { dataService } from './dataService';

export const customerService = {
  list: () => dataService.getUsers(),
  getDetail: (userId: number) => dataService.getUser(userId),
  update: (userId: number, payload: Partial<User>) => dataService.updateUserProfile(userId, payload),
  toggleStatus: (userId: number) => dataService.toggleUserStatus(userId),
  resetPassword: (userId: number) => dataService.resetUserPassword(userId),
  adjustPoints: (userId: number, points: number, reason: string) => dataService.adjustUserPoints(userId, points, reason),
  updateMembership: (userId: number, level: string) => dataService.updateUserMembership(userId, level),
  listAddresses: (userId: number) => dataService.getUserAddresses(userId),
  listReviews: (userId: number) => dataService.getUserReviews(userId),
  listWishlist: (userId: number) => dataService.getUserWishlist(userId),
  listTickets: (userId: number) => dataService.getUserTickets(userId),
  listCouponUsage: (userId: number) => dataService.getUserCouponUsage(userId),
  listLoyaltyTransactions: (userId: number) => dataService.getUserLoyaltyTransactions(userId),
  listLoginHistory: (userId: number) => dataService.getUserLoginHistory(userId),
};
