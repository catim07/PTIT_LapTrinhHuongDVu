import Supplier from '../models/Supplier.js';
import { logActivity } from '../services/auditService.js';

const toQuery = (req) => {
  const q = {};
  if (req.query?.search) {
    const rx = { $regex: String(req.query.search).trim(), $options: 'i' };
    q.$or = [{ name: rx }, { code: rx }, { contact_name: rx }, { email: rx }, { phone: rx }];
  }
  if (req.query?.is_active === 'true') q.is_active = true;
  if (req.query?.is_active === 'false') q.is_active = false;
  return q;
};

export const list = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const query = toQuery(req);
    const [total, data] = await Promise.all([
      Supplier.countDocuments(query),
      Supplier.find(query).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
    ]);
    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const detail = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    return res.json({ success: true, data: supplier });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { name, code, contact_name, email, phone, address, tax_code, payment_terms, note } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: 'Supplier name is required' });

    const supplier = await Supplier.create({
      name,
      code: code || `SUP-${Date.now().toString(36).toUpperCase()}`,
      contact_name: contact_name || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      tax_code: tax_code || '',
      payment_terms: payment_terms || '',
      note: note || '',
      is_active: true,
    });

    await logActivity({
      userId: req.userId,
      userName: req.user?.full_name || req.user?.username || 'Admin',
      action: 'CREATE',
      entity: 'supplier',
      entityId: supplier._id,
      details: { new_data: supplier.toObject() },
      ip: req.ip,
    });

    return res.status(201).json({ success: true, data: supplier, message: 'Supplier created' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const existed = await Supplier.findById(req.params.id);
    if (!existed) return res.status(404).json({ success: false, message: 'Supplier not found' });

    const updates = { ...req.body };
    delete updates._id;
    const updated = await Supplier.findByIdAndUpdate(req.params.id, updates, { new: true });

    await logActivity({
      userId: req.userId,
      userName: req.user?.full_name || req.user?.username || 'Admin',
      action: 'UPDATE',
      entity: 'supplier',
      entityId: updated._id,
      details: { old_data: existed.toObject(), new_data: updated.toObject() },
      ip: req.ip,
    });

    return res.json({ success: true, data: updated, message: 'Supplier updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    await Supplier.findByIdAndDelete(req.params.id);

    await logActivity({
      userId: req.userId,
      userName: req.user?.full_name || req.user?.username || 'Admin',
      action: 'DELETE',
      entity: 'supplier',
      entityId: req.params.id,
      details: { old_data: supplier.toObject() },
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
