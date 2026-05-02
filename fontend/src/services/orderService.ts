import type { Order } from '../types';
import { dataService } from './dataService';

export const orderService = {
  list: (branchId?: string) => dataService.getOrders(branchId),
  getDetail: (id: string) => dataService.getOrder(id),
  createOrder: (payload: Partial<Order>) => dataService.createOrder(payload),
  createFromCart: (payload: Partial<Order> & Record<string, any>) => dataService.createOrderFromCart(payload),
  create: (payload: Partial<Order>) => dataService.createOrder(payload),
  calculateCheckout: (payload: Record<string, any>) => dataService.calculateCheckout(payload),
  previewCheckout: (payload: Record<string, any>) => dataService.previewCheckout(payload),
  cancel: (id: string, reason: string) => dataService.cancelOrder(id, reason),
  trackOrder: (id: string) => dataService.trackOrder(id),
  track: (id: string) => dataService.trackOrder(id),
  updateStatus: (id: string, status: string, note?: string) => dataService.updateOrderStatus(id, status, note),
  reorder: (id: string) => dataService.reorderItems(id),
  refund: (id: string, reason: string) => dataService.refundOrder(id, reason),
  getInvoice: (id: string) => dataService.getInvoice(id),
  assignTrackingNumber: (id: string, trackingNumber: string, courier?: string) => dataService.assignTrackingNumber(id, trackingNumber, courier),
};
