import Permission from '../models/Permission.js';
import { ensureRbacSeed } from '../services/rbacService.js';

export const list = async (_req, res) => {
  try {
    await ensureRbacSeed();
    const data = await Permission.find({ is_active: true }).sort({ group: 1, key: 1 });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
