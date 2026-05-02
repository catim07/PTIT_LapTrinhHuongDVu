import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  response: { type: mongoose.Schema.Types.Mixed },
  status: { type: Number, default: 200 },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL: 24 hours
});

export default mongoose.model('IdempotencyKey', idempotencyKeySchema);
