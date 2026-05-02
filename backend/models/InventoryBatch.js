import mongoose from 'mongoose';

const inventoryBatchSchema = new mongoose.Schema({
  branch_product_id: { type: mongoose.Schema.Types.Mixed, required: true },
  batch_code: { type: String, default: '' },
  quantity: { type: Number, required: true, default: 0 },
  exp_date: { type: Date, default: null },
  manufacture_date: { type: Date, default: null },
  received_date: { type: Date, default: Date.now },
  cost_price: { type: Number, default: 0 },
  supplier_id: { type: mongoose.Schema.Types.Mixed, default: null },
  supplier_name: { type: String, default: '' },
  note: { type: String, default: '' },
  purchase_order_id: { type: mongoose.Schema.Types.Mixed, default: null },
  import_receipt_id: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

inventoryBatchSchema.index({ branch_product_id: 1, exp_date: 1, received_date: 1 });
inventoryBatchSchema.index({ batch_code: 1 });

const InventoryBatch = mongoose.models.InventoryBatch || mongoose.model('InventoryBatch', inventoryBatchSchema);

export default InventoryBatch;
