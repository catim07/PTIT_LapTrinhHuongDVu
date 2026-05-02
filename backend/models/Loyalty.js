import mongoose from 'mongoose';

const loyaltyTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, default: 'earn', enum: ['earn', 'redeem', 'adjust', 'expire'] },
  points: { type: Number, required: true },
  source: { type: String, default: 'purchase' },
  description: { type: String, default: '' },
  order_id: { type: mongoose.Schema.Types.Mixed, default: null },
  balance_after: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at' } });

const loyaltyRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, default: 'earn' },
  points_per_unit: { type: Number, default: 0 },
  min_order_value: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
export const LoyaltyRule = mongoose.model('LoyaltyRule', loyaltyRuleSchema);
