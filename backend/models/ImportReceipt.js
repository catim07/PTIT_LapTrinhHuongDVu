import mongoose from 'mongoose';

const importReceiptItemSchema = new mongoose.Schema({
  import_order_item_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  product_id: { type: mongoose.Schema.Types.Mixed, required: true },
  branch_product_id: { type: mongoose.Schema.Types.Mixed, required: true },
  product_name: { type: String, default: '' },
  quantity_received: { type: Number, required: true, min: 1 },
  unit_cost: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, default: 0 },
  batch_code: { type: String, default: '' },
  expiry_date: { type: Date, default: null },
  note: { type: String, default: '' },
}, { _id: true });

const importReceiptSchema = new mongoose.Schema({
  receipt_code: { type: String, required: true, unique: true },
  import_order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportOrder', required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  branch_id: { type: mongoose.Schema.Types.Mixed, required: true },
  received_date: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'confirmed', 'cancelled'], default: 'confirmed' },
  items: { type: [importReceiptItemSchema], default: [] },
  total_amount: { type: Number, default: 0 },
  note: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.Mixed, default: null },
  updated_by: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

importReceiptSchema.index({ receipt_code: 1 });
importReceiptSchema.index({ import_order_id: 1, created_at: -1 });
importReceiptSchema.index({ branch_id: 1, created_at: -1 });

const ImportReceipt = mongoose.models.ImportReceipt || mongoose.model('ImportReceipt', importReceiptSchema);

export default ImportReceipt;
