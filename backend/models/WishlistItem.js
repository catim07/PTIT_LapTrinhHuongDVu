import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  product_id: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
  branch_product_id: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

wishlistItemSchema.index(
  { user_id: 1, product_id: 1, branch_product_id: 1 },
  { unique: true, sparse: true },
);

export default mongoose.model('WishlistItem', wishlistItemSchema);
