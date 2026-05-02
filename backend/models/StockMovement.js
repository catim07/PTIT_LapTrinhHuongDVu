import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  branch_id: { type: mongoose.Schema.Types.Mixed, required: true },
  branch_name: { type: String, default: '' },
  product_id: { type: mongoose.Schema.Types.Mixed, required: true },
  product_name: { type: String, default: '' },
  branch_product_id: { type: mongoose.Schema.Types.Mixed, required: true },
  batch_code: { type: String, default: '' },
  movement_type: { 
    type: String, 
    enum: ['inbound', 'outbound', 'sale', 'adjustment', 'transfer', 'return', 'cancel'],
    required: true 
  },
  quantity: { type: Number, required: true }, // positive or negative depending on context but usually positive and we deduct based on movement_type. Actually, it's better if quantity is positive and type controls +/-
  before_stock: { type: Number, required: true },
  after_stock: { type: Number, required: true },
  reference_type: { 
    type: String, 
    enum: ['import_receipt', 'order', 'return', 'manual', 'transfer'],
    default: 'manual' 
  },
  reference_id: { type: mongoose.Schema.Types.Mixed, default: null },
  created_by: { type: mongoose.Schema.Types.Mixed, default: null },
  note: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

stockMovementSchema.index({ branch_product_id: 1, created_at: -1 });
stockMovementSchema.index({ branch_id: 1, product_id: 1 });
stockMovementSchema.index({ reference_id: 1, reference_type: 1 });

const StockMovement = mongoose.models.StockMovement || mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;
