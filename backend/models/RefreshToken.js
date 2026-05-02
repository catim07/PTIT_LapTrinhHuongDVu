import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  is_revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '30d' } // TTL: 30 days
});

export default mongoose.model('RefreshToken', refreshTokenSchema);
