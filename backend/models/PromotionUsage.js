import mongoose from 'mongoose';

const promotionClaimSchema = new mongoose.Schema({
  promotion_id: { type: mongoose.Schema.Types.Mixed, required: true },
  user_id: { type: mongoose.Schema.Types.Mixed, required: true },
  branch_id: { type: mongoose.Schema.Types.Mixed, default: null },
  claimed_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['claimed', 'used', 'expired', 'cancelled'], default: 'claimed' },
  used_order_id: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

promotionClaimSchema.index({ promotion_id: 1, user_id: 1, created_at: -1 });
promotionClaimSchema.index({ user_id: 1, status: 1 });

const promotionUsageSchema = new mongoose.Schema({
  promotion_id: { type: mongoose.Schema.Types.Mixed, required: true },
  user_id: { type: mongoose.Schema.Types.Mixed, default: null },
  order_id: { type: mongoose.Schema.Types.Mixed, required: true },
  discount_amount: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

promotionUsageSchema.index({ promotion_id: 1, user_id: 1, created_at: -1 });

export const PromotionClaim = mongoose.model('PromotionClaim', promotionClaimSchema);
export const PromotionUsage = mongoose.model('PromotionUsage', promotionUsageSchema);
