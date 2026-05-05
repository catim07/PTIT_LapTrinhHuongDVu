import mongoose from 'mongoose';

const compareSummarySchema = new mongoose.Schema({
  product_ids: {
    type: [String],
    required: true,
    index: true,
  },
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  locale: {
    type: String,
    required: true,
  },
  summary: {
    type: mongoose.Schema.Types.Mixed
  },
  access_count: {
    type: Number,
    default: 1
  },
  last_accessed_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('CompareSummary', compareSummarySchema);
