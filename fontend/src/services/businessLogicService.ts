// src/services/businessLogicService.ts
// ═══════════════════════════════════════════════════════
// Frontend service wrappers for "Hidden Logic"
// These functions call backend APIs for:
//   1. FIFO Inventory deduction
//   2. Supplier Debt management
//   3. Audit Logging
// They are called from Redux thunks or admin pages.
// ═══════════════════════════════════════════════════════
import httpClient from '../api/httpClient';

// ─── 1. FIFO Inventory ─────────────────────────────────

/**
 * Deduct stock from a branch product using FIFO logic.
 * Backend will consume batches sorted by exp_date ASC.
 */
export async function deductStockFIFO(branchProductId: string, qty: number) {
  const res = await httpClient.post('/inventory/deduct-fifo', {
    branch_product_id: branchProductId,
    quantity: qty,
  });
  return res.data;
}

/**
 * Add new inventory batch (goods receipt).
 */
export async function addInventoryBatch(payload: {
  branchProductId: string;
  qty: number;
  expDate?: string;
  costPrice?: number;
  supplierId?: string;
  purchaseOrderId?: string;
  batchCode?: string;
}) {
  const res = await httpClient.post('/inventory/add-batch', payload);
  return res.data;
}

// ─── 2. Supplier Debt ───────────────────────────────────

/**
 * Complete a purchase order. If unpaid, debt is auto‑added
 * to the supplier's total_debt on the backend.
 */
export async function completePurchaseOrder(purchaseOrderId: string) {
  const res = await httpClient.post(`/purchase-orders/${purchaseOrderId}/complete`);
  return res.data;
}

/**
 * Record a payment against a supplier's outstanding debt.
 */
export async function paySupplierDebt(supplierId: string, amount: number, notes?: string) {
  const res = await httpClient.post(`/suppliers/${supplierId}/pay-debt`, {
    amount,
    notes,
  });
  return res.data;
}

// ─── 3. Audit Logging ───────────────────────────────────

/**
 * Log an admin activity.
 * Called from admin pages after any create / update / delete.
 */
export async function logActivity(params: {
  action: string;
  entity: string;
  entityId: string | number;
  details?: Record<string, any>;
}) {
  try {
    const res = await httpClient.post('/audit-logs', params);
    return res.data;
  } catch {
    // Audit logging should never block the user
    console.warn('[AuditLog] Failed to log activity:', params);
    return null;
  }
}

/**
 * Fetch audit logs (admin view).
 */
export async function getAuditLogs(filter?: {
  entity?: string;
  action?: string;
  limit?: number;
  skip?: number;
}) {
  try {
    const res = await httpClient.get('/audit-logs', { params: filter });
    return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export const businessLogicService = {
  deductStockFIFO,
  addInventoryBatch,
  completePurchaseOrder,
  paySupplierDebt,
  logActivity,
  getAuditLogs,
};
