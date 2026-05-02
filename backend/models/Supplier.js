import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  code: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  contact_name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  tax_code: { type: String, default: '' },
  payment_terms: { type: String, default: '' },
  note: { type: String, default: '' },
  total_debt: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

supplierSchema.index({ name: 1 });
supplierSchema.index({ code: 1 }, { unique: false, sparse: true });

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

export default Supplier;
