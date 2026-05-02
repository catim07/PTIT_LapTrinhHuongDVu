import Address from '../models/Address.js';

export const list = async (req, res) => {
  try {
    const userId = (req.user?.role_id !== 3 && req.query.user_id) ? req.query.user_id : req.userId;
    const data = await Address.find({ $or: [{ user_id: userId }, { user_id: String(userId) }] }).sort('-is_default');
    return res.json({ success: true, data });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const create = async (req, res) => {
  try {
    const userId = (req.user?.role_id !== 3 && req.body.user_id) ? req.body.user_id : req.userId;
    if (req.body.is_default) await Address.updateMany({ $or: [{ user_id: userId }, { user_id: String(userId) }] }, { is_default: false });
    const addr = await Address.create({ ...req.body, user_id: String(userId) });
    return res.status(201).json({ success: true, data: addr, message: 'Thêm địa chỉ thành công' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const update = async (req, res) => {
  try {
    const addr = await Address.findById(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.user?.role_id === 3 && String(addr.user_id) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    
    if (req.body.is_default) await Address.updateMany({ user_id: addr.user_id }, { is_default: false });
    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const remove = async (req, res) => {
  try {
    const addr = await Address.findById(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.user?.role_id === 3 && String(addr.user_id) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    await Address.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Đã xóa địa chỉ' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const setDefault = async (req, res) => {
  try {
    const addr = await Address.findById(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.user?.role_id === 3 && String(addr.user_id) !== String(req.userId)) return res.status(403).json({ success: false, message: 'Forbidden' });
    await Address.updateMany({ $or: [{ user_id: addr.user_id }, { user_id: String(addr.user_id) }] }, { is_default: false });
    addr.is_default = true;
    await addr.save();
    return res.json({ success: true, data: addr });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};
