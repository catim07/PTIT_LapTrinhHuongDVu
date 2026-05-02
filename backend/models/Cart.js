import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branch_id: { type: String, required: true },
  items: [{
    branch_product_id: { type: mongoose.Schema.Types.Mixed, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    price: { type: Number, default: 0 },
    unit_price: { type: Number, default: 0 },
    product_name: { type: String, default: '' },
    product_image: { type: String, default: '' },
  }],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Compound index: one cart per user per branch
cartSchema.index({ user_id: 1, branch_id: 1 }, { unique: true });

export default mongoose.model('Cart', cartSchema);
