import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
  manager: { type: String, default: '' },
  is_active: { type: Boolean, default: true },
  operating_hours: { type: String, default: '08:00 - 22:00' },
  coordinates: { lat: Number, lng: Number },
  coverage_radius_km: { type: Number, default: 5 },
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);
