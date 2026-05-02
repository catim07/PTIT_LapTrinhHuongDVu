// backend/services/supplierService.js
// ═══════════════════════════════════════════════════════
// Supplier Debt Management
// When a Purchase Order is completed without payment,
// the amount is auto-added to the supplier's total_debt.
// ═══════════════════════════════════════════════════════
import mongoose from 'mongoose';

// ─── Supplier model ───
const supplierSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  contact_name:  { type: String, default: '' },
  email:         { type: String, default: '' },
  phone:         { type: String, default: '' },
  address:       { type: String, default: '' },
  tax_code:      { type: String, default: '' },
  total_debt:    { type: Number, default: 0 },
  is_active:     { type: Boolean, default: true },
}, { timestamps: true });

const Supplier =
  mongoose.models.Supplier ||
  mongoose.model('Supplier', supplierSchema);

// ─── Purchase Order model ───
const purchaseOrderSchema = new mongoose.Schema({
  supplier_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  branch_id:      { type: mongoose.Schema.Types.Mixed, default: null },
  items: [{
    branch_product_id: mongoose.Schema.Types.Mixed,
    product_name:      String,
    quantity:          Number,
    cost_price:       Number,
  }],
  total_amount:   { type: Number, default: 0 },
  payment_status: { type: String, default: 'unpaid', enum: ['unpaid', 'partial', 'paid'] },
  paid_amount:    { type: Number, default: 0 },
  status:         { type: String, default: 'draft', enum: ['draft', 'confirmed', 'received', 'cancelled'] },
  received_date:  { type: Date, default: null },
  notes:          { type: String, default: '' },
  created_by:     { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  mongoose.model('PurchaseOrder', purchaseOrderSchema);

/**
 * Mark a Purchase Order as "received" (goods-in).
 * If it has NOT been fully paid, automatically add the
 * unpaid portion to the supplier's total_debt.
 *
 * @param {string} purchaseOrderId
 * @returns {{ order: PurchaseOrder, debtAdded: number }}
 */
export async function completePurchaseOrder(purchaseOrderId) {
  const order = await PurchaseOrder.findById(purchaseOrderId);
  if (!order) throw new Error('Purchase order not found');
  if (order.status === 'received') throw new Error('Purchase order already received');

  order.status = 'received';
  order.received_date = new Date();
  await order.save();

  // Calculate unpaid portion
  const unpaid = order.total_amount - (order.paid_amount || 0);
  let debtAdded = 0;

  if (unpaid > 0 && order.payment_status !== 'paid') {
    // Add to supplier's total_debt
    await Supplier.findByIdAndUpdate(order.supplier_id, {
      $inc: { total_debt: unpaid },
    });
    debtAdded = unpaid;
  }

  return { order, debtAdded };
}

/**
 * Record a payment against a supplier's debt.
 */
export async function paySupplierDebt(supplierId, amount, notes = '') {
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) throw new Error('Supplier not found');

  supplier.total_debt = Math.max(0, supplier.total_debt - amount);
  await supplier.save();

  return { supplier, paidAmount: amount, remainingDebt: supplier.total_debt };
}

export { Supplier, PurchaseOrder };
export default { completePurchaseOrder, paySupplierDebt, Supplier, PurchaseOrder };
