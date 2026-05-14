import mongoose from 'mongoose';

const importOrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.Mixed, required: true },
  branch_product_id: { type: mongoose.Schema.Types.Mixed, default: null },
  sku: { type: String, default: '' },
  product_name: { type: String, default: '' },
  quantity_ordered: { type: Number, required: true, min: 1 },
  quantity_received: { type: Number, default: 0, min: 0 },
  unit_cost: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, default: 0, min: 0 },
  batch_code: { type: String, default: '' },
  expiry_date: { type: Date, default: null },
  note: { type: String, default: '' },
}, { _id: true });

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  by: { type: mongoose.Schema.Types.Mixed, default: null },
  at: { type: Date, default: Date.now },
}, { _id: false });

const importOrderSchema = new mongoose.Schema({
  order_code: { type: String, required: true, unique: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  branch_id: { type: mongoose.Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['draft', 'ordered', 'partially_received', 'received', 'cancelled'],
    default: 'draft',
  },
  expected_date: { type: Date, default: null },
  ordered_date: { type: Date, default: null },
  received_date: { type: Date, default: null },
  currency: { type: String, default: 'VND' },
  items: { type: [importOrderItemSchema], default: [] },
  total_amount: { type: Number, default: 0 },
  total_received_amount: { type: Number, default: 0 },
  note: { type: String, default: '' },
  timeline: { type: [timelineSchema], default: [] },
  created_by: { type: mongoose.Schema.Types.Mixed, default: null },
  updated_by: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

importOrderSchema.index({ branch_id: 1, status: 1, created_at: -1 });
importOrderSchema.index({ supplier_id: 1, created_at: -1 });

const ImportOrder = mongoose.models.ImportOrder || mongoose.model('ImportOrder', importOrderSchema);

export default ImportOrder;
