import mongoose from 'mongoose';

const viewedHistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  product_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  branch_product_id: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
  product_name: { type: String, default: '' },
  product_image: { type: String, default: '' },
  price: { type: Number, default: 0 },
  original_price: { type: Number, default: 0 },
  category: { type: String, default: '' },
  view_count: { type: Number, default: 1 },
  viewed_at: { type: Date, default: Date.now, index: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

viewedHistorySchema.index(
  { user_id: 1, product_id: 1, branch_product_id: 1 },
  { unique: true },
);

viewedHistorySchema.index({ user_id: 1, viewed_at: -1 });
viewedHistorySchema.index({ user_id: 1, product_id: 1 });

export default mongoose.model('ViewedHistory', viewedHistorySchema);
