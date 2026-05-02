import { AuditLog } from '../models/Misc.js';

const buildQuery = (req) => {
  const q = {};
  if (req.query?.user_id) q.user_id = req.query.user_id;
  if (req.query?.entity) q.entity = req.query.entity;
  if (req.query?.action) q.action = req.query.action;
  if (req.query?.branch_id) q['details.branch_id'] = req.query.branch_id;
  if (req.query?.severity) q['details.status'] = req.query.severity.toUpperCase();
  if (req.query?.keyword) {
    const k = new RegExp(req.query.keyword, 'i');
    q.$or = [{ action: k }, { entity: k }, { 'details.message': k }];
  }
  if (req.query?.from || req.query?.to) {
    q.created_at = {};
    if (req.query.from) q.created_at.$gte = new Date(req.query.from);
    if (req.query.to) q.created_at.$lte = new Date(req.query.to);
  }
  return q;
};

export const list = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));
    const query = buildQuery(req);

    const [total, data] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
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
    const item = await AuditLog.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Audit log not found' });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
