import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  street: { type: String, default: '' },
  ward: { type: String, default: '' },
  district: { type: String, default: '' },
  city: { type: String, default: '' },
  full_address: { type: String, default: '' },
  is_default: { type: Boolean, default: false },
  label: { type: String, default: 'home' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Address', addressSchema);
